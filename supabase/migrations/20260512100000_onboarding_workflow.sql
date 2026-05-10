-- Onboarding wizard persistence (skippable brand + completion gate).

alter table public.profiles
  add column if not exists onboarding_brand_skipped boolean not null default false,
  add column if not exists onboarding_completed_at timestamptz;

comment on column public.profiles.onboarding_brand_skipped is 'User chose Skip on brand kit step; distinct from never visiting step 2.';
comment on column public.profiles.onboarding_completed_at is 'User finished step 3 (or skipped to dashboard); gates /protected.';
