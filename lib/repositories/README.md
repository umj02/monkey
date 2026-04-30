# Repository layer

v2.4.6 keeps the app working with localStorage, but the data contract is now ready for Supabase.

Wallet DB contract:
- `wallet_transactions`: income, expense and saving movements.
- `wallet_budgets`: one budget per user + period + currency.
- `wallet_goals`: saving goals.
- `wallet_categories`: default and user-owned categories.

Next step for v2.5:
1. Keep the hooks API stable.
2. Implement `lib/repositories/wallet-repository.contract.ts` with Supabase.
3. Replace local state calls inside hooks with repository calls after Auth is real.
4. Use `lib/supabase/database.types.ts` and `supabase/migrations/0002_wallet_contract.sql`.
