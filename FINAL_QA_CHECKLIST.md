# Monkey Checks v2.12.2 — Final QA Hardening

## Estado de esta versión

Esta versión toma como base `v2.12.1 — Production Readiness Real Fix` y aplica una capa final de estabilidad para preparar el proyecto como release candidate fuerte para usuarios reales.

## Cambios incluidos

- `package.json` actualizado a `2.12.2`.
- Script `qa:final` agregado: `npm run typecheck && npm run build`.
- Script `validate:assets` agregado para detectar referencias de imágenes rotas en `lib/asset-library.ts`.
- `FormSheet` endurecido para móvil:
  - submit async seguro,
  - estado `Guardando...`,
  - prevención de doble envío,
  - botón sticky con estado disabled,
  - mejor soporte de safe area y teclado móvil.
- Recordatorios de calendario endurecidos:
  - `upsertCalendarReminder` ahora espera el resultado real de sincronización,
  - si una alerta no sincroniza se informa al usuario,
  - eliminar una actividad intenta eliminar su alerta relacionada,
  - errores de recordatorios se exponen al resumen de calendario.
- `supabase-data-service` mejora `upsertReminder`:
  - devuelve el registro sincronizado,
  - usa `calendar_event_id` como llave de conflicto cuando existe,
  - evita guardar IDs temporales como UUID reales,
  - devuelve estado booleano en eliminaciones remotas.
- Mensajes de conflicto de horario más claros para usuario final.
- Verificación de assets ejecutada: 68 referencias válidas, 0 faltantes.

## Migraciones requeridas antes de producción

Correr en Supabase en este orden:

1. `0001_v25_full_schema.sql`
2. `0002_v259_data_stability.sql`
3. `0003_v210_calendar_end_time.sql`
4. `0004_v2121_calendar_event_reminders.sql`

## Variables requeridas en Vercel

```txt
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Opcional en desarrollo local únicamente:

```txt
NEXT_PUBLIC_ALLOW_LOCAL_AUTH=true
```

No activar `NEXT_PUBLIC_ALLOW_LOCAL_AUTH` en producción.

## Preflight final obligatorio

Ejecutar local o validar en Vercel:

```bash
npm install
npm run validate:assets
npm run typecheck
npm run build
```

## QA manual recomendado

- Crear cuenta y confirmar correo.
- Login / logout.
- Acceder directo a `/today` sin sesión y validar redirección.
- Crear tarea en Hoy con texto largo.
- Crear actividad de calendario sin alerta.
- Crear actividad con alerta.
- Editar actividad con alerta.
- Eliminar actividad con alerta y confirmar que desaparece de Recordatorios.
- Crear actividad larga 09:00–12:00.
- Intentar crear actividad dentro de horario ocupado y validar mensaje de conflicto.
- Probar sheet con teclado abierto en iPhone Safari.
- Revisar Wallet, Notas, Perfil y Settings después de refresh.

## Nota honesta

No se incluye `package-lock.json` porque el entorno de generación no logró completar `npm install` por timeout. Para producción, se recomienda generar y versionar `package-lock.json` desde una máquina local con instalación completa y luego hacer commit.
