-- Time tracking per user, scoped to projects and optional tasks.

create table public.time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete set null,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_seconds integer,
  billed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint time_entries_time_order check (
    ended_at is null or ended_at >= started_at
  ),
  constraint time_entries_duration_non_negative check (
    duration_seconds is null or duration_seconds >= 0
  ),
  constraint time_entries_running_vs_completed check (
    (ended_at is null and duration_seconds is null)
    or (ended_at is not null and duration_seconds is not null)
  )
);

comment on table public.time_entries is 'Freelancer time entries; ended_at null means running timer. billed flags invoiced blocks.';

create index time_entries_user_started_idx on public.time_entries (user_id, started_at desc);

create index time_entries_project_idx on public.time_entries (project_id);

create index time_entries_task_idx on public.time_entries (task_id);

create unique index time_entries_one_running_per_user_idx
  on public.time_entries (user_id)
  where ended_at is null;

alter table public.time_entries enable row level security;

create policy "time_entries_select_own"
  on public.time_entries
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "time_entries_insert_own"
  on public.time_entries
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "time_entries_update_own"
  on public.time_entries
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "time_entries_delete_own"
  on public.time_entries
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on table public.time_entries to authenticated;

create trigger time_entries_set_updated_at
  before update on public.time_entries
  for each row
  execute function public.handle_profiles_updated_at();

-- Ensure project belongs to user_id and optional task matches project (denormalized user_id + FK safety).
create or replace function public.enforce_time_entry_integrity()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.projects p
    where p.id = new.project_id
      and p.user_id = new.user_id
  ) then
    raise exception 'time_entries.project_id must belong to time_entries.user_id';
  end if;

  if new.task_id is not null then
    if not exists (
      select 1
      from public.tasks t
      where t.id = new.task_id
        and t.project_id = new.project_id
    ) then
      raise exception 'time_entries.task_id must be a task on the given project';
    end if;
  end if;

  return new;
end;
$$;

create trigger time_entries_enforce_integrity
  before insert or update on public.time_entries
  for each row
  execute function public.enforce_time_entry_integrity();
