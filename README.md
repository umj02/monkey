# Monkey Checks v2.4.6 — Wallet DB Contract Prep

Base: v2.4.5 Wallet Inputs + Badges.

## Qué cambia

- Wallet queda con contrato listo para Supabase.
- Moneda principal cambiada a CRC / colones.
- Tipos finales para wallet:
  - `WalletTransaction`
  - `WalletBudget`
  - `WalletGoal`
  - `WalletDbTransaction`
  - `WalletDbBudget`
  - `WalletDbGoal`
- Nueva migración:
  - `supabase/migrations/0002_wallet_contract.sql`
- Nuevo contrato de repositorio:
  - `lib/repositories/wallet-repository.contract.ts`
- UI sigue funcionando local con `localStorage`.

## Tablas wallet preparadas

- `wallet_transactions`
- `wallet_budgets`
- `wallet_goals`
- `wallet_categories`

## Siguiente versión recomendada

v2.5 — Supabase Auth + DB real.

Objetivo:
1. Auth real.
2. Crear perfil automático.
3. Conectar tareas, notas, recordatorios, calendario y wallet a Supabase.
4. Mantener la UI intacta.
