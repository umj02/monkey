# v2.28.1.26 — Pre-Parent Stability Audit Cleanup

Versión de estabilización previa a Parent.

## Objetivo
Reducir confusión de sincronización antes de abrir el módulo Parent. No cambia base de datos, dependencias ni configuración de Vercel.

## Cambios incluidos
- Centraliza el texto de estado de guardado de calendario en `lib/calendar/sync-status.ts`.
- Calendar y Today usan la misma regla visual para estados: guardando, en cuenta, local o revisar.
- El badge corto del resumen de día usa la misma fuente de verdad.
- Reduce mensajes contradictorios de `Local` cuando Supabase todavía está guardando.
- Mantiene el modelo actual: Supabase como remoto, localStorage solo como respaldo/fallback.

## Qué NO se tocó
- Supabase / migraciones
- `package.json`
- dependencias
- Vercel config
- reglas de negocio de vencimiento
- sonidos
- Parent

## Prueba manual recomendada
1. Iniciar sesión.
2. Crear tarea normal en Hoy.
3. Validar que el estado muestre `Guardando en tu cuenta…` y luego `Guardado en tu cuenta`.
4. Crear tarea recurrente en Calendario.
5. Confirmar en Supabase que `recurrence_type`, `recurrence_days` y `recurrence_until` se guardan.
6. Refrescar la app y confirmar que la data se mantiene.
