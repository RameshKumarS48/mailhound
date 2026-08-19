import { NextResponse } from 'next/server'

// Stripe has been replaced by Dodo Payments. Use /api/dodo/webhook instead.
export function POST() {
  return NextResponse.json({ error: 'Use /api/dodo/webhook' }, { status: 410 })
}
