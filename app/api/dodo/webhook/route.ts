import { NextRequest, NextResponse } from 'next/server'
import { Webhooks } from '@dodopayments/nextjs'
import { creditUser } from '@/lib/credits'

let handler: ReturnType<typeof Webhooks> | null = null

function getHandler() {
  if (handler) return handler
  const webhookKey = process.env.DODO_WEBHOOKS_SECRET
  if (!webhookKey) return null
  handler = Webhooks({
    webhookKey,
    onPaymentSucceeded: async (payload) => {
      const { userId, credits } = payload.data.metadata as Record<string, string>
      if (userId && credits) {
        await creditUser(
          userId,
          Number(credits),
          `Credit pack — ${Number(credits).toLocaleString()} credits`,
        )
      }
    },
  })
  return handler
}

export async function POST(req: NextRequest) {
  const h = getHandler()
  if (!h) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }
  return h(req)
}
