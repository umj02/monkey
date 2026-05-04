-- Monkey Checks v2.13.6
-- Calendar nested activities + Today sync support.
-- Adds a simple done flag so calendar activities can appear in Hoy and be checked off.

alter table public.calendar_events
  add column if not exists done boolean not null default false;

update public.calendar_events
set done = false
where done is null;
