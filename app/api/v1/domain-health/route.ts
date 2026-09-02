import { NextRequest, NextResponse } from 'next/server'
import { checkDomainHealth } from '@/lib/verification/domain-health'
import { verifyApiKey } from '@/lib/api-keys'
import { debitCreditAdmin } from '@/lib/credits'
import { DOMAIN_HEALTH_COST } from '@/lib/pricing'

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get('domain')?.trim().toLowerCase()
  if (!domain) {
    return NextResponse.json({ error: 'Missing or invalid domain param' }, { status: 400 })
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

  const debit = await debitCreditAdmin(identity.userId, DOMAIN_HEALTH_COST, `Domain health — ${domain}`)
  if (debit === 'insufficient') {
    return NextResponse.json(
      { error: 'Insufficient credits. Purchase more at https://mailhound.xyz/developers' },
      { status: 402 }
    )
  }
  if (debit === 'error') {
    return NextResponse.json({ error: 'Credit system error. Please try again.' }, { status: 500 })
  }

  const result = await checkDomainHealth(domain)
  return NextResponse.json(result)
}
