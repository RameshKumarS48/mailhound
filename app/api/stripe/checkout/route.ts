import { NextRequest, NextResponse } from 'next/server'
import { stripe, CREDIT_PACKS } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { packId } = await req.json()
  const pack = CREDIT_PACKS.find(p => p.id === packId)
  if (!pack) return NextResponse.json({ error: 'Invalid pack' }, { status: 400 })

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: user.email,
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: pack.price,
        product_data: {
          name: `Mailhound — ${pack.label}`,
          description: `${pack.credits.toLocaleString()} email verifications. Never expire.`,
        },
      },
      quantity: 1,
    }],
    metadata: {
      userId: user.id,
      packId: pack.id,
      credits: String(pack.credits),
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  })

  return NextResponse.json({ url: session.url })
}
