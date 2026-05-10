-- public.profiles: one row per auth user (onboarding step 1 + invoicing fields).
-- Maps to CLAUDE.md "users" profile slice; plan_tier etc. come in later migrations.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  company_name text,
  vat_registered boolean not null default false,
  vat_number text,
  address_line1 text,
  address_line2 text,
  address_city text,
  address_region text,
  address_postal_code text,
  address_country char(2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'App profile per auth user (identity, company, VAT, address).';

alter table public.profiles enable row level security;

-- Authenticated users read/update only their row (inserts come from handle_new_user).
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Safety net if a user exists without a profile row (migration ordering / legacy accounts).
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

grant select, insert, update on table public.profiles to authenticated;

create or replace function public.handle_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_profiles_updated_at();

-- New auth users get a profile row (security definer bypasses RLS for this insert).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Backfill profiles for any auth users created before this migration (dev/staging).
insert into public.profiles (id)
select u.id
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);
