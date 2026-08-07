import { createClient } from '@/lib/supabase/server'

export const FREE_CREDITS = 300
export const FREE_CREDITS_WORK_EMAIL = 600

export async function getBalance(userId: string): Promise<number> {
  const supabase = await createClient()
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

export async function creditUser(userId: string, amount: number, description: string) {
  const supabase = await createClient()
  await supabase.from('credit_ledger').insert({
    user_id: userId,
    amount,
    type: 'credit',
    description,
  })
}
