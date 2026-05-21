-- v2.25 — Secure Guardian Share Tokens + Supabase Sync
-- Secure read-only guardian progress links stored in Supabase.

create table if not exists public.guardian_share_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  child_alias text not null,
  guardian_label text not null,
  include_calendar boolean not null default true,
  include_achievements boolean not null default true,
  include_best_day boolean not null default true,
  include_streak boolean not null default true,
  include_wallet boolean not null default false,
  snapshot jsonb not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  last_viewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists guardian_share_tokens_user_created_idx
  on public.guardian_share_tokens (user_id, created_at desc);

create index if not exists guardian_share_tokens_token_idx
  on public.guardian_share_tokens (token);

create or replace function public.set_guardian_share_tokens_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_guardian_share_tokens_updated_at on public.guardian_share_tokens;
create trigger set_guardian_share_tokens_updated_at
before update on public.guardian_share_tokens
for each row
execute function public.set_guardian_share_tokens_updated_at();

alter table public.guardian_share_tokens enable row level security;

drop policy if exists guardian_share_tokens_select_own on public.guardian_share_tokens;
create policy guardian_share_tokens_select_own
on public.guardian_share_tokens
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists guardian_share_tokens_insert_own on public.guardian_share_tokens;
create policy guardian_share_tokens_insert_own
on public.guardian_share_tokens
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists guardian_share_tokens_update_own on public.guardian_share_tokens;
create policy guardian_share_tokens_update_own
on public.guardian_share_tokens
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Public function: the table is not directly readable by anon.
-- The function returns only the exact token requested and reports status.
create or replace function public.get_guardian_share_by_token(p_token text)
returns table (
  status text,
  snapshot jsonb,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.guardian_share_tokens
  set last_viewed_at = now()
  where token = p_token
    and revoked_at is null
    and expires_at > now();

  return query
  select
    case
      when gst.revoked_at is not null then 'revoked'
      when gst.expires_at <= now() then 'expired'
      else 'active'
    end as status,
    gst.snapshot,
    gst.expires_at,
    gst.revoked_at,
    gst.created_at
  from public.guardian_share_tokens gst
  where gst.token = p_token
  limit 1;
end;
$$;

revoke all on function public.get_guardian_share_by_token(text) from public;
grant execute on function public.get_guardian_share_by_token(text) to anon, authenticated;
grant select, insert, update on public.guardian_share_tokens to authenticated;
