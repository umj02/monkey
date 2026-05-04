-- v2.13.7 — Calendar occurrence completions
-- Tracks completion per date for recurring calendar activities.

create table if not exists public.calendar_event_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  calendar_event_id uuid not null references public.calendar_events(id) on delete cascade,
  occurrence_date date not null,
  done boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, calendar_event_id, occurrence_date)
);

create index if not exists calendar_event_completions_user_date_idx
  on public.calendar_event_completions (user_id, occurrence_date);

alter table public.calendar_event_completions enable row level security;

drop policy if exists calendar_event_completions_select_own on public.calendar_event_completions;
create policy calendar_event_completions_select_own
  on public.calendar_event_completions
  for select
  using (auth.uid() = user_id);

drop policy if exists calendar_event_completions_insert_own on public.calendar_event_completions;
create policy calendar_event_completions_insert_own
  on public.calendar_event_completions
  for insert
  with check (auth.uid() = user_id);

drop policy if exists calendar_event_completions_update_own on public.calendar_event_completions;
create policy calendar_event_completions_update_own
  on public.calendar_event_completions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists calendar_event_completions_delete_own on public.calendar_event_completions;
create policy calendar_event_completions_delete_own
  on public.calendar_event_completions
  for delete
  using (auth.uid() = user_id);

create or replace function public.set_calendar_event_completions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_calendar_event_completions_updated_at on public.calendar_event_completions;
create trigger trg_calendar_event_completions_updated_at
before update on public.calendar_event_completions
for each row
execute function public.set_calendar_event_completions_updated_at();
