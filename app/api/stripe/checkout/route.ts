import { NextResponse } from 'next/server'

// Stripe has been replaced by Dodo Payments. Use /api/dodo/checkout instead.
export function POST() {
  return NextResponse.json({ error: 'Use /api/dodo/checkout' }, { status: 410 })
}
