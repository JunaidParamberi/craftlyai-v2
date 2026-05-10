-- CRM clients per freelancer (onboarding step 3 + future clients/projects).

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  company text,
  address text,
  currency char(3),
  notes text,
  health_score smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clients_currency_len check (
    currency is null or char_length(trim(currency::text)) = 3
  ),
  constraint clients_health_score_range check (
    health_score is null or (health_score >= 0 and health_score <= 100)
  )
);

comment on table public.clients is 'Freelancer CRM: clients for invoicing, portals, and relationship insights.';

create index clients_user_id_idx on public.clients (user_id);

alter table public.clients enable row level security;

create policy "clients_select_own"
  on public.clients
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "clients_insert_own"
  on public.clients
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "clients_update_own"
  on public.clients
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "clients_delete_own"
  on public.clients
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on table public.clients to authenticated;

create trigger clients_set_updated_at
  before update on public.clients
  for each row
  execute function public.handle_profiles_updated_at();
