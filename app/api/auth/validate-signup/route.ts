import { NextRequest, NextResponse } from 'next/server'
import { checkDisposable } from '@/lib/verification/disposable'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const email = body?.email
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const result = checkDisposable(domain)
  if (!result.passed) {
    return NextResponse.json(
      { error: 'Temporary or disposable email addresses are not allowed. Please use your real email.' },
      { status: 422 }
    )
  }

  return NextResponse.json({ ok: true })
}
