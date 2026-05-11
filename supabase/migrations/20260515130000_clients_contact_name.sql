-- Primary contact for B2B clients (optional). List/detail title remains `name` (company or person).

alter table public.clients
  add column contact_name text;

comment on column public.clients.contact_name is
  'Optional primary contact when `name` is a company or team.';
