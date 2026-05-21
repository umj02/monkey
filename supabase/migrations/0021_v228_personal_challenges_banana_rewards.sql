-- Monkey Checks v2.28 — Personal Challenges + Banana Rewards Foundation
-- Safe additive migration. It does not change the normal task/calendar flow.

create extension if not exists pgcrypto;

alter table public.calendar_events
  add column if not exists source text not null default 'normal',
  add column if not exists challenge_id text,
  add column if not exists challenge_task_id text,
  add column if not exists is_locked boolean not null default false,
  add column if not exists verification_status text,
  add column if not exists reward_bananas integer;

create index if not exists calendar_events_challenge_id_idx
  on public.calendar_events (user_id, challenge_id);

create table if not exists public.personal_challenges (
  id uuid primary key default gen_random_uuid(),
  local_id text,
  user_id uuid not null references auth.users(id) on delete cascade,
  origin text not null default 'personal' check (origin in ('personal', 'guardian')),
  title text not null,
  description text,
  icon_key text,
  image_path text,
  activity_type_key text,
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly', 'monthly')),
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled', 'expired')),
  start_date date not null,
  end_date date not null,
  reward_bananas integer not null default 0 check (reward_bananas >= 0),
  requires_guardian_verification boolean not null default false,
  total_tasks integer not null default 0,
  completed_tasks integer not null default 0,
  claimed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists personal_challenges_user_local_unique
  on public.personal_challenges (user_id, local_id)
  where local_id is not null;

create index if not exists personal_challenges_user_status_idx
  on public.personal_challenges (user_id, status, start_date desc);

create table if not exists public.challenge_tasks (
  id uuid primary key default gen_random_uuid(),
  local_id text,
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id text not null,
  calendar_event_id text,
  title text not null,
  icon_key text,
  activity_type_key text,
  scheduled_date date not null,
  scheduled_time time,
  status text not null default 'pending' check (status in ('pending', 'checked', 'verified', 'rejected', 'missed')),
  reward_bananas integer not null default 0 check (reward_bananas >= 0),
  checked_at timestamptz,
  verified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists challenge_tasks_user_local_unique
  on public.challenge_tasks (user_id, local_id)
  where local_id is not null;

create index if not exists challenge_tasks_user_challenge_idx
  on public.challenge_tasks (user_id, challenge_id, scheduled_date, scheduled_time);

create table if not exists public.banana_ledger (
  id uuid primary key default gen_random_uuid(),
  local_id text,
  user_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null check (source_type in ('challenge', 'achievement', 'manual_adjustment')),
  source_id text not null,
  amount integer not null,
  reason text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists banana_ledger_unique_source
  on public.banana_ledger (user_id, source_type, source_id);

create index if not exists banana_ledger_user_created_idx
  on public.banana_ledger (user_id, created_at desc);

alter table public.personal_challenges enable row level security;
alter table public.challenge_tasks enable row level security;
alter table public.banana_ledger enable row level security;

drop policy if exists personal_challenges_select_own on public.personal_challenges;
create policy personal_challenges_select_own
on public.personal_challenges for select
using (auth.uid() = user_id);

drop policy if exists personal_challenges_insert_own on public.personal_challenges;
create policy personal_challenges_insert_own
on public.personal_challenges for insert
with check (auth.uid() = user_id);

drop policy if exists personal_challenges_update_own on public.personal_challenges;
create policy personal_challenges_update_own
on public.personal_challenges for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists personal_challenges_delete_own on public.personal_challenges;
create policy personal_challenges_delete_own
on public.personal_challenges for delete
using (auth.uid() = user_id);

drop policy if exists challenge_tasks_select_own on public.challenge_tasks;
create policy challenge_tasks_select_own
on public.challenge_tasks for select
using (auth.uid() = user_id);

drop policy if exists challenge_tasks_insert_own on public.challenge_tasks;
create policy challenge_tasks_insert_own
on public.challenge_tasks for insert
with check (auth.uid() = user_id);

drop policy if exists challenge_tasks_update_own on public.challenge_tasks;
create policy challenge_tasks_update_own
on public.challenge_tasks for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists challenge_tasks_delete_own on public.challenge_tasks;
create policy challenge_tasks_delete_own
on public.challenge_tasks for delete
using (auth.uid() = user_id);

drop policy if exists banana_ledger_select_own on public.banana_ledger;
create policy banana_ledger_select_own
on public.banana_ledger for select
using (auth.uid() = user_id);

drop policy if exists banana_ledger_insert_own on public.banana_ledger;
create policy banana_ledger_insert_own
on public.banana_ledger for insert
with check (auth.uid() = user_id);

drop policy if exists banana_ledger_update_own on public.banana_ledger;
create policy banana_ledger_update_own
on public.banana_ledger for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
