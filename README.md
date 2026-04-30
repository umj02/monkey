# Monkey Checks v2.5 — Supabase Auth + DB Real

Base: v2.4.9 Intro Safe Area + Hero Fix.

## Qué incluye

- Auth real con Supabase Email + Password.
- Fallback local si no existen variables de Supabase.
- Perfil sincronizable con Supabase.
- CRUD preparado/conectado para:
  - Hoy / tareas por bloques de hora.
  - Calendario.
  - Notas.
  - Recordatorios.
  - Wallet / Finanzas.
- Migración única para base de datos vacía:
  - `supabase/migrations/0001_v25_full_schema.sql`
- RLS por usuario en todas las tablas.
- Trigger automático para crear perfil al registrar usuario.

## Antes de correr la app con DB

1. En Supabase, abrir **SQL Editor**.
2. Crear un nuevo query.
3. Pegar el contenido completo de:

```txt
supabase/migrations/0001_v25_full_schema.sql
```

4. Dar **Run**.

## Variables en Vercel

```env
NEXT_PUBLIC_SUPABASE_URL=TU_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY
```

## Nota importante de Auth

Para probar rápido, en Supabase Auth podés desactivar temporalmente la confirmación de email. Si la dejás activa, el usuario deberá confirmar el correo antes de tener sesión completa.

## Build

```bash
npm install
npm run build
```

