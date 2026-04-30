-- Monkey Checks v2.4.7 — Assets Integration System
-- The app stores icon keys from /lib/asset-library.ts. Supabase only needs the key.
-- Examples: activity-study, wallet-food, wallet-income, face-main, hero-sentado.

alter table public.tasks add column if not exists icon text;
alter table public.wallet_transactions add column if not exists icon text;

comment on column public.time_blocks.icon is 'Predesigned activity asset key, e.g. activity-study.';
comment on column public.tasks.icon is 'Optional task-level asset key for future item badges.';
comment on column public.wallet_transactions.icon is 'Predesigned wallet asset key, e.g. wallet-food.';
comment on column public.wallet_goals.icon is 'Predesigned wallet goal asset key, e.g. wallet-savings.';
comment on column public.wallet_categories.icon is 'Predesigned wallet category asset key.';
