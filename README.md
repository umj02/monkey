# Monkey Checks v2.4.1 — App Architecture Cleanup

Base: v2.4 Supabase Prep.

## Qué cambia

- Mantiene el diseño y la UI estable de v2.4.
- Todas las pantallas principales pasan por hooks oficiales:
  - `useTasks`
  - `useCalendarEvents`
  - `useNotes`
  - `useReminders`
  - `useProfile`
  - `useSettings`
  - `useAuth`
- Centraliza storage keys en `lib/storage-keys.ts`.
- Agrega migración local desde keys antiguas v2.2/v2.3 hacia keys v2.4.
- Login/Register quedan como mock funcional con validaciones y sesión local.
- Profile tiene logout mock y muestra estado de sesión local.
- Servicios quedan listos para reemplazar localStorage por Supabase en v2.5.

## Validación

Ejecutar:

```bash
npm install
npm run build
```

## Siguiente paso recomendado

v2.5 — Supabase Auth + DB real.
