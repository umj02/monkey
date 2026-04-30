-- Monkey Checks v2.5 — Supabase Auth + DB Real
-- Empty database recommended. Run this once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  avatar_url text,
  theme text not null default 'colorful' check (theme in ('colorful', 'soft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.time_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  block_date date not null default current_date,
  start_time time,
  title text not null,
  color text not null default 'green' check (color in ('purple','green','orange','blue','pink','yellow')),
  icon text default 'activity-study',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  block_id uuid references public.time_blocks(id) on delete cascade,
  title text not null check (char_length(title) >= 2),
  icon text,
  done boolean not null default false,
  sort_order int not null default 0,
  reminder_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_date date not null default current_date,
  start_time time,
  title text not null check (char_length(title) >= 2),
  color text not null default 'green' check (color in ('yellow','blue','green','pink','purple','orange')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) >= 2),
  body text,
  color text not null default 'yellow' check (color in ('yellow','pink','green','blue','purple')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  title text not null check (char_length(title) >= 2),
  remind_time time not null,
  repeat_rule text not null default 'daily' check (repeat_rule in ('daily','weekly','custom')),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense', 'saving')),
  title text not null check (char_length(title) >= 2),
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'CRC' check (currency in ('CRC', 'USD')),
  category text not null default 'Otro',
  icon text default 'wallet-income',
  transaction_date date not null default current_date,
  period text not null default 'weekly' check (period in ('weekly', 'biweekly', 'monthly')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period text not null check (period in ('weekly', 'biweekly', 'monthly')),
  limit_amount numeric(12,2) not null check (limit_amount > 0),
  currency text not null default 'CRC' check (currency in ('CRC', 'USD')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wallet_budgets_user_period_currency_unique unique (user_id, period, currency)
);

create table if not exists public.wallet_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) >= 2),
  target_amount numeric(12,2) not null check (target_amount > 0),
  current_amount numeric(12,2) not null default 0 check (current_amount >= 0),
  currency text not null default 'CRC' check (currency in ('CRC', 'USD')),
  target_date date,
  icon text default 'wallet-savings',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense', 'saving')),
  color text not null default 'blue',
  icon text,
  sort_order int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists wallet_categories_global_unique on public.wallet_categories (name, type) where user_id is null;
create unique index if not exists wallet_categories_user_unique on public.wallet_categories (user_id, name, type) where user_id is not null;

create index if not exists time_blocks_user_date_idx on public.time_blocks (user_id, block_date, start_time);
create index if not exists tasks_user_block_idx on public.tasks (user_id, block_id, sort_order);
create index if not exists calendar_events_user_date_idx on public.calendar_events (user_id, event_date, start_time);
create index if not exists notes_user_created_idx on public.notes (user_id, created_at desc);
create index if not exists reminders_user_time_idx on public.reminders (user_id, remind_time);
create index if not exists wallet_transactions_user_date_idx on public.wallet_transactions (user_id, transaction_date desc);
create index if not exists wallet_transactions_user_period_idx on public.wallet_transactions (user_id, period);
create index if not exists wallet_goals_user_idx on public.wallet_goals (user_id, created_at desc);
create index if not exists wallet_categories_user_type_idx on public.wallet_categories (user_id, type, sort_order);

do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','time_blocks','tasks','calendar_events','notes','reminders','wallet_transactions','wallet_budgets','wallet_goals','wallet_categories'] loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

drop policy if exists "profiles owner read" on public.profiles;
create policy "profiles owner read" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles owner insert" on public.profiles;
create policy "profiles owner insert" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles owner update" on public.profiles;
create policy "profiles owner update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "time_blocks owner all" on public.time_blocks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks owner all" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "calendar_events owner all" on public.calendar_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notes owner all" on public.notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reminders owner all" on public.reminders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wallet_transactions owner all" on public.wallet_transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wallet_budgets owner all" on public.wallet_budgets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wallet_goals owner all" on public.wallet_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wallet_categories owner read" on public.wallet_categories for select using (user_id is null or auth.uid() = user_id);
create policy "wallet_categories owner insert" on public.wallet_categories for insert with check (auth.uid() = user_id);
create policy "wallet_categories owner update" on public.wallet_categories for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wallet_categories owner delete" on public.wallet_categories for delete using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), new.email)
  on conflict (id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','time_blocks','tasks','calendar_events','notes','reminders','wallet_transactions','wallet_budgets','wallet_goals','wallet_categories'] loop
    execute format('drop trigger if exists set_updated_at_%I on public.%I', table_name, table_name);
    execute format('create trigger set_updated_at_%I before update on public.%I for each row execute procedure public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

insert into public.wallet_categories (user_id, name, type, color, icon, sort_order) values
  (null, 'Comida', 'expense', 'orange', 'wallet-food', 10),
  (null, 'Transporte', 'expense', 'yellow', 'wallet-transport', 20),
  (null, 'Entretenimiento', 'expense', 'purple', 'wallet-fun', 30),
  (null, 'Compras', 'expense', 'pink', 'wallet-shop', 40),
  (null, 'Escuela', 'expense', 'blue', 'wallet-study', 50),
  (null, 'Mesada', 'income', 'green', 'wallet-income', 10),
  (null, 'Trabajo', 'income', 'green', 'wallet-income', 20),
  (null, 'Regalo', 'income', 'green', 'wallet-gift', 30),
  (null, 'Venta', 'income', 'green', 'wallet-extras', 40),
  (null, 'Ahorro', 'saving', 'purple', 'wallet-savings', 10)
on conflict do nothing;
