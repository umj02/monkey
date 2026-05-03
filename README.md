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

## v2.9 — Calendar Timeline Empty State Fix

Esta versión toma como base v2.8 y ajusta la experiencia del calendario:

- Corrige la línea de tiempo para que las actividades aparezcan aunque no estén exactamente en horas pares.
- Agrupa actividades dentro del rango horario correcto, por ejemplo 09:00 dentro de 08:00 - 10:00.
- Muestra la hora exacta dentro de cada bloque de actividad.
- Cuando un día no tiene actividades, se oculta la línea de horas y aparece únicamente el estado “Día libre”.
- Mantiene el diseño visual de v2.8 y el flujo de alertas conectado a recordatorios.


## v2.10 — Calendar Hour Rows + Compact Activity Editor

Base: v2.9 Calendar Timeline Fix.

Cambios incluidos:
- Timeline del calendario vuelve a horas reales de 06:00 a 20:00, hora por hora.
- Actividades creadas a 09:15 se muestran dentro de la fila 09:00 con su hora exacta.
- Nueva hora final opcional para actividades largas.
- Las actividades largas no agrandan filas; se muestran con flag de duración, por ejemplo `09:00–12:00 · 3 h`.
- Las filas intermedias ocupadas por una actividad larga se ocultan para mantener una lectura limpia en móvil.
- Máximo 2 actividades visibles por hora; si hay más, se muestra un indicador compacto.
- Editor de actividad más compacto con selector desplegable de tipo y alerta.
- Eliminación movida al editor de actividad para limpiar el timeline.
- Corrección de overflow en cards de Hoy para textos largos y badges de hora.
- Migración opcional `0003_v210_calendar_end_time.sql` para persistir `end_time` en Supabase.


## v2.11 — Calendar Smart Range + Icon Gallery Fix

- Calendario semanal ahora muestra horas solo hasta mediodía por defecto y se expande automáticamente si hay actividades después.
- El indicador `+X más en esta hora` ahora es interactivo: muestra las actividades ocultas y se contrae automáticamente después de 5 segundos si no hay acción.
- Se agregaron nuevos íconos rápidos para la vista Hoy: meditar, bañarse, cepillarse, desayuno y despertar.
- Se agregó biblioteca de íconos para calendario en `public/assets/activities/calendar`.
- El selector de tipo de actividad del calendario ahora usa tarjetas con imagen, en lugar del select nativo con emojis.
- Se mantiene la lógica v2.10: horas reales, fin opcional, flag de duración y máximo 2 actividades visibles por hora.
