import { NextRequest, NextResponse } from 'next/server'
import { verifyEmail } from '@/lib/verification'
import { createClient } from '@/lib/supabase/server'
import { debitCredit } from '@/lib/credits'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const email = body?.email
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const ok = await debitCredit(user.id, 1)
    if (!ok) {
      return NextResponse.json({ error: 'Insufficient credits. Top up at /pricing.' }, { status: 402 })
    }
  }
  // Unauthenticated: free tool — rate limiting handled by Vercel Edge config

  const result = await verifyEmail(email)
  return NextResponse.json(result)
}
