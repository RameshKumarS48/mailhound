-- Feature #3 — recurring "Watch" plans (Dodo subscription SKU).
-- One row per Dodo subscription; the app reads it to gate monitoring.

create table if not exists public.subscriptions (
  id                   uuid        default gen_random_uuid() primary key,
  user_id              uuid        references auth.users(id) on delete cascade not null,
  dodo_subscription_id text        not null unique,
  product_id           text,
  plan                 text,                       -- e.g. 'watch'
  status               text        not null,       -- 'active' | 'cancelled' | 'expired' | ...
  current_period_end   timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

-- Owner-read only; all writes come from the Dodo webhook via the service-role
-- client (bypasses RLS). No client write policy is granted.
create policy "Users read own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create index if not exists subscriptions_user_idx
  on public.subscriptions (user_id, status);
