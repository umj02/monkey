-- Monkey Checks v2.5.9 — Data Stability Fix
-- Optional but recommended after v2.5.9 deploy.
-- It merges duplicated time blocks, removes exact duplicated tasks/notes/calendar events,
-- and adds unique indexes to prevent accidental duplicate inserts.

create extension if not exists pgcrypto;

-- 1) Merge duplicated time blocks per user/date/time/title.
with ranked_blocks as (
  select
    id,
    first_value(id) over (
      partition by user_id, block_date, start_time, lower(trim(title))
      order by created_at asc, id asc
    ) as keep_id,
    row_number() over (
      partition by user_id, block_date, start_time, lower(trim(title))
      order by created_at asc, id asc
    ) as rn
  from public.time_blocks
), moved_tasks as (
  update public.tasks t
  set block_id = rb.keep_id,
      updated_at = now()
  from ranked_blocks rb
  where t.block_id = rb.id
    and rb.rn > 1
  returning t.id
)
delete from public.time_blocks tb
using ranked_blocks rb
where tb.id = rb.id
  and rb.rn > 1;

-- 2) Remove duplicated tasks in the same block with the same title.
with ranked_tasks as (
  select
    id,
    row_number() over (
      partition by user_id, block_id, lower(trim(title))
      order by done desc, updated_at desc, created_at asc, id asc
    ) as rn
  from public.tasks
)
delete from public.tasks t
using ranked_tasks rt
where t.id = rt.id
  and rt.rn > 1;

-- 3) Remove exact duplicated notes.
with ranked_notes as (
  select
    id,
    row_number() over (
      partition by user_id, lower(trim(title)), md5(coalesce(body, '')), color
      order by updated_at desc, created_at asc, id asc
    ) as rn
  from public.notes
)
delete from public.notes n
using ranked_notes rn
where n.id = rn.id
  and rn.rn > 1;

-- 4) Remove duplicated calendar events by date/time/title/color.
with ranked_events as (
  select
    id,
    row_number() over (
      partition by user_id, event_date, start_time, lower(trim(title)), color
      order by updated_at desc, created_at asc, id asc
    ) as rn
  from public.calendar_events
)
delete from public.calendar_events e
using ranked_events re
where e.id = re.id
  and re.rn > 1;

-- 5) Defensive unique indexes. They prevent future duplicates even if a client retries.
create unique index if not exists time_blocks_user_date_time_title_unique
on public.time_blocks (user_id, block_date, start_time, lower(trim(title)));

create unique index if not exists tasks_user_block_title_unique
on public.tasks (user_id, block_id, lower(trim(title)));

create unique index if not exists notes_user_title_body_color_unique
on public.notes (user_id, lower(trim(title)), md5(coalesce(body, '')), color);

create unique index if not exists calendar_events_user_date_time_title_color_unique
on public.calendar_events (user_id, event_date, start_time, lower(trim(title)), color);
