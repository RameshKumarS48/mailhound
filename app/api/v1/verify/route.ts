import { NextRequest, NextResponse } from 'next/server'
import { verifyEmail } from '@/lib/verification'
import { verifyApiKey } from '@/lib/api-keys'
import { debitCreditAdmin } from '@/lib/credits'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Missing or invalid email param' }, { status: 400 })
  }

  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid Authorization header. Expected: Authorization: Bearer mhk_...' },
      { status: 401 }
    )
  }

  const rawKey = authHeader.slice(7)
  const identity = await verifyApiKey(rawKey)
  if (!identity) {
    return NextResponse.json({ error: 'Invalid or revoked API key' }, { status: 401 })
  }

  const debit = await debitCreditAdmin(identity.userId, 1)
  if (debit === 'insufficient') {
    return NextResponse.json(
      { error: 'Insufficient credits. Purchase more at https://mailhound.xyz/developers' },
      { status: 402 }
    )
  }
  if (debit === 'error') {
    return NextResponse.json({ error: 'Credit system error. Please try again.' }, { status: 500 })
  }

  const result = await verifyEmail(email)

  // Persist the check so it appears in the user's history (job_id NULL = a
  // single check). No session here, so use the service-role client keyed by the
  // API-key owner. Best-effort: never fail or delay a paid verification.
  try {
    await createAdminClient().from('verification_results').insert({
      user_id: identity.userId,
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

  return NextResponse.json(result)
}
