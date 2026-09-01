import { NextRequest, NextResponse } from 'next/server'
import { verifyEmail } from '@/lib/verification'
import { verifyApiKey } from '@/lib/api-keys'
import { debitCreditAdmin } from '@/lib/credits'

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
  return NextResponse.json(result)
}
