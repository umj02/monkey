create table if not exists public.user_category_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null check (scope in ('activity', 'wallet_expense', 'wallet_icon')),
  category_key text not null,
  label text not null,
  icon_key text not null,
  image_path text,
  is_enabled boolean not null default true,
  sort_order integer not null default 0,
  is_custom boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_category_preferences_unique unique (user_id, scope, category_key)
);

create index if not exists user_category_preferences_user_scope_idx
  on public.user_category_preferences (user_id, scope, sort_order);

alter table public.user_category_preferences enable row level security;

drop policy if exists user_category_preferences_select_own on public.user_category_preferences;
create policy user_category_preferences_select_own
  on public.user_category_preferences
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists user_category_preferences_insert_own on public.user_category_preferences;
create policy user_category_preferences_insert_own
  on public.user_category_preferences
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists user_category_preferences_update_own on public.user_category_preferences;
create policy user_category_preferences_update_own
  on public.user_category_preferences
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists user_category_preferences_delete_own on public.user_category_preferences;
create policy user_category_preferences_delete_own
  on public.user_category_preferences
  for delete
  to authenticated
  using (auth.uid() = user_id and is_custom = true);

create or replace function public.set_user_category_preferences_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_category_preferences_updated_at on public.user_category_preferences;
create trigger set_user_category_preferences_updated_at
  before update on public.user_category_preferences
  for each row execute function public.set_user_category_preferences_updated_at();
