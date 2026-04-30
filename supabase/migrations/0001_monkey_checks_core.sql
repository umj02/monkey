create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  theme text default 'colorful',
  created_at timestamptz default now()
);

create table if not exists public.time_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  block_date date not null,
  start_time time,
  title text not null,
  color text not null default 'green',
  icon text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  block_id uuid references public.time_blocks(id) on delete cascade,
  title text not null,
  done boolean default false,
  sort_order int default 0,
  reminder_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  color text default 'yellow',
  created_at timestamptz default now()
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  title text not null,
  remind_time time not null,
  repeat_rule text default 'daily',
  enabled boolean default true,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.time_blocks enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.reminders enable row level security;

create policy "profiles owner read" on public.profiles for select using (auth.uid() = id);
create policy "profiles owner insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles owner update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "time_blocks owner all" on public.time_blocks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks owner all" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notes owner all" on public.notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reminders owner all" on public.reminders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
