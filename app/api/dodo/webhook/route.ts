import { Webhooks } from '@dodopayments/nextjs'
import { creditUser } from '@/lib/credits'

export const POST = Webhooks({
  webhookKey: process.env.DODO_WEBHOOKS_SECRET!,
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
