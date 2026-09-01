-- Atomic credit debit. The old read-then-insert path in lib/credits.ts is not
-- transactional: two concurrent requests can both pass the balance check and
-- both insert a debit, overdrawing below zero. This function serializes debits
-- per user with an advisory lock and does the check + insert in one transaction.
--
-- Returns true when the debit was applied, false when the balance is too low.

create or replace function public.debit_credits(
  p_user_id uuid,
  p_amount int,
  p_description text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance bigint;
begin
  -- Serialize concurrent debits for this user for the duration of the tx.
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));

  select coalesce(sum(amount), 0) into v_balance
  from public.credit_ledger
  where user_id = p_user_id;

  if v_balance < p_amount then
    return false;
  end if;

  insert into public.credit_ledger (user_id, amount, type, description)
  values (p_user_id, -p_amount, 'debit', p_description);

  return true;
end;
$$;

-- Only the service-role (server-side, no user session) may call this.
revoke all on function public.debit_credits(uuid, int, text) from public;
revoke all on function public.debit_credits(uuid, int, text) from anon;
revoke all on function public.debit_credits(uuid, int, text) from authenticated;
grant execute on function public.debit_credits(uuid, int, text) to service_role;
