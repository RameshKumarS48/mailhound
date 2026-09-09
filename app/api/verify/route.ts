import { NextRequest, NextResponse } from 'next/server'
import { verifyEmail } from '@/lib/verification'
import { createClient } from '@/lib/supabase/server'
import { debitCreditAdmin } from '@/lib/credits'

// Simple in-memory rate limiter: 10 requests per IP per minute for anonymous users
const anonBucket = new Map<string, { count: number; resetAt: number }>()
const ANON_LIMIT = 10
const WINDOW_MS  = 60_000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = anonBucket.get(ip)
  if (!entry || now > entry.resetAt) {
    anonBucket.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  if (entry.count >= ANON_LIMIT) return true
  entry.count++
  return false
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const email = body?.email
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const debit = await debitCreditAdmin(user.id, 1)
    if (debit === 'insufficient') {
      return NextResponse.json({ error: 'Insufficient credits. Top up at /pricing.' }, { status: 402 })
    }
    if (debit === 'error') {
      return NextResponse.json({ error: 'Credit system error. Please try again.' }, { status: 500 })
    }
  } else {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Rate limit reached. Sign up for 300 free verifications.' },
        { status: 429 }
      )
    }
  }

  const result = await verifyEmail(email)

  // Persist single checks so they show up in the user's history (job_id NULL
  // distinguishes a single check from a bulk-job row). Best-effort only: the
  // user already paid the credit, so a history write must never fail or delay
  // the response. Anonymous checks are not stored.
  if (user) {
    try {
      await supabase.from('verification_results').insert({
        user_id: user.id,
        job_id: null,
        email: result.email,
        status: result.status,
        reason: result.reason,
        score: result.score,
        raw_checks: result.checks,
      })
    } catch {
      // swallow — history is non-critical
    }
  }

  return NextResponse.json(result)
}
