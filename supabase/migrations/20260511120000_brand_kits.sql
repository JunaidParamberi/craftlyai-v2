-- Brand kit (onboarding step 2). One row per user; profiles.brand_kit_id links for quick lookup.

create table public.brand_kits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  logo_url text,
  primary_color text not null default '#0a0a0a',
  secondary_color text not null default '#fafafa',
  font text not null default 'Inter',
  email_signature text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint brand_kits_user_id_key unique (user_id)
);

comment on table public.brand_kits is 'Logo, colors, font, email signature for documents and UI.';

alter table public.profiles
  add column brand_kit_id uuid references public.brand_kits (id) on delete set null;

create index profiles_brand_kit_id_idx on public.profiles (brand_kit_id)
  where brand_kit_id is not null;

alter table public.brand_kits enable row level security;

create policy "brand_kits_select_own"
  on public.brand_kits
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "brand_kits_insert_own"
  on public.brand_kits
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "brand_kits_update_own"
  on public.brand_kits
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "brand_kits_delete_own"
  on public.brand_kits
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on table public.brand_kits to authenticated;

create trigger brand_kits_set_updated_at
  before update on public.brand_kits
  for each row
  execute function public.handle_profiles_updated_at();

-- Public bucket: logo URLs stored as public URLs in brand_kits.logo_url
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brand-logos',
  'brand-logos',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Objects live at: {auth.uid()}/{filename}
create policy "brand_logos_select_public"
  on storage.objects
  for select
  to public
  using (bucket_id = 'brand-logos');

create policy "brand_logos_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'brand-logos'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );

create policy "brand_logos_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'brand-logos'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );

create policy "brand_logos_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'brand-logos'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );
