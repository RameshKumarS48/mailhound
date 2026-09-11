import { NextRequest, NextResponse } from 'next/server'
import { after } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { debitCreditAdmin, getBalance, creditUser } from '@/lib/credits'
import { verifyEmail } from '@/lib/verification'
import Papa from 'papaparse'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in to use bulk verification' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

  const text = await file.text()
  const { data: rows, errors } = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  })

  if (errors.length > 0 && rows.length === 0) {
    return NextResponse.json({ error: 'Could not parse CSV file' }, { status: 400 })
  }

  const firstRow = rows[0] ?? {}
  const emailColumn =
    Object.keys(firstRow).find(k => k.toLowerCase().includes('email')) ??
    Object.keys(firstRow)[0]

  const emails = rows
    .map(r => r[emailColumn]?.trim())
    .filter((e): e is string => Boolean(e))

  if (emails.length === 0) {
    return NextResponse.json({ error: 'No emails found. Make sure your CSV has an "email" column.' }, { status: 400 })
  }
  if (emails.length > 100_000) {
    return NextResponse.json({ error: 'Maximum 100,000 emails per upload' }, { status: 400 })
  }

  const balance = await getBalance(user.id)
  if (balance < emails.length) {
    return NextResponse.json({
      error: `Need ${emails.length} credits, you have ${balance}. Top up at /pricing.`,
    }, { status: 402 })
  }

  // Debit atomically BEFORE creating the job and honor the result. The balance
  // check above is not atomic — two concurrent uploads can both pass it — so the
  // atomic RPC is the real guard. Ignoring it (the old behavior) let a losing
  // race run a whole bulk job for free.
  const debit = await debitCreditAdmin(user.id, emails.length)
  if (debit === 'insufficient') {
    return NextResponse.json({
      error: `Not enough credits for ${emails.length} emails. Top up at /pricing.`,
    }, { status: 402 })
  }
  if (debit === 'error') {
    return NextResponse.json({ error: 'Could not reserve credits, please try again' }, { status: 500 })
  }

  const { data: job, error: jobError } = await supabase
    .from('verification_jobs')
    .insert({ user_id: user.id, status: 'processing', total: emails.length })
    .select()
    .single()

  if (jobError || !job) {
    // Credits were already taken but no job exists to consume them — refund so
    // the debit isn't silently lost. Log if the refund itself fails so a lost
    // balance is at least observable.
    await creditUser(user.id, emails.length, 'Refund — bulk job failed to start').catch(err =>
      console.error(`bulk: refund failed for ${user.id} (${emails.length} credits)`, err),
    )
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }

  // after() runs after the response is sent — Vercel Fluid Compute keeps the
  // function alive until this completes, no matter how long the list is.
  after(async () => {
    await processJob(job.id, emails, user.id)
  })

  return NextResponse.json({ jobId: job.id, total: emails.length, status: 'processing' })
}

async function processJob(jobId: string, emails: string[], userId: string) {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  let valid = 0, risky = 0, invalid = 0
  // Emails whose results were actually persisted — the basis for the refund
  // below. Credits were debited for all of `emails` up front; whatever we never
  // verify gets returned so the user is only charged for work delivered.
  let processed = 0
  let failed = false

  // Process in chunks of 20 so we don't overwhelm the SMTP worker
  const CHUNK = 20
  try {
    for (let i = 0; i < emails.length; i += CHUNK) {
      const chunk = emails.slice(i, i + CHUNK)
      // allSettled so one email that throws (worker hiccup, bad address) can't
      // reject the whole chunk and abort the job. Rejections are logged and
      // simply not persisted — they fall into the refund at the end.
      const settled = await Promise.allSettled(chunk.map(e => verifyEmail(e)))
      const results = []
      for (const s of settled) {
        if (s.status === 'fulfilled') results.push(s.value)
        else console.error(`bulk: verifyEmail rejected in job ${jobId}`, s.reason)
      }

      for (const result of results) {
        if (result.status === 'valid') valid++
        else if (result.status === 'risky') risky++
        else invalid++
      }

      if (results.length > 0) {
        const { error } = await supabase.from('verification_results').insert(
          results.map(r => ({
            job_id:  jobId,
            user_id: userId,
            email:   r.email,
            status:  r.status,
            reason:  r.reason,
            score:   r.score,
            raw_checks: r.checks,
          }))
        )
        if (error) throw new Error(`results insert failed: ${error.message}`)
        processed += results.length
      }

      // Update running counts so the dashboard stays live
      await supabase
        .from('verification_jobs')
        .update({ valid, risky, invalid })
        .eq('id', jobId)
    }
  } catch (err) {
    // Any unexpected throw used to leave the job stuck in 'processing' forever
    // with the credits already spent. Fall through to the terminal-status write
    // and refund instead.
    failed = true
    console.error(`bulk: processJob ${jobId} aborted after ${processed}/${emails.length}`, err)
  }

  // Always leave the job in a terminal state so pollers stop waiting on it.
  const { error: finalizeError } = await supabase
    .from('verification_jobs')
    .update({
      status: failed ? 'failed' : 'completed',
      valid, risky, invalid,
      completed_at: new Date().toISOString(),
    })
    .eq('id', jobId)
  if (finalizeError) {
    console.error(`bulk: failed to finalize job ${jobId} status`, finalizeError)
  }

  // Refund credits for anything we never verified. Keyed on the job id so a
  // re-invocation of processJob can't refund twice (credit_ledger.reference is
  // unique in prod — migration 008).
  const refund = emails.length - processed
  if (refund > 0) {
    await creditUser(
      userId,
      refund,
      `Refund — ${refund} of ${emails.length} bulk emails not verified`,
      `bulk_refund:${jobId}`,
    ).catch(err => console.error(`bulk: refund failed for ${userId} (${refund} credits)`, err))
  }
}
