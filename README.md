# Monkey Checks v2.7 — Reminder System Real

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


## v2.6 — Today UX Improvements
- Fecha real en vista Hoy.
- Botón de calendario navega a /calendar.
- Campanita de recordatorio en modal de tarea y tarjetas de Hoy.
- Monito de progress card más grande.
- Mensaje de felicitación al llegar a 100%.
- Base v2.5.9 conservando fixes de estabilidad Supabase.


## v2.7 — Reminder System Real
- La vista `/reminders` ahora combina recordatorios independientes y tareas con `reminderAt`.
- Agrupa recordatorios por estado: Hoy, Próximos, Ya pasaron e Inactivos.
- Muestra resumen superior con conteos reales.
- Permite apagar recordatorios de tareas sin eliminar la tarea.
- Mantiene edición, activación y eliminación de recordatorios independientes.
- Usa `tasks.reminder_at` como fuente principal para recordatorios de tareas y evita duplicar datos.
- En la vista Hoy se muestra la hora del recordatorio junto a la campanita.
- No requiere migración nueva: funciona sobre el esquema v2.5 + estabilidad v2.5.9.

## v2.8 — Calendar UX Redesign + Alerts Flow
- Rediseña `/calendar` con estilo visual tipo referencia: encabezado simple, selector Semana/Mes, días seleccionables y línea de tiempo vertical.
- La vista semanal muestra actividades por horario con tarjetas pastel, ícono y color según tipo/hora.
- La vista mensual permite tocar un día y regresar automáticamente a la agenda semanal de ese día.
- Agrega botón flotante y botón superior `+` para crear actividades.
- Agrega flujo simplista de alertas desde el formulario de actividad.
- Las alertas se guardan como recordatorios independientes y aparecen en `/reminders` sin requerir migración nueva.
- Mantiene compatibilidad con la estructura Supabase actual de `calendar_events` y `reminders`.
