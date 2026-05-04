-- Monkey Checks v2.15
-- Recurring Edit/Delete + Unified Activity Types

alter table public.calendar_events
  add column if not exists activity_type_key text;

create table if not exists public.calendar_event_occurrence_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  calendar_event_id uuid not null references public.calendar_events(id) on delete cascade,
  occurrence_date date not null,
  title text,
  start_time time,
  end_time time,
  color text check (color in ('yellow','blue','green','pink','purple','orange')),
  icon_key text,
  activity_type_key text,
  reminder_at text,
  is_cancelled boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, calendar_event_id, occurrence_date)
);

alter table public.calendar_event_occurrence_overrides enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'calendar_event_occurrence_overrides' and policyname = 'calendar_event_occurrence_overrides_select_own') then
    create policy calendar_event_occurrence_overrides_select_own
      on public.calendar_event_occurrence_overrides
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'calendar_event_occurrence_overrides' and policyname = 'calendar_event_occurrence_overrides_insert_own') then
    create policy calendar_event_occurrence_overrides_insert_own
      on public.calendar_event_occurrence_overrides
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'calendar_event_occurrence_overrides' and policyname = 'calendar_event_occurrence_overrides_update_own') then
    create policy calendar_event_occurrence_overrides_update_own
      on public.calendar_event_occurrence_overrides
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'calendar_event_occurrence_overrides' and policyname = 'calendar_event_occurrence_overrides_delete_own') then
    create policy calendar_event_occurrence_overrides_delete_own
      on public.calendar_event_occurrence_overrides
      for delete
      using (auth.uid() = user_id);
  end if;
end $$;

create index if not exists calendar_event_occurrence_overrides_user_date_idx
  on public.calendar_event_occurrence_overrides(user_id, occurrence_date);

create index if not exists calendar_event_occurrence_overrides_event_idx
  on public.calendar_event_occurrence_overrides(calendar_event_id);
