# Monkey Checks v2.4.7 — Assets Integration System

Base: v2.4.6 Wallet DB Contract Prep.

## Cambios principales

- Biblioteca interna de assets en `public/assets`.
- Catálogo tipado en `lib/asset-library.ts`.
- Componentes reutilizables:
  - `components/asset-thumb.tsx`
  - `components/asset-picker.tsx`
- Personajes integrados:
  - Intro: `public/assets/monkey/intro`
  - Hero/Hoy: `public/assets/monkey/hero`
  - Caritas circulares: `public/assets/monkey/faces`
- Iconos Wallet integrados:
  - `public/assets/wallet/icons/income`
  - `public/assets/wallet/icons/expense`
- Iconos Actividades integrados:
  - `public/assets/activities/icons`
- Wallet permite seleccionar iconos prediseñados al crear movimientos y metas.
- Hoy permite seleccionar icono de actividad al crear bloques/tareas.
- Preparación Supabase: se guardan `icon` / `icon_key` como texto, no archivos binarios.

## Importante

Aún no requiere correr migraciones. Los assets viven dentro del proyecto para que Vercel los sirva directamente.
Más adelante Supabase guardará solo la referencia, por ejemplo:

```txt
activity-study
wallet-food
wallet-savings
face-main
```
