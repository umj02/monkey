# Monkey Checks v2.5.2 — Full Supabase Stable

Base limpia tomada de v2.5.

## Incluye
- Auth real con Supabase.
- Login/Register sin redirección mock.
- Google/Apple no entran directo hasta configurar providers reales.
- Protección de rutas internas con sesión obligatoria.
- `supabase-data-service.ts` tipado para evitar `implicit any` en Vercel.
- `initialSettings` corregido.
- Migración full para base vacía en `supabase/migrations/0001_v25_full_schema.sql`.

## Variables requeridas en Vercel
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Importante
Si tenés confirmación de email activada en Supabase, el registro muestra mensaje para confirmar correo y no entra a `/today` hasta que exista sesión real.
