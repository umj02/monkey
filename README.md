# Monkey Checks v2 — MASTER UI Full

Versión completa visual tomando como base v1.1 Vercel Fix.

## Incluye
- Intro visual estilo mockup.
- Register y Login premium mobile-first.
- Dashboard Hoy con TimeBlocks, checks interactivos, ProgressCard y bottom sheet.
- Calendario con semana, timeline pastel y FAB.
- Notas tipo post-it con grid 2 columnas.
- Recordatorios con toggles.
- Perfil y Configuración.
- Design tokens, Tailwind extendido y utilidades globales.
- Fix Tailwind v4/PostCSS para Vercel.

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

## Variables Vercel

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=
```

`NEXT_PUBLIC_APP_URL` puede agregarse después del primer deploy con la URL real de Vercel.

## Rutas
- `/` Intro
- `/register`
- `/login`
- `/today`
- `/calendar`
- `/notes`
- `/reminders`
- `/profile`
- `/settings`
