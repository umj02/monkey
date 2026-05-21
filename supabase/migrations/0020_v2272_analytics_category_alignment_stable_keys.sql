-- Monkey Checks v2.27.2 — Analytics Category Alignment + Stable Keys
-- Adds optional stable category keys for Wallet analytics while preserving existing labels.

alter table public.wallet_transactions
add column if not exists category_key text;

alter table public.wallet_planned_expenses
add column if not exists category_key text;

-- Backfill stable keys from existing labels for current data.
-- Uses translate instead of unaccent extension to avoid extension/search_path issues.
update public.wallet_transactions
set category_key = lower(regexp_replace(translate(coalesce(category, 'otro'), 'ÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜÑáàâäãéèêëíìîïóòôöõúùûüñ', 'AAAAAEEEEIIIIOOOOOUUUUNaaaaaeeeeiiiiooooouuuun'), '[^a-zA-Z0-9]+', '-', 'g'))
where (category_key is null or btrim(category_key) = '') and category is not null;

update public.wallet_planned_expenses
set category_key = lower(regexp_replace(translate(coalesce(category, 'otro'), 'ÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜÑáàâäãéèêëíìîïóòôöõúùûüñ', 'AAAAAEEEEIIIIOOOOOUUUUNaaaaaeeeeiiiiooooouuuun'), '[^a-zA-Z0-9]+', '-', 'g'))
where (category_key is null or btrim(category_key) = '') and category is not null;

create index if not exists wallet_transactions_user_category_key_idx
on public.wallet_transactions (user_id, category_key);

create index if not exists wallet_planned_expenses_user_category_key_idx
on public.wallet_planned_expenses (user_id, category_key);

notify pgrst, 'reload schema';
