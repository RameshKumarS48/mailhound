import { NextRequest, NextResponse } from 'next/server'
import { dnsblCheck } from '@/lib/verification/dnsbl'
import { verifyApiKey } from '@/lib/api-keys'
import { debitCreditAdmin } from '@/lib/credits'
import { BLACKLIST_CHECK_COST } from '@/lib/pricing'

// Metered blacklist check — full per-zone detail including TXT reason strings.
export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get('target')?.trim().toLowerCase()
    ?? req.nextUrl.searchParams.get('domain')?.trim().toLowerCase()
  if (!target) return NextResponse.json({ error: 'target (domain or IP) required' }, { status: 400 })

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

  const full = await dnsblCheck(target)
  if (full.unavailable) {
    return NextResponse.json(
      { error: 'Blacklist lookup is temporarily unavailable. Please try again shortly.' },
      { status: 503 }
    )
  }

  const debit = await debitCreditAdmin(identity.userId, BLACKLIST_CHECK_COST, `Blacklist check — ${target}`)
  if (debit === 'insufficient') {
    return NextResponse.json(
      { error: 'Insufficient credits. Purchase more at https://mailhound.xyz/developers' },
      { status: 402 }
    )
  }
  if (debit === 'error') {
    return NextResponse.json({ error: 'Credit system error. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ ...full, checkedAt: new Date().toISOString() })
}
