-- v2.16 — Background Push Notifications
-- Stores browser push subscriptions and delivery logs for scheduled reminder pushes.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  timezone text default 'America/Costa_Rica',
  user_agent text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_enabled_idx
  on public.push_subscriptions(user_id, enabled);

create table if not exists public.push_notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reminder_id uuid not null references public.reminders(id) on delete cascade,
  scheduled_for text not null,
  sent_at timestamptz,
  status text not null default 'pending',
  error_message text,
  created_at timestamptz not null default now(),
  unique(user_id, reminder_id, scheduled_for)
);

create index if not exists push_notification_deliveries_user_idx
  on public.push_notification_deliveries(user_id, created_at desc);

alter table public.push_subscriptions enable row level security;
alter table public.push_notification_deliveries enable row level security;

drop policy if exists push_subscriptions_select_own on public.push_subscriptions;
create policy push_subscriptions_select_own
  on public.push_subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists push_subscriptions_delete_own on public.push_subscriptions;
create policy push_subscriptions_delete_own
  on public.push_subscriptions
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists push_notification_deliveries_select_own on public.push_notification_deliveries;
create policy push_notification_deliveries_select_own
  on public.push_notification_deliveries
  for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.set_push_subscriptions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_push_subscriptions_updated_at on public.push_subscriptions;
create trigger set_push_subscriptions_updated_at
before update on public.push_subscriptions
for each row execute function public.set_push_subscriptions_updated_at();
