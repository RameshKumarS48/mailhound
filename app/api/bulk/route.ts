import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { debitCredit, getBalance } from '@/lib/credits'
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

  const { data: job, error: jobError } = await supabase
    .from('verification_jobs')
    .insert({ user_id: user.id, status: 'queued', total: emails.length })
    .select()
    .single()

  if (jobError || !job) {
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }

  // Debit upfront
  await debitCredit(user.id, emails.length)

  // Process small lists inline; large lists are queued (Phase 2: BullMQ worker)
  if (emails.length <= 100) {
    processJobInline(job.id, emails, user.id).catch(console.error)
  } else {
    // TODO Phase 2: enqueue to BullMQ / Upstash Queue
    await supabase
      .from('verification_jobs')
      .update({ status: 'queued' })
      .eq('id', job.id)
  }

  return NextResponse.json({ jobId: job.id, total: emails.length, status: 'processing' })
}

async function processJobInline(jobId: string, emails: string[], userId: string) {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  await supabase.from('verification_jobs').update({ status: 'processing' }).eq('id', jobId)

  let valid = 0, risky = 0, invalid = 0
  for (const email of emails) {
    const result = await verifyEmail(email)
    if (result.status === 'valid') valid++
    else if (result.status === 'risky') risky++
    else invalid++

    await supabase.from('verification_results').insert({
      job_id: jobId,
      user_id: userId,
      email: result.email,
      status: result.status,
      reason: result.reason,
      score: result.score,
      raw_checks: result.checks,
    })
  }

  await supabase
    .from('verification_jobs')
    .update({ status: 'completed', valid, risky, invalid, completed_at: new Date().toISOString() })
    .eq('id', jobId)
}
