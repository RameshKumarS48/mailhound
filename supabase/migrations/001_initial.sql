-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  plan text default 'free',
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile + grant free credits on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');

  insert into public.credit_ledger (user_id, amount, type, description)
  values (new.id, 300, 'credit', 'Welcome — 300 free credits (no card required)');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Credit ledger (append-only, positive = credit, negative = debit)
create table public.credit_ledger (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount integer not null,
  type text not null check (type in ('credit', 'debit')),
  description text not null,
  created_at timestamptz default now()
);
alter table public.credit_ledger enable row level security;
create policy "Users view own ledger" on public.credit_ledger for select using (auth.uid() = user_id);

-- Bulk verification jobs
create table public.verification_jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text not null default 'queued'
    check (status in ('queued', 'processing', 'completed', 'failed')),
  total integer not null default 0,
  valid integer not null default 0,
  risky integer not null default 0,
  invalid integer not null default 0,
  created_at timestamptz default now(),
  completed_at timestamptz
);
alter table public.verification_jobs enable row level security;
create policy "Users view own jobs" on public.verification_jobs for select using (auth.uid() = user_id);
create policy "Users insert own jobs" on public.verification_jobs for insert with check (auth.uid() = user_id);
create policy "Users update own jobs" on public.verification_jobs for update using (auth.uid() = user_id);

-- Individual results per job
create table public.verification_results (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references public.verification_jobs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade not null,
  email text not null,
  status text not null check (status in ('valid', 'risky', 'invalid')),
  reason text not null,
  score integer not null default 0,
  raw_checks jsonb,
  created_at timestamptz default now()
);
alter table public.verification_results enable row level security;
create policy "Users view own results" on public.verification_results
  for select using (auth.uid() = user_id);
create policy "Users insert own results" on public.verification_results
  for insert with check (auth.uid() = user_id);

-- Indexes
create index on public.credit_ledger (user_id, created_at desc);
create index on public.verification_jobs (user_id, created_at desc);
create index on public.verification_results (job_id);
create index on public.verification_results (user_id, created_at desc);
