# Monkey Checks v2.5.9 — Supabase Data Stability Fix

Base: v2.5.8.

## Cambios principales

- Corrige el patrón que duplicaba tareas, notas y eventos en Supabase.
- Evita guardar en Supabase dentro de callbacks de `setState` para tareas.
- Al crear tareas/notas/eventos, la app reemplaza el ID temporal por el UUID real devuelto por Supabase.
- Tareas usan operaciones puntuales: crear, actualizar, eliminar.
- Notas y calendario hacen create/update controlado y no vuelven a insertar registros existentes.
- Agrega scripts de validación:
  - `npm run typecheck`
  - `npm run build:preflight`
- Agrega migración opcional `0002_v259_data_stability.sql` para limpiar duplicados existentes y blindar la BD con índices únicos.

## Después de desplegar

1. Subir esta versión a GitHub/Vercel.
2. Validar `npm run build`.
3. Correr en Supabase SQL Editor la migración opcional:

```txt
supabase/migrations/0002_v259_data_stability.sql
```

Recomendado porque ya existen duplicados en la base actual.
