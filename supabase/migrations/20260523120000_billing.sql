-- supabase/migrations/20260523120000_billing.sql

-- 1. Add plan_tier to profiles
alter table profiles
  add column if not exists plan_tier text not null default 'free'
    check (plan_tier in ('free','starter','pro','agency'));

-- 2. Create subscriptions table
create table if not exists subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  lemon_squeezy_id    text,
  plan                text not null default 'free'
                        check (plan in ('free','starter','pro','agency')),
  status              text not null default 'active'
                        check (status in ('active','cancelled','expired','past_due')),
  current_period_end  timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- 3. Unique: one subscription per user
create unique index if not exists subscriptions_user_id_key on subscriptions(user_id);

-- 4. RLS
alter table subscriptions enable row level security;

create policy "Users read own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

create policy "Users insert own subscription"
  on subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users update own subscription"
  on subscriptions for update
  using (auth.uid() = user_id);

-- 5. Seed a free subscription for every existing profile
insert into subscriptions (user_id, plan, status)
  select id, 'free', 'active'
  from profiles
  on conflict (user_id) do nothing;

-- 6. updated_at trigger
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger subscriptions_updated_at
  before update on subscriptions
  for each row execute procedure set_updated_at();
