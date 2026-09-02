import { NextRequest, NextResponse } from 'next/server'
import { findEmail } from '@/lib/verification/finder'
import { verifyApiKey } from '@/lib/api-keys'
import { debitCreditAdmin } from '@/lib/credits'
import { EMAIL_FINDER_COST } from '@/lib/pricing'

// Metered email finder. Runs full SMTP verification and — critically — charges
// ONLY on a verified hit (result.found). Catch-all domains, misses, and an
// unreachable worker return a result but cost nothing.
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const firstName = p.get('firstName')?.trim() ?? ''
  const lastName = p.get('lastName')?.trim() ?? ''
  const domain = p.get('domain')?.trim() ?? ''

  if (!firstName || !domain) {
    return NextResponse.json({ error: 'firstName and domain are required' }, { status: 400 })
  }

  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid Authorization header. Expected: Authorization: Bearer mhk_...' },
      { status: 401 }
    )
  }

  const identity = await verifyApiKey(authHeader.slice(7))
  if (!identity) {
    return NextResponse.json({ error: 'Invalid or revoked API key' }, { status: 401 })
  }

  const result = await findEmail({ firstName, lastName, domain, verify: true })

  // Only a verified deliverable address costs credits.
  if (result.found) {
    const debit = await debitCreditAdmin(
      identity.userId,
      EMAIL_FINDER_COST,
      `Email finder — ${result.email}`
    )
    if (debit === 'insufficient') {
      return NextResponse.json(
        { error: 'Insufficient credits. Purchase more at https://mailhound.xyz/developers' },
        { status: 402 }
      )
    }
    if (debit === 'error') {
      return NextResponse.json({ error: 'Credit system error. Please try again.' }, { status: 500 })
    }
  }

  return NextResponse.json({ ...result, charged: result.found ? EMAIL_FINDER_COST : 0 })
}
