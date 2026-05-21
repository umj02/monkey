-- v2.27.1 — Category Preferences API Key Mapping Hotfix
-- Aligns the category preferences table with the app contract: category_key is the persisted DB column.

alter table public.user_category_preferences
add column if not exists category_key text;

-- If an older migration created a column named "key", copy/rename it safely into category_key.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_category_preferences'
      and column_name = 'key'
  ) then
    execute 'update public.user_category_preferences set category_key = coalesce(category_key, "key") where category_key is null';
  end if;
end $$;

-- Ensure no null category_key remains before enforcing NOT NULL.
update public.user_category_preferences
set category_key = 'custom-' || id::text
where category_key is null or btrim(category_key) = '';

alter table public.user_category_preferences
alter column category_key set not null;

alter table public.user_category_preferences
add column if not exists metadata jsonb not null default '{}'::jsonb;

-- Replace old unique constraint if it used (user_id, scope, key).
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'user_category_preferences_unique'
      and conrelid = 'public.user_category_preferences'::regclass
  ) then
    alter table public.user_category_preferences drop constraint user_category_preferences_unique;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'user_category_preferences_user_scope_category_key_unique'
      and conrelid = 'public.user_category_preferences'::regclass
  ) then
    alter table public.user_category_preferences
    add constraint user_category_preferences_user_scope_category_key_unique
    unique (user_id, scope, category_key);
  end if;
end $$;

create index if not exists user_category_preferences_user_scope_sort_idx
on public.user_category_preferences (user_id, scope, sort_order, label);

notify pgrst, 'reload schema';
