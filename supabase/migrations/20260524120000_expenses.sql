-- Expenses per user, optionally linked to projects.

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  category text not null,
  amount numeric(12, 2) not null,
  currency char(3) not null default 'USD',
  date date not null,
  vendor text,
  notes text,
  receipt_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expenses_category_check check (
    category in (
      'housing',
      'software',
      'travel',
      'meals',
      'marketing',
      'other'
    )
  ),
  constraint expenses_amount_positive check (amount > 0),
  constraint expenses_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint expenses_vendor_length check (
    vendor is null or char_length(vendor) <= 200
  ),
  constraint expenses_notes_length check (
    notes is null or char_length(notes) <= 8000
  )
);

comment on table public.expenses is 'Freelancer business expenses; optional project link for job costing.';

create index expenses_user_date_idx on public.expenses (user_id, date desc);

create index expenses_project_idx on public.expenses (project_id)
where project_id is not null;

alter table public.expenses enable row level security;

create policy "expenses_select_own"
  on public.expenses
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "expenses_insert_own"
  on public.expenses
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "expenses_update_own"
  on public.expenses
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "expenses_delete_own"
  on public.expenses
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on table public.expenses to authenticated;

create trigger expenses_set_updated_at
  before update on public.expenses
  for each row
  execute function public.handle_profiles_updated_at();

create or replace function public.enforce_expense_integrity()
returns trigger
language plpgsql
as $$
begin
  if new.project_id is not null then
    if not exists (
      select 1
      from public.projects p
      where p.id = new.project_id
        and p.user_id = new.user_id
    ) then
      raise exception 'expenses.project_id must belong to expenses.user_id';
    end if;
  end if;

  return new;
end;
$$;

create trigger expenses_enforce_integrity
  before insert or update on public.expenses
  for each row
  execute function public.enforce_expense_integrity();

-- Receipt files: {auth.uid()}/{expense_id}.{ext}
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'expense-receipts',
  'expense-receipts',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "expense_receipts_select_public"
  on storage.objects
  for select
  to public
  using (bucket_id = 'expense-receipts');

create policy "expense_receipts_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'expense-receipts'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );

create policy "expense_receipts_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'expense-receipts'
    and split_part(name, '/', 1) = (select auth.uid())::text
  )
  with check (
    bucket_id = 'expense-receipts'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );

create policy "expense_receipts_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'expense-receipts'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );
