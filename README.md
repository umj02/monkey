# Monkey Checks Starter Pro

Starter mobile-first para una app juvenil de checklist diaria.

## Stack
- Next.js App Router
- TypeScript
- TailwindCSS
- Supabase ready
- Vercel ready

## Instalación

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Rutas
- `/` Intro
- `/register`
- `/login`
- `/today`
- `/calendar`
- `/notes`
- `/profile`

## Supabase
El starter incluye cliente Supabase en `lib/supabase/client.ts`.
Cuando conectes DB/Auth, agrega tus variables en `.env.local`.

## Versión 1.1 — Vercel Deploy Fix

Esta versión corrige el error de build de Tailwind CSS en Vercel usando el plugin oficial `@tailwindcss/postcss` para Tailwind v4.

Variables necesarias en Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

`NEXT_PUBLIC_APP_URL` es opcional y puede agregarse después del primer deploy con la URL real de Vercel.
