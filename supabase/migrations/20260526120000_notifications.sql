-- In-app notifications (bell inbox). Document events in v1; task/overdue types reserved.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (
    type in (
      'invoice_paid',
      'invoice_overdue',
      'quote_approved',
      'quote_declined',
      'proposal_approved',
      'doc_sent',
      'task_due',
      'task_overdue'
    )
  ),
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  action_taken_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

create unique index notifications_dedupe_idx
  on public.notifications (user_id, type, ((payload ->> 'entity_id')));

alter table public.notifications enable row level security;

create policy "Users read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "Users insert own notifications"
  on public.notifications for insert
  with check (auth.uid() = user_id);

create trigger notifications_updated_at
  before update on public.notifications
  for each row execute procedure set_updated_at();

-- Backfill last 30 days from documents (labels simplified; amounts omitted)
insert into public.notifications (user_id, type, payload, created_at)
select
  d.user_id,
  'invoice_paid',
  jsonb_build_object(
    'href', '/documents/' || d.id::text,
    'label',
    'Invoice #' || coalesce(d.invoice_number, d.title) || ' paid'
      || coalesce(' · ' || c.name, ''),
    'entity_id', d.id::text
  ),
  d.paid_at
from public.documents d
left join public.clients c on c.id = d.client_id
where d.type = 'invoice'
  and d.paid_at is not null
  and d.paid_at >= now() - interval '30 days'
on conflict do nothing;

insert into public.notifications (user_id, type, payload, created_at)
select
  d.user_id,
  'doc_sent',
  jsonb_build_object(
    'href', '/documents/' || d.id::text,
    'label',
    case d.type
      when 'invoice' then 'Invoice'
      when 'quote' then 'Quote'
      when 'proposal' then 'Proposal'
      else 'Document'
    end
      || ' #'
      || coalesce(
        case d.type
          when 'invoice' then d.invoice_number
          when 'quote' then d.quote_number
          when 'proposal' then d.proposal_number
          else d.title
        end,
        d.title
      )
      || ' sent to '
      || coalesce(c.name, 'client'),
    'entity_id', d.id::text
  ),
  d.sent_at
from public.documents d
left join public.clients c on c.id = d.client_id
where d.sent_at is not null
  and d.sent_at >= now() - interval '30 days'
on conflict do nothing;

insert into public.notifications (user_id, type, payload, created_at)
select
  d.user_id,
  'quote_approved',
  jsonb_build_object(
    'href', '/documents/' || d.id::text,
    'label',
    'Quote #' || coalesce(d.quote_number, d.title) || ' approved by '
      || coalesce(c.name, 'client'),
    'entity_id', d.id::text
  ),
  d.approved_at
from public.documents d
left join public.clients c on c.id = d.client_id
where d.type = 'quote'
  and d.approved_at is not null
  and d.approved_at >= now() - interval '30 days'
on conflict do nothing;

insert into public.notifications (user_id, type, payload, created_at)
select
  d.user_id,
  'quote_declined',
  jsonb_build_object(
    'href', '/documents/' || d.id::text,
    'label',
    'Quote #' || coalesce(d.quote_number, d.title) || ' declined by '
      || coalesce(c.name, 'client'),
    'entity_id', d.id::text
  ),
  d.declined_at
from public.documents d
left join public.clients c on c.id = d.client_id
where d.type = 'quote'
  and d.declined_at is not null
  and d.declined_at >= now() - interval '30 days'
on conflict do nothing;

insert into public.notifications (user_id, type, payload, created_at)
select
  d.user_id,
  'proposal_approved',
  jsonb_build_object(
    'href', '/documents/' || d.id::text,
    'label',
    'Proposal #' || coalesce(d.proposal_number, d.title) || ' approved by '
      || coalesce(c.name, 'client'),
    'entity_id', d.id::text
  ),
  d.approved_at
from public.documents d
left join public.clients c on c.id = d.client_id
where d.type = 'proposal'
  and d.approved_at is not null
  and d.approved_at >= now() - interval '30 days'
on conflict do nothing;
