-- Optional work note, pause/resume accounting for open timers.

alter table public.time_entries
  add column if not exists description text,
  add column if not exists paused_at timestamptz,
  add column if not exists total_paused_seconds integer not null default 0;

comment on column public.time_entries.description is 'Optional note for what was worked on (timer or manual).';

comment on column public.time_entries.paused_at is 'When set, timer is paused since this instant; ended_at still null until stop.';

comment on column public.time_entries.total_paused_seconds is 'Completed pause intervals (seconds); current pause adds wall time minus this on stop.';

alter table public.time_entries
  add constraint time_entries_total_paused_non_negative check (total_paused_seconds >= 0);
