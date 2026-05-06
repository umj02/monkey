-- Monkey Checks v2.18 — Welcome Onboarding UX
-- Shows onboarding only for new users while keeping existing users out of the forced welcome flow.

alter table public.profiles
add column if not exists has_completed_onboarding boolean;

-- Existing users should not be forced through onboarding after upgrading.
update public.profiles
set has_completed_onboarding = true
where has_completed_onboarding is null;

alter table public.profiles
alter column has_completed_onboarding set default false;

alter table public.profiles
alter column has_completed_onboarding set not null;
