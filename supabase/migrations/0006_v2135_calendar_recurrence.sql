-- Monkey Checks v2.13.5 — Calendar recurring activities
-- Run after 0001, 0002, 0003, 0004 and 0005.

alter table public.calendar_events
  add column if not exists recurrence_type text not null default 'none',
  add column if not exists recurrence_days integer[],
  add column if not exists recurrence_until date,
  add column if not exists recurrence_group_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'calendar_events_recurrence_type_check'
  ) then
    alter table public.calendar_events
      add constraint calendar_events_recurrence_type_check
      check (recurrence_type in ('none', 'daily', 'custom_days'));
  end if;
end $$;

create index if not exists calendar_events_recurrence_idx
  on public.calendar_events(user_id, recurrence_type, event_date);

create index if not exists calendar_events_recurrence_until_idx
  on public.calendar_events(user_id, recurrence_until)
  where recurrence_until is not null;
