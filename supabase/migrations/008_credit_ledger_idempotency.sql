-- Webhook idempotency for credit grants. Dodo redelivers webhooks (retries after
-- a non-2xx, or network blips), and `onPaymentSucceeded` unconditionally inserted
-- a positive ledger row each time — so one purchase could credit a buyer twice.
--
-- Add an optional `reference` that carries the originating payment id. A plain
-- UNIQUE index dedupes non-null references (Postgres treats NULLs as distinct,
-- so all debit rows and legacy credits with a null reference are unaffected).
-- creditUser() upserts with ON CONFLICT (reference) DO NOTHING, making a repeated
-- payment webhook a no-op — atomic even under concurrent redelivery.

alter table public.credit_ledger add column if not exists reference text;

create unique index if not exists credit_ledger_reference_key
  on public.credit_ledger (reference);
