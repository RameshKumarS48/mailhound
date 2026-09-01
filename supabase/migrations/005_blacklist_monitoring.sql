-- Feature #3 — continuous blacklist monitoring.
-- Saved targets a user watches, plus an append-only scan history.

create table if not exists public.monitored_domains (
  id               uuid        default gen_random_uuid() primary key,
  user_id          uuid        references auth.users(id) on delete cascade not null,
  target           text        not null,            -- domain or IP being watched
  label            text,
  is_active        boolean     not null default true,
  last_scanned_at  timestamptz,
  last_status      text,                            -- 'clean' | 'listed'
  last_listed_on   jsonb       not null default '[]'::jsonb,
  created_at       timestamptz not null default now(),
  unique (user_id, target)
);

alter table public.monitored_domains enable row level security;

-- Owner-only reads/writes from the app; the cron uses the service-role client,
-- which bypasses RLS.
create policy "Users manage own monitored domains"
  on public.monitored_domains for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists monitored_domains_user_idx
  on public.monitored_domains (user_id, created_at desc);
create index if not exists monitored_domains_active_idx
  on public.monitored_domains (is_active) where is_active;

create table if not exists public.blacklist_scans (
  id                   uuid        default gen_random_uuid() primary key,
  monitored_domain_id  uuid        references public.monitored_domains(id) on delete cascade not null,
  scanned_at           timestamptz not null default now(),
  listed_count         integer     not null default 0,
  total_checks         integer     not null default 0,
  results              jsonb       not null default '[]'::jsonb,
  new_listings         jsonb       not null default '[]'::jsonb
);

alter table public.blacklist_scans enable row level security;

-- Read a scan only if you own its parent monitored domain. Writes come from the
-- service-role cron (bypasses RLS); no client insert policy is granted.
create policy "Users read own scans"
  on public.blacklist_scans for select
  using (
    exists (
      select 1 from public.monitored_domains m
      where m.id = blacklist_scans.monitored_domain_id
        and m.user_id = auth.uid()
    )
  );

create index if not exists blacklist_scans_domain_idx
  on public.blacklist_scans (monitored_domain_id, scanned_at desc);
