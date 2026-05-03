-- Monkey Checks v2.10 — Calendar optional end time
-- Safe migration: adds optional end_time to calendar_events for activities that span several hours.
alter table public.calendar_events
  add column if not exists end_time time;
