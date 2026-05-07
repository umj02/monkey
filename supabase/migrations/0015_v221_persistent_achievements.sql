-- v2.21 — Persistent Achievements + Supabase Sync
-- Guarda las medallas desbloqueadas una sola vez por usuario para conservar fecha e historial.

create table if not exists public.achievement_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  source_progress integer not null default 100,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint achievement_unlocks_unique unique (user_id, achievement_id)
);

create index if not exists achievement_unlocks_user_id_idx
  on public.achievement_unlocks(user_id);

create index if not exists achievement_unlocks_unlocked_at_idx
  on public.achievement_unlocks(user_id, unlocked_at desc);

alter table public.achievement_unlocks enable row level security;

drop policy if exists achievement_unlocks_select_own on public.achievement_unlocks;
create policy achievement_unlocks_select_own
on public.achievement_unlocks
for select
using (auth.uid() = user_id);

drop policy if exists achievement_unlocks_insert_own on public.achievement_unlocks;
create policy achievement_unlocks_insert_own
on public.achievement_unlocks
for insert
with check (auth.uid() = user_id);

drop policy if exists achievement_unlocks_update_own on public.achievement_unlocks;
create policy achievement_unlocks_update_own
on public.achievement_unlocks
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.set_achievement_unlocks_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_achievement_unlocks_updated_at on public.achievement_unlocks;
create trigger set_achievement_unlocks_updated_at
before update on public.achievement_unlocks
for each row
execute function public.set_achievement_unlocks_updated_at();
