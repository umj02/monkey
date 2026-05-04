-- Monkey Checks v2.16.1 — Reminder Upsert Fix + Push Runtime QA
-- Run after 0011_v216_background_push_notifications.sql.
--
-- Why this exists:
-- Older builds used `upsert(..., onConflict: "calendar_event_id")` for calendar alerts.
-- Supabase/PostgREST requires a non-partial unique target for that conflict clause.
-- This migration deduplicates any existing linked calendar reminders and creates a
-- full unique index on calendar_event_id. PostgreSQL unique indexes still allow
-- multiple NULL values, so manual reminders without calendar_event_id remain valid.

with ranked as (
  select
    id,
    row_number() over (
      partition by calendar_event_id
      order by updated_at desc nulls last, created_at desc nulls last, id desc
    ) as rn
  from public.reminders
  where calendar_event_id is not null
)
delete from public.reminders r
using ranked d
where r.id = d.id
  and d.rn > 1;

create unique index if not exists reminders_calendar_event_id_unique_full
  on public.reminders(calendar_event_id);

create index if not exists reminders_user_calendar_event_idx
  on public.reminders(user_id, calendar_event_id);
