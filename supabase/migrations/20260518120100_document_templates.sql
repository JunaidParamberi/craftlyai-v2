-- Document templates: system-seeded (user_id NULL, is_system true) or user-saved (user_id set).
-- Users read both their own and all system templates; writes restricted to non-system rows they own.

create table public.document_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  type public.document_type not null default 'other',
  name text not null,
  description text,
  content_json jsonb not null default '{}'::jsonb,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint document_templates_name_length check (
    char_length(name) >= 1 and char_length(name) <= 200
  ),
  constraint document_templates_description_length check (
    description is null or char_length(description) <= 500
  ),
  constraint document_templates_system_user_mutex check (
    (is_system = true and user_id is null)
    or (is_system = false and user_id is not null)
  )
);

comment on table public.document_templates is
  'Reusable Tiptap document templates; system defaults (user_id NULL) plus user-saved.';

create index document_templates_user_id_idx on public.document_templates (user_id);
create index document_templates_type_idx on public.document_templates (type);
create index document_templates_is_system_idx on public.document_templates (is_system);

alter table public.document_templates enable row level security;

-- System templates are visible to every authenticated user; user templates only to their owner.
create policy "document_templates_select_visible"
  on public.document_templates
  for select
  to authenticated
  using (
    is_system = true
    or (select auth.uid()) = user_id
  );

create policy "document_templates_insert_own"
  on public.document_templates
  for insert
  to authenticated
  with check (
    is_system = false
    and (select auth.uid()) = user_id
  );

create policy "document_templates_update_own"
  on public.document_templates
  for update
  to authenticated
  using (
    is_system = false
    and (select auth.uid()) = user_id
  )
  with check (
    is_system = false
    and (select auth.uid()) = user_id
  );

create policy "document_templates_delete_own"
  on public.document_templates
  for delete
  to authenticated
  using (
    is_system = false
    and (select auth.uid()) = user_id
  );

grant select, insert, update, delete on table public.document_templates to authenticated;

create trigger document_templates_set_updated_at
  before update on public.document_templates
  for each row
  execute function public.handle_profiles_updated_at();
