-- credit_ledger had RLS enabled but only a SELECT policy, so authenticated
-- users could not insert their own debit rows — every logged-in verification
-- failed with "Insufficient credits". Allow users to append their own rows.
-- (Purchased credits are written by the Dodo webhook via the service-role
-- client, which bypasses RLS and is unaffected by this policy.)
create policy "Users insert own ledger" on public.credit_ledger
  for insert with check (auth.uid() = user_id);
