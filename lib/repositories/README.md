# Repository layer

v2.4 keeps the app working with localStorage, but the UI no longer needs to know where data will live next.

Next step for v2.5/v3:
1. Keep the hooks API stable.
2. Replace local state calls inside hooks with Supabase repository calls.
3. Use `lib/supabase/database.types.ts` and the migration in `supabase/migrations`.
