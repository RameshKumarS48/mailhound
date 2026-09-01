import { createAdminClient } from '@/lib/supabase/admin'

export interface SubscriptionRow {
  id: string
  user_id: string
  dodo_subscription_id: string
  product_id: string | null
  plan: string | null
  status: string
  current_period_end: string | null
}

// A subscription counts as active if Dodo marks it active and the paid period
// hasn't lapsed (a cancelled-but-not-yet-expired sub keeps access until then).
function isActive(sub: Pick<SubscriptionRow, 'status' | 'current_period_end'>): boolean {
  if (sub.status !== 'active') return false
  if (!sub.current_period_end) return true
  return new Date(sub.current_period_end).getTime() > Date.now()
}

export async function hasActiveWatchPlan(userId: string): Promise<boolean> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, current_period_end, plan')
    .eq('user_id', userId)
    .eq('plan', 'watch')
  if (error || !data) return false
  return data.some(isActive)
}

// Upsert a subscription from a Dodo webhook payload. Keyed on the Dodo
// subscription id so renewals/cancellations update the same row.
export async function upsertSubscription(input: {
  userId: string
  dodoSubscriptionId: string
  productId?: string | null
  plan?: string | null
  status: string
  currentPeriodEnd?: string | null
}): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('subscriptions').upsert(
    {
      user_id: input.userId,
      dodo_subscription_id: input.dodoSubscriptionId,
      product_id: input.productId ?? null,
      plan: input.plan ?? 'watch',
      status: input.status,
      current_period_end: input.currentPeriodEnd ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'dodo_subscription_id' }
  )
  if (error) throw new Error(`upsertSubscription failed: ${error.message}`)
}
