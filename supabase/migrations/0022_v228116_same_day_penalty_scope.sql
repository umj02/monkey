-- v2.28.1.16 — Same-Day Penalty Scope Fix
-- Scopes reactivation penalties to the date where the event actually expired.
-- Safe/idempotent: no RLS or policy changes required.

alter table public.calendar_events
  add column if not exists reactivation_penalty_date date null;

create index if not exists calendar_events_reactivation_penalty_date_idx
on public.calendar_events (user_id, reactivation_penalty_date)
where reactivation_penalty_date is not null;
