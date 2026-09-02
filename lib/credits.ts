import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const FREE_CREDITS = 300
export const FREE_CREDITS_WORK_EMAIL = 600

export async function getBalance(userId: string): Promise<number> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('credit_ledger')
    .select('amount')
    .eq('user_id', userId)
  return (data ?? []).reduce((sum, row) => sum + (row.amount as number), 0)
}

export async function debitCredit(userId: string, count = 1): Promise<boolean> {
  const balance = await getBalance(userId)
  if (balance < count) return false
  const supabase = await createClient()
  const { error } = await supabase.from('credit_ledger').insert({
    user_id: userId,
    amount: -count,
    type: 'debit',
    description: `Verification — ${count} email${count !== 1 ? 's' : ''}`,
  })
  return !error
}

export type DebitResult = 'ok' | 'insufficient' | 'error'

// Atomic debit via the `debit_credits` Postgres function (migration 007), which
// takes a per-user advisory lock so concurrent requests can't overdraw the
// balance (the old read-then-insert path could). `description` lets metered
// features (domain health, finder, blacklist) label their ledger entries.
// Falls back to the non-atomic path if the RPC isn't deployed yet.
export async function debitCreditAdmin(
  userId: string,
  count = 1,
  description?: string,
): Promise<DebitResult> {
  const supabase = createAdminClient()
  const desc = description ?? `API verification — ${count} email${count !== 1 ? 's' : ''}`

  const { data, error } = await supabase.rpc('debit_credits', {
    p_user_id: userId,
    p_amount: count,
    p_description: desc,
  })
  if (!error) return data === true ? 'ok' : 'insufficient'

  // RPC missing (pre-migration) — fall back to the legacy non-atomic path.
  const missing = error.code === 'PGRST202' || /function .* does not exist/i.test(error.message ?? '')
  if (!missing) return 'error'

  const { data: rows, error: readError } = await supabase
    .from('credit_ledger').select('amount').eq('user_id', userId)
  if (readError) return 'error'
  const balance = (rows ?? []).reduce((sum, row) => sum + (row.amount as number), 0)
  if (balance < count) return 'insufficient'
  const { error: insError } = await supabase.from('credit_ledger').insert({
    user_id: userId,
    amount: -count,
    type: 'debit',
    description: desc,
  })
  return insError ? 'error' : 'ok'
}

// Called from the Dodo webhook (server-to-server, no user session), so it must
// use the service-role client to bypass RLS. Throws on failure so the webhook
// returns non-2xx and Dodo retries rather than silently dropping the credit.
export async function creditUser(userId: string, amount: number, description: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('credit_ledger').insert({
    user_id: userId,
    amount,
    type: 'credit',
    description,
  })
  if (error) throw new Error(`creditUser failed for ${userId}: ${error.message}`)
}
