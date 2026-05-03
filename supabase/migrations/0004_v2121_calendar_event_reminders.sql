-- Monkey Checks v2.12.1 — link calendar alerts to calendar events
-- Run after 0001, 0002 and 0003.

alter table public.reminders
  add column if not exists calendar_event_id uuid references public.calendar_events(id) on delete cascade;

create unique index if not exists reminders_calendar_event_unique
  on public.reminders(calendar_event_id)
  where calendar_event_id is not null;

create index if not exists reminders_calendar_event_idx
  on public.reminders(calendar_event_id);
