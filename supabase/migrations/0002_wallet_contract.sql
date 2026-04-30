-- Monkey Checks v2.4.6 — Wallet DB Contract Prep
-- Safe to run after 0001_monkey_checks_core.sql.

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense', 'saving')),
  title text not null check (char_length(title) >= 2),
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'CRC' check (currency in ('CRC', 'USD')),
  category text not null default 'Otro',
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
  icon text default '🎯',
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
  updated_at timestamptz not null default now(),
  constraint wallet_categories_user_name_type_unique unique (user_id, name, type)
);

create index if not exists wallet_transactions_user_date_idx on public.wallet_transactions (user_id, transaction_date desc);
create index if not exists wallet_transactions_user_period_idx on public.wallet_transactions (user_id, period);
create index if not exists wallet_goals_user_idx on public.wallet_goals (user_id, created_at desc);
create index if not exists wallet_categories_user_type_idx on public.wallet_categories (user_id, type, sort_order);

alter table public.wallet_transactions enable row level security;
alter table public.wallet_budgets enable row level security;
alter table public.wallet_goals enable row level security;
alter table public.wallet_categories enable row level security;

create policy "wallet_transactions owner all" on public.wallet_transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wallet_budgets owner all" on public.wallet_budgets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wallet_goals owner all" on public.wallet_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wallet_categories owner read" on public.wallet_categories for select using (user_id is null or auth.uid() = user_id);
create policy "wallet_categories owner insert" on public.wallet_categories for insert with check (auth.uid() = user_id);
create policy "wallet_categories owner update" on public.wallet_categories for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wallet_categories owner delete" on public.wallet_categories for delete using (auth.uid() = user_id);

insert into public.wallet_categories (user_id, name, type, color, icon, sort_order) values
  (null, 'Comida', 'expense', 'orange', '🍕', 10),
  (null, 'Transporte', 'expense', 'yellow', '🚌', 20),
  (null, 'Entretenimiento', 'expense', 'purple', '🎮', 30),
  (null, 'Compras', 'expense', 'pink', '🛍️', 40),
  (null, 'Escuela', 'expense', 'blue', '📚', 50),
  (null, 'Mesada', 'income', 'green', '💵', 10),
  (null, 'Trabajo', 'income', 'green', '💼', 20),
  (null, 'Regalo', 'income', 'green', '🎁', 30),
  (null, 'Venta', 'income', 'green', '🧾', 40),
  (null, 'Ahorro', 'saving', 'purple', '🌱', 10)
on conflict (user_id, name, type) do nothing;
