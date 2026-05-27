-- v2.28.1.21 — Favicon + Supabase Column Hotfix
-- Ensures the same-day penalty scope column exists in production.
-- Safe/idempotent: no RLS or policy changes required.

alter table public.calendar_events
  add column if not exists reactivation_penalty_date date null;

create index if not exists calendar_events_reactivation_penalty_date_idx
on public.calendar_events (user_id, reactivation_penalty_date)
where reactivation_penalty_date is not null;
