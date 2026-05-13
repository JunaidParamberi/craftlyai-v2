-- Documents: rich-text content (Tiptap JSON) scoped to a user, optionally tied to a client/project.

create type public.document_type as enum ('proposal', 'quote', 'invoice', 'other');
create type public.document_status as enum (
  'draft',
  'sent',
  'viewed',
  'signed',
  'paid',
  'archived'
);

create or replace function public.enforce_document_relations_owner()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  client_owner uuid;
  project_owner uuid;
begin
  if new.client_id is not null then
    select c.user_id into client_owner
    from public.clients c
    where c.id = new.client_id;

    if client_owner is null then
      raise exception 'client_id does not reference an existing client';
    end if;

    if client_owner <> new.user_id then
      raise exception 'client_id must belong to the same user as the document';
    end if;
  end if;

  if new.project_id is not null then
    select p.user_id into project_owner
    from public.projects p
    where p.id = new.project_id;

    if project_owner is null then
      raise exception 'project_id does not reference an existing project';
    end if;

    if project_owner <> new.user_id then
      raise exception 'project_id must belong to the same user as the document';
    end if;
  end if;

  return new;
end;
$$;

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  type public.document_type not null default 'other',
  status public.document_status not null default 'draft',
  title text not null,
  content_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint documents_title_length check (
    char_length(title) >= 1 and char_length(title) <= 300
  )
);

comment on table public.documents is
  'Document Studio: Tiptap rich-text documents (proposals, quotes, invoices) per freelancer.';

create index documents_user_id_idx on public.documents (user_id);
create index documents_client_id_idx on public.documents (client_id);
create index documents_project_id_idx on public.documents (project_id);

create trigger documents_enforce_relations_owner
  before insert or update on public.documents
  for each row
  execute function public.enforce_document_relations_owner();

alter table public.documents enable row level security;

create policy "documents_select_own"
  on public.documents
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "documents_insert_own"
  on public.documents
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "documents_update_own"
  on public.documents
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "documents_delete_own"
  on public.documents
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on table public.documents to authenticated;

create trigger documents_set_updated_at
  before update on public.documents
  for each row
  execute function public.handle_profiles_updated_at();
