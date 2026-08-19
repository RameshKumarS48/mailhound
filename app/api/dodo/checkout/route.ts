import { NextRequest, NextResponse } from 'next/server'
import { dodo, CREDIT_PACKS } from '@/lib/dodo'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { packId } = await req.json()
  const pack = CREDIT_PACKS.find(p => p.id === packId)
  if (!pack) return NextResponse.json({ error: 'Invalid pack' }, { status: 400 })

  const session = await dodo.checkoutSessions.create({
    product_cart: [{ product_id: pack.productId, quantity: 1 }],
    customer: { email: user.email!, name: user.email! },
    metadata: { userId: user.id, credits: String(pack.credits) },
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  })

  return NextResponse.json({ url: session.checkout_url })
}
