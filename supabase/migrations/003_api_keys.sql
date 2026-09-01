create table public.api_keys (
  id           uuid        default gen_random_uuid() primary key,
  user_id      uuid        references auth.users(id) on delete cascade not null,
  key_hash     text        not null unique,
  key_prefix   text        not null,
  name         text        not null,
  is_active    boolean     not null default true,
  created_at   timestamptz default now(),
  last_used_at timestamptz
);

alter table public.api_keys enable row level security;

create policy "Users manage own keys"
  on public.api_keys for all using (auth.uid() = user_id);

create index on public.api_keys (key_hash);
create index on public.api_keys (user_id, created_at desc);
