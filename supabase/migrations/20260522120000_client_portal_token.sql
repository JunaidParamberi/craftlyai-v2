-- Per-client public portal link (no login). Access via service role on public routes.

create extension if not exists pgcrypto schema extensions;

alter table public.clients
  add column if not exists portal_token text unique;

comment on column public.clients.portal_token is
  'Opaque token for /portal/[token] client hub; regenerate invalidates old links.';

update public.clients
set portal_token = encode(extensions.gen_random_bytes(24), 'hex')
where portal_token is null;
