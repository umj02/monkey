-- v2.17 Budget planned expenses + expense detail support
alter table public.wallet_transactions
  add column if not exists expense_kind text default 'variable' check (expense_kind in ('variable','planned')),
  add column if not exists planned_expense_id uuid,
  add column if not exists note text;

create table if not exists public.wallet_planned_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  amount numeric not null default 0,
  currency text not null default 'CRC' check (currency in ('CRC','USD')),
  due_date date not null,
  frequency text not null default 'monthly' check (frequency in ('weekly','biweekly','monthly','yearly','one_time')),
  status text not null default 'pending' check (status in ('pending','paid','overdue')),
  paid_at timestamptz,
  icon text,
  notes text,
  enabled boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.wallet_planned_expenses enable row level security;

drop policy if exists wallet_planned_expenses_select_own on public.wallet_planned_expenses;
create policy wallet_planned_expenses_select_own on public.wallet_planned_expenses
  for select using (auth.uid() = user_id);

drop policy if exists wallet_planned_expenses_insert_own on public.wallet_planned_expenses;
create policy wallet_planned_expenses_insert_own on public.wallet_planned_expenses
  for insert with check (auth.uid() = user_id);

drop policy if exists wallet_planned_expenses_update_own on public.wallet_planned_expenses;
create policy wallet_planned_expenses_update_own on public.wallet_planned_expenses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists wallet_planned_expenses_delete_own on public.wallet_planned_expenses;
create policy wallet_planned_expenses_delete_own on public.wallet_planned_expenses
  for delete using (auth.uid() = user_id);

create index if not exists wallet_planned_expenses_user_due_idx on public.wallet_planned_expenses(user_id, due_date);
create index if not exists wallet_transactions_planned_expense_idx on public.wallet_transactions(planned_expense_id);
