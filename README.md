# Monkey Checks v2.4 — Supabase Preparation

Base: Monkey Checks v2.3.1 Build Fix.

## Estado

- UI funcional local con `localStorage`.
- Build validado para Vercel.
- Preparación de arquitectura para Supabase sin conectar todavía la BD.

## Cambios principales v2.4

- Nuevos hooks preparados para reemplazar storage local por Supabase:
  - `hooks/use-tasks.ts`
  - `hooks/use-notes.ts`
  - `hooks/use-calendar-events.ts`
  - `hooks/use-reminders.ts`
  - `hooks/use-profile.ts`
  - `hooks/use-settings.ts`
- Nueva capa de servicios de dominio:
  - `lib/services/task-service.ts`
  - `lib/services/note-service.ts`
  - `lib/services/calendar-service.ts`
  - `lib/services/reminder-service.ts`
  - `lib/services/profile-service.ts`
- Nuevas llaves centralizadas:
  - `lib/storage-keys.ts`
- Tipado Supabase inicial:
  - `lib/supabase/database.types.ts`
- Cliente Supabase tipado:
  - `lib/supabase/client.ts`
- Migración inicial sugerida:
  - `supabase/migrations/0001_monkey_checks_core.sql`

## Variables Vercel

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Validación

```bash
npm install
npm run build
```

## Próximo paso recomendado

v2.5 / v3: activar Auth real, ejecutar migración en Supabase y cambiar hooks locales por consultas Supabase manteniendo la misma UI.
