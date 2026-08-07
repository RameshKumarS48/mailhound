import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { creditUser } from '@/lib/credits'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { userId, credits } = session.metadata ?? {}
    if (userId && credits) {
      await creditUser(
        userId,
        Number(credits),
        `Credit pack — ${Number(credits).toLocaleString()} credits`,
      )
    }
  }

  return NextResponse.json({ received: true })
}
