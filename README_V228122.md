# v2.28.1.22 — Supabase Session Bridge + Persistence Regression Fix

Hotfix focused on persistence regression.

## Fixed
- `getUserId()` now reads the active Supabase session from `@supabase/ssr` cookies first via `supabase.auth.getSession()`.
- Falls back to `supabase.auth.getUser()` only if the session user is not available.
- Prevents the data layer from treating a valid cookie-based Supabase session as `null`, which caused calendar/today data to remain only in localStorage.

## Not changed
- No Supabase migrations.
- No dependency changes.
- No Vercel config changes.
- No business-rule changes.
