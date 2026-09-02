import { NextRequest, NextResponse } from 'next/server'
import { Webhooks } from '@dodopayments/nextjs'
import { creditUser } from '@/lib/credits'
import { upsertSubscription } from '@/lib/subscriptions'

let handler: ReturnType<typeof Webhooks> | null = null

// Pull the fields we persist off a Dodo subscription webhook payload. Metadata
// (userId, plan) is the one we set at checkout; it rides along on every
// subscription lifecycle event.
function subFields(data: Record<string, unknown>) {
  const metadata = (data.metadata ?? {}) as Record<string, string>
  const next = data.next_billing_date as string | Date | null | undefined
  return {
    userId: metadata.userId,
    plan: metadata.plan ?? 'watch',
    dodoSubscriptionId: String(data.subscription_id ?? ''),
    productId: (data.product_id as string | undefined) ?? null,
    currentPeriodEnd: next ? new Date(next).toISOString() : null,
  }
}

function getHandler() {
  if (handler) return handler
  const webhookKey = process.env.DODO_WEBHOOKS_SECRET
  if (!webhookKey) return null
  handler = Webhooks({
    webhookKey,
    onPaymentSucceeded: async (payload) => {
      const { userId, credits } = payload.data.metadata as Record<string, string>
      // Subscription payments have no `credits` metadata — skip; the subscription
      // events below grant access instead.
      if (userId && credits) {
        await creditUser(
          userId,
          Number(credits),
          `Credit pack — ${Number(credits).toLocaleString()} credits`,
        )
      }
    },
    onSubscriptionActive: async (payload) => {
      const f = subFields(payload.data as Record<string, unknown>)
      if (f.userId && f.dodoSubscriptionId) {
        await upsertSubscription({ ...f, status: 'active' })
      }
    },
    onSubscriptionRenewed: async (payload) => {
      const f = subFields(payload.data as Record<string, unknown>)
      if (f.userId && f.dodoSubscriptionId) {
        await upsertSubscription({ ...f, status: 'active' })
      }
    },
    onSubscriptionCancelled: async (payload) => {
      const f = subFields(payload.data as Record<string, unknown>)
      if (f.userId && f.dodoSubscriptionId) {
        await upsertSubscription({ ...f, status: 'cancelled' })
      }
    },
    onSubscriptionExpired: async (payload) => {
      const f = subFields(payload.data as Record<string, unknown>)
      if (f.userId && f.dodoSubscriptionId) {
        await upsertSubscription({ ...f, status: 'expired' })
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
