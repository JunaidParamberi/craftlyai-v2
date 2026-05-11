-- Projects per freelancer, linked to CRM clients; tasks belong to a project.

-- Ensure referenced client belongs to the same user as the project row.
create or replace function public.enforce_project_client_owner()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  client_owner uuid;
begin
  select c.user_id into client_owner
  from public.clients c
  where c.id = new.client_id;

  if client_owner is null then
    raise exception 'client_id does not reference an existing client';
  end if;

  if client_owner <> new.user_id then
    raise exception 'client_id must belong to the same user as the project';
  end if;

  return new;
end;
$$;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete restrict,
  title text not null,
  status text not null,
  budget numeric(14, 2),
  spent numeric(14, 2),
  start_date date,
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_status_check check (
    status in ('planning', 'active', 'on_hold', 'completed', 'archived')
  ),
  constraint projects_budget_non_negative check (
    budget is null or budget >= 0
  ),
  constraint projects_spent_non_negative check (
    spent is null or spent >= 0
  )
);

comment on table public.projects is 'Freelancer projects linked to a CRM client; status and optional budget dates.';

create index projects_user_id_idx on public.projects (user_id);
create index projects_client_id_idx on public.projects (client_id);

create trigger projects_enforce_client_owner
  before insert or update on public.projects
  for each row
  execute function public.enforce_project_client_owner();

alter table public.projects enable row level security;

create policy "projects_select_own"
  on public.projects
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "projects_insert_own"
  on public.projects
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "projects_update_own"
  on public.projects
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "projects_delete_own"
  on public.projects
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on table public.projects to authenticated;

create trigger projects_set_updated_at
  before update on public.projects
  for each row
  execute function public.handle_profiles_updated_at();

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  status text not null,
  due_date date,
  priority text not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_status_check check (
    status in ('todo', 'in_progress', 'done', 'cancelled')
  ),
  constraint tasks_priority_check check (
    priority in ('low', 'medium', 'high')
  )
);

comment on table public.tasks is 'Tasks scoped to a project; RLS via parent project user_id.';

create index tasks_project_id_idx on public.tasks (project_id);
create index tasks_project_created_idx on public.tasks (project_id, created_at);

alter table public.tasks enable row level security;

create policy "tasks_select_own"
  on public.tasks
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = tasks.project_id
        and p.user_id = (select auth.uid())
    )
  );

create policy "tasks_insert_own"
  on public.tasks
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.projects p
      where p.id = tasks.project_id
        and p.user_id = (select auth.uid())
    )
  );

create policy "tasks_update_own"
  on public.tasks
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = tasks.project_id
        and p.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.projects p
      where p.id = tasks.project_id
        and p.user_id = (select auth.uid())
    )
  );

create policy "tasks_delete_own"
  on public.tasks
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = tasks.project_id
        and p.user_id = (select auth.uid())
    )
  );

grant select, insert, update, delete on table public.tasks to authenticated;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row
  execute function public.handle_profiles_updated_at();
