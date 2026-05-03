-- v2.13 Wallet Period Filters + Browser Alerts
-- Adds the Extra transaction type used by Wallet filters.

alter table public.wallet_transactions
  drop constraint if exists wallet_transactions_type_check;

alter table public.wallet_categories
  drop constraint if exists wallet_categories_type_check;

alter table public.wallet_transactions
  add constraint wallet_transactions_type_check
  check (type in ('income', 'expense', 'saving', 'extra'));

alter table public.wallet_categories
  add constraint wallet_categories_type_check
  check (type in ('income', 'expense', 'saving', 'extra'));

insert into public.wallet_categories (user_id, name, type, color, icon, sort_order) values
  (null, 'Extra', 'extra', 'blue', 'wallet-extras', 10),
  (null, 'Bono', 'extra', 'blue', 'wallet-extras', 20),
  (null, 'Regalo', 'extra', 'green', 'wallet-gift', 30)
on conflict do nothing;
