-- v2.28.1.15 — Reactivation Penalty Supabase Metrics Consistency
-- Adds persistent reactivation penalty fields for calendar events.
-- Safe/idempotent: no RLS or policy changes required.

alter table public.calendar_events
  add column if not exists reactivation_count integer not null default 0,
  add column if not exists reactivation_penalty integer not null default 0,
  add column if not exists expired_at timestamp with time zone null,
  add column if not exists last_reactivated_at timestamp with time zone null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'calendar_events_reactivation_count_check'
      and conrelid = 'public.calendar_events'::regclass
  ) then
    alter table public.calendar_events
      add constraint calendar_events_reactivation_count_check
      check (reactivation_count >= 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'calendar_events_reactivation_penalty_check'
      and conrelid = 'public.calendar_events'::regclass
  ) then
    alter table public.calendar_events
      add constraint calendar_events_reactivation_penalty_check
      check (reactivation_penalty >= 0 and reactivation_penalty <= 100) not valid;
  end if;
end $$;

create index if not exists calendar_events_reactivation_idx
on public.calendar_events (user_id, event_date, reactivation_count);
