# Monkey Checks v2.13.9 — Unified Today Calendar Flow + Nested Calendar Cards

Base: v2.13.8 — Calendar Overflow + Mobile Sheet UX Fix.

## Cambios principales

- Regenerada desde base limpia v2.13.8.
- Hoy y Calendario quedan unificados para nuevas tareas rápidas.
- Una tarea creada desde **Hoy** ahora se guarda como `calendar_event` del día actual.
- Esa tarea aparece en **Hoy**, en **Calendario** y persiste después de refrescar.
- Calendario agrupa visualmente actividades internas dentro de actividades largas.
- Una actividad larga con tareas dentro se muestra como card contenedora.
- Las tareas internas no se duplican como cards separadas fuera del contenedor.
- Botón de expansión:
  - `Ver X tareas anidadas`
  - `Ocultar tareas anidadas`
- Las actividades individuales siguen apareciendo como cards separadas.
- Se conserva el fix mobile de v2.13.8:
  - sin desbordes horizontales,
  - cards compactas,
  - modal con scroll mejorado.
- No requiere migración nueva.

## Migraciones requeridas

Asegurate de tener corridas las migraciones hasta v2.13.7:

```txt
supabase/migrations/0001_v25_full_schema.sql
supabase/migrations/0002_v259_data_stability.sql
supabase/migrations/0003_v210_calendar_end_time.sql
supabase/migrations/0004_v2121_calendar_event_reminders.sql
supabase/migrations/0005_v213_wallet_extra_period_filters.sql
supabase/migrations/0006_v2135_calendar_recurrence.sql
supabase/migrations/0007_v2136_calendar_done_today_sync.sql
supabase/migrations/0008_v2137_calendar_event_completions.sql
```

## QA recomendado

```bash
npm install
npm run validate:assets
npm run typecheck
npm run build
```

Probar:

- Crear una tarea desde Hoy y verificar que aparece en Calendario.
- Refrescar y confirmar que la tarea sigue en Hoy y Calendario.
- Crear en Calendario una actividad larga, por ejemplo 07:30–12:00.
- Crear actividades internas a las 08:00 y 10:00.
- Confirmar que se agrupan dentro de la card principal.
- Confirmar que las actividades internas no aparecen duplicadas fuera del contenedor.
- Expandir/ocultar tareas anidadas.
- Probar en iPhone/Safari el scroll del modal y la vista calendario.

---

# Monkey Checks v2.13.5 — Calendar Recurring Activities UX

Base: v2.13.4.

## Cambios principales

- Agrega configuración de repetición en el modal de calendario sin sobrecargar el formulario principal.
- Nuevo sheet secundario **Repetición** con opciones:
  - No se repite
  - Todos los días
  - Días específicos
- Selector de días L, M, X, J, V, S, D.
- Campo opcional `Hasta cuándo` para terminar la repetición.
- Render de ocurrencias recurrentes en vista Semana y Mes.
- Las alertas ligadas a actividades recurrentes se evalúan solo cuando la ocurrencia corresponde al día actual.
- Migración nueva: `0006_v2135_calendar_recurrence.sql`.

## Migraciones requeridas

```txt
supabase/migrations/0001_v25_full_schema.sql
supabase/migrations/0002_v259_data_stability.sql
supabase/migrations/0003_v210_calendar_end_time.sql
supabase/migrations/0004_v2121_calendar_event_reminders.sql
supabase/migrations/0005_v213_wallet_extra_period_filters.sql
supabase/migrations/0006_v2135_calendar_recurrence.sql
```

## QA recomendado

```bash
npm install
npm run validate:assets
npm run typecheck
npm run build
```

Probar en calendario:

- Crear actividad única.
- Crear actividad diaria.
- Crear actividad en días específicos.
- Verificar que aparece en Semana y Mes.
- Verificar que una alerta recurrente solo se muestra en los días configurados.

---

# Monkey Checks v2.12.2 — Final QA Hardening

Monkey Checks es una app mobile-first para organizar tareas, calendario, recordatorios, notas, wallet y perfil con Supabase.

## Qué trae v2.12.2

- Hardening final sobre `v2.12.1`.
- Calendario con recordatorios ligados a eventos.
- Mejor manejo de sincronización y errores de alertas.
- Form sheets más seguros para móvil y doble submit.
- Validación de assets por script.
- Scripts de QA final.
- Dependencias fijadas, sin `latest`.

## Scripts

```bash
npm run dev
npm run validate:assets
npm run typecheck
npm run build
npm run qa:final
```

## Supabase

Antes de usar calendario con hora final y alertas ligadas a eventos, correr las migraciones:

```txt
supabase/migrations/0001_v25_full_schema.sql
supabase/migrations/0002_v259_data_stability.sql
supabase/migrations/0003_v210_calendar_end_time.sql
supabase/migrations/0004_v2121_calendar_event_reminders.sql
```

## Variables de entorno

```txt
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Solo para desarrollo local:

```txt
NEXT_PUBLIC_ALLOW_LOCAL_AUTH=true
```

## Preflight recomendado

```bash
npm install
npm run validate:assets
npm run qa:final
```

Ver también `FINAL_QA_CHECKLIST.md`.
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


## v2.12 — Production Readiness + Calendar Stability Fix

- Calendario semanal ahora muestra horas solo hasta mediodía por defecto y se expande automáticamente si hay actividades después.
- El indicador `+X más en esta hora` ahora es interactivo: muestra las actividades ocultas y se contrae automáticamente después de 5 segundos si no hay acción.
- Se agregaron nuevos íconos rápidos para la vista Hoy: meditar, bañarse, cepillarse, desayuno y despertar.
- Se agregó biblioteca de íconos para calendario en `public/assets/activities/calendar`.
- El selector de tipo de actividad del calendario ahora usa tarjetas con imagen, en lugar del select nativo con emojis.
- Se mantiene la lógica v2.10: horas reales, fin opcional, flag de duración y máximo 2 actividades visibles por hora.


## v2.12 — Production Readiness + Calendar Stability

Base: v2.11 — Calendar Smart Range + Icon Gallery.

Incluye:
- Sustitución de placeholders de `public/assets/activities` por los PNG reales entregados por el usuario.
- Normalización de nombres de íconos (`banarse.png`, `meditacion.png`, `ejercicio.png`).
- Selector de actividad de calendario con imágenes reales de `assets/activities/calendar`.
- Galería de íconos de Hoy con imágenes reales para meditar, bañarse, cepillarse, desayuno y despertar.
- Validación de conflictos para actividades largas: evita crear actividades ocultas dentro de horas ocupadas por una actividad de varias horas.
- Se mantiene la regla UX: variaciones dentro de la misma hora se agrupan en esa fila; máximo 2 visibles y `+X más` expandible.
- Feedback de sincronización en calendario cuando Supabase está cargando datos.
- Bottom sheets con botón principal sticky para mejorar uso en móvil.
- Preparado para correr `npm run typecheck` y `npm run build` antes del despliegue final.

## v2.12.1 — Production Readiness Real Fix

Base: v2.12 Production Readiness + Calendar Stability.

Cambios incluidos:
- Divide la vista de calendario en componentes reutilizables bajo `components/calendar/`:
  - `calendar-header.tsx`
  - `calendar-view-toggle.tsx`
  - `calendar-week-strip.tsx`
  - `calendar-day-summary.tsx`
  - `calendar-month-view.tsx`
  - `calendar-timeline.tsx`
- Fija versiones exactas en `package.json` para evitar builds rotos por dependencias `latest`.
- Agrega estados de sincronización en calendario: cargando, guardando, sincronizado y error.
- Liga alertas creadas desde calendario con su evento mediante `calendarEventId`.
- Al eliminar una actividad de calendario, elimina también su alerta relacionada.
- Agrega migración obligatoria `0004_v2121_calendar_event_reminders.sql` para `reminders.calendar_event_id`.
- Endurece el fallback local: en producción no se crea sesión mock/local si Supabase no está configurado.
- Mantiene las mejoras de v2.12 para assets reales, sheets móviles y validación de conflictos.

### Migración obligatoria para v2.12.1

Correr en Supabase SQL Editor después de `0003_v210_calendar_end_time.sql`:

```txt
supabase/migrations/0004_v2121_calendar_event_reminders.sql
```

### Validación recomendada

```bash
npm install
npm run typecheck
npm run build
```

## v2.13 — Wallet Period Filters + Browser Alerts

Base: v2.12.2 Final QA Hardening.

### Wallet
- La vista base de Wallet ahora es mensual.
- Semana se calcula por los últimos 7 días.
- Quincena se calcula como 01–14 o 15–fin de mes según la fecha actual.
- Los totales se calculan por fecha real del movimiento, no por el periodo seleccionado al crearlo.
- Se agrega el tipo de movimiento `extra` para ingresos ocasionales.
- Historial reciente con filtros por tipo: Todos, Ingreso, Extra, Gasto y Ahorro.
- Historial paginado de 5 movimientos por página.
- Botón de refrescar historial en vez de `+ movimiento`.
- Se elimina el botón `+ gasto` de categorías para reducir duplicidad.

### Alertas
- Se agrega motor global de alertas mientras la app está abierta.
- Se incluye modal de recordatorio con animación Lottie.
- Se agrega solicitud opcional de permiso para notificaciones del navegador.
- Si el navegador permite notificaciones, la app dispara notificación local además del modal.
- Se evita repetir la misma alerta muchas veces dentro del mismo minuto.

### Migración nueva
Ejecutar después de las migraciones previas:

```sql
supabase/migrations/0005_v213_wallet_extra_period_filters.sql
```

### QA recomendado
```bash
npm install
npm run validate:assets
npm run typecheck
npm run build
```


## v2.13.2 — Wallet TypeScript Build Fix

- Wallet reemplaza IDs temporales por IDs remotos de Supabase al crear movimientos y metas.
- Eliminar movimientos ya sincronizados usa el ID real remoto; si un movimiento temporal se elimina antes de sincronizar, se limpia también al completar la sincronización.
- Wallet corrige colores/íconos de movimientos remotos según tipo y categoría.
- Editar una actividad de calendario conserva su alerta existente; solo se elimina si el usuario elige explícitamente "Sin alerta".
- Login respeta `?next=/ruta` después de iniciar sesión.
- Copys finales eliminan referencias confusas a almacenamiento local.

### QA recomendado para v2.13.1

```bash
npm install
npm run validate:assets
npm run typecheck
npm run build
```

Pruebas manuales clave:

1. Crear movimiento Wallet, refrescar, eliminar y volver a refrescar.
2. Crear meta Wallet y refrescar.
3. Crear actividad con alerta, editar solo el nombre/hora y confirmar que la alerta se conserva.
4. Entrar a una ruta protegida como `/calendar`, iniciar sesión y validar que vuelve a esa ruta.


## v2.13.2 — Wallet TypeScript Build Fix

- Corrige inferencia TypeScript `never` en `hooks/use-wallet.ts` al sincronizar movimientos y metas de Wallet.
- Mantiene los fixes de v2.13.1 para Wallet sync, alertas y redirección de login.
- Versión orientada a pasar `npm run typecheck` y `npm run build` en Vercel.


## v2.13.3 — Wallet Group Selector + Smart Calendar Start

- Historial de Wallet usa selector de agrupamiento en lugar de chips horizontales para evitar scroll lateral.
- Se agregan nuevos íconos de meta: Laptop, Zapatos, Viaje, Ropa y Presente.
- El selector de meta en Wallet muestra los nuevos íconos desde `assets/wallet/icons/expenses`.
- La línea de tiempo del calendario inicia en la primera hora con actividad del día seleccionado para reducir espacios vacíos.
- Si el día no tiene actividades, se conserva la card de Día libre sin timeline.
- Mantiene v2.13.2 como base: sync de Wallet, alertas editables, login con `next` y browser alerts.

## v2.13.4 — Wallet Goals + 24h Calendar Timeline

- Wallet permite hasta 3 metas activas.
- Cada meta conserva su nombre, monto objetivo, monto actual e ícono.
- Nueva acción `+ monto` por meta para sumar avances sin recrear ni borrar la meta.
- El avance de metas se sincroniza con Supabase usando el mismo `wallet_goals` existente.
- El calendario acepta actividades durante las 24 horas del día (`00:00` a `23:59`).
- La línea de tiempo del calendario inicia en la primera hora con actividad del día seleccionado.
- Si la primera actividad es a la 01:00, inicia a la 01:00; si es a las 16:00, inicia a las 16:00.
- Si el día no tiene actividades, mantiene solo la card de Día libre.

### QA recomendado para v2.13.4

1. Crear 3 metas diferentes y verificar que se muestran juntas.
2. Intentar crear una cuarta meta y confirmar que muestra aviso.
3. Usar `+ monto` en una meta y verificar que aumenta el monto actual sin modificar objetivo/nombre.
4. Refrescar Wallet y confirmar persistencia de metas y avances.
5. Crear actividad a `01:00` en calendario y verificar que la línea inicia a `01:00`.
6. Crear actividad a `23:00` y confirmar que se visualiza correctamente.
7. Crear actividad a `00:30` y confirmar que se agrupa en la fila `00:00`.
8. Validar `npm run validate:assets`, `npm run typecheck` y `npm run build`.


## v2.13.6 — Calendar Nested Activities + Today Sync + Mobile Sheet Fix

- Las actividades largas del calendario ya no bloquean actividades internas.
- Las horas cubiertas por una actividad larga se ocultan solo si no tienen actividades propias.
- La vista Hoy ahora mezcla tareas del día y actividades del calendario que ocurren hoy, incluidas recurrencias.
- Las actividades del calendario pueden marcarse como completadas desde Hoy.
- Los checks visuales se cambiaron a bolitas para un look más suave.
- El bottom sheet ahora tiene header fijo, contenido scrolleable y footer fijo para mejorar iPhone/Safari.
- Nueva migración: `0007_v2136_calendar_done_today_sync.sql`.

## v2.13.7 — Today Calendar Completion + Nested Context Polish

- Hoy muestra una fuente clara para cada item: Tarea, Calendario o Recurrente.
- Las actividades anidadas muestran contexto tipo “Dentro de Clases”.
- Las tareas nuevas creadas desde Hoy guardan fecha real del día.
- Las actividades recurrentes se marcan como completadas por fecha usando `calendar_event_completions`.
- Hoy incluye estado de sincronización y botón manual de refresh.
- Se corrigió el error TypeScript de `conflict.title` inferido como `never`.
- Se agregaron utilidades en `lib/calendar/calendar-utils.ts` para fechas, recurrencias y completado por ocurrencia.

Migración nueva requerida:

```txt
supabase/migrations/0008_v2137_calendar_event_completions.sql
```


## v2.13.8 — Calendar Overflow + Mobile Sheet UX Fix

- Corrige desbordes horizontales en tarjetas del calendario, especialmente en actividades largas con rango de hora.
- Elimina la etiqueta textual “Dentro de…” en calendario y la reemplaza por una marca visual más limpia para actividades anidadas.
- Ajusta el timeline para mobile con columnas más seguras, truncado de títulos y pills de hora compactas.
- Mejora los bottom sheets en móvil con altura controlada, body lock, scroll interno más estable, header/footer fijos y mejor soporte para Safari/iPhone.
- No agrega migraciones nuevas; mantiene la base v2.13.7.

### QA recomendado v2.13.8

1. Crear actividad larga 07:30–12:00 con título largo y verificar que no se salga del card.
2. Crear actividad interna 10:00 dentro del bloque largo y verificar que no aparezca texto “Dentro de…”.
3. Abrir Nueva actividad en iPhone/Safari y confirmar que el contenido se puede deslizar arriba/abajo.
4. Probar modal de Repetición y confirmar que el botón principal queda visible y el contenido scrollea.
5. Ejecutar `npm run validate:assets`, `npm run typecheck` y `npm run build`.


## v2.14 — Today Edit + Calendar Sync Final

- La vista Hoy ahora permite editar actividades que vienen del calendario.
- Al editar desde Hoy se actualiza el mismo registro en Calendario.
- La campanita puede activarse o apagarse desde la card de Hoy y desde el editor de Hoy.
- El editor de Hoy conserva el selector visual de íconos/monitos.
- Las actividades creadas desde Hoy guardan `icon_key` para conservar el ícono elegido.
- Nueva migración: `supabase/migrations/0009_v214_calendar_event_icon_key.sql`.

### QA recomendado v2.14

1. Crear una tarea desde Hoy con ícono y hora.
2. Confirmar que aparece en Calendario en esa fecha.
3. Volver a Hoy, tocar la card, editar título/hora/color/ícono y guardar.
4. Confirmar que Calendario refleja el cambio.
5. Activar la campanita desde Hoy y revisar que aparece en Recordatorios.
6. Apagar la campanita desde Hoy y revisar que desaparece de Recordatorios.


## v2.15 — Recurring Edit/Delete + Unified Activity Types

Base: v2.14 — Today Edit + Calendar Sync Final.

Incluye:

- Control de recurrencias al editar o eliminar: `Solo esta fecha` o `Toda la repetición`.
- Nueva tabla `calendar_event_occurrence_overrides` para modificar/cancelar ocurrencias individuales sin afectar la serie.
- Nueva columna `activity_type_key` en `calendar_events` para métricas futuras.
- Selector único `Tipo de actividad` en Hoy y Calendario.
- Selector visual compartido con los iconos de actividades/monitos.
- `icon_key` se mantiene como imagen visual, `activity_type_key` como dato para estadísticas.
- Preparación PWA básica: `manifest.webmanifest` y `sw.js` para habilitar una siguiente fase de push real.

Migración nueva obligatoria:

```sql
supabase/migrations/0010_v215_recurring_overrides_activity_types.sql
```

QA recomendado:

1. Crear actividad recurrente diaria.
2. Editarla desde Hoy y elegir `Solo esta fecha`.
3. Confirmar que el día siguiente conserva la serie original.
4. Editarla desde Calendario y elegir `Toda la repetición`.
5. Confirmar que todas las ocurrencias futuras cambian.
6. Eliminar solo una fecha y confirmar que la serie sigue viva.
7. Crear tarea desde Hoy con tipo de actividad visual.
8. Confirmar que aparece en Calendario con el mismo icono/tipo.

## v2.16 — Background Push Notifications

Esta versión agrega notificaciones push reales en segundo plano usando PWA + Service Worker + Vercel Cron/API Route + Supabase.

### Migración nueva

Ejecutar después de las migraciones previas:

```txt
supabase/migrations/0011_v216_background_push_notifications.sql
```

### Variables de entorno requeridas en Vercel

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:tu-correo@dominio.com
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
```

Generar VAPID keys:

```bash
npx web-push generate-vapid-keys
```

`SUPABASE_SERVICE_ROLE_KEY` y `VAPID_PRIVATE_KEY` son privadas y nunca deben usarse en frontend.

### Vercel Cron recomendado

Crear un cron que llame cada minuto o cada 5 minutos a:

```txt
/api/cron/reminders
```

Enviar header:

```txt
Authorization: Bearer <CRON_SECRET>
```

### QA push

1. Login con usuario real.
2. Ir a Recordatorios.
3. Tocar Activar alertas.
4. Aceptar permisos del navegador.
5. Crear un recordatorio para 1-2 minutos después.
6. Cerrar la pestaña o dejar la app en segundo plano.
7. Ejecutar cron o esperar Vercel Cron.
8. Confirmar que llega la notificación.

Notas: iOS puede requerir instalar la app como PWA para permitir push web. El modal in-app sigue funcionando cuando la app está abierta.


---

## v2.16.1 — Reminder Upsert Fix + Push Runtime QA

Esta versión corrige el error runtime detectado al activar una campanita/alarma desde Hoy o Calendario:

```txt
/rest/v1/reminders?on_conflict=calendar_event_id → 400
```

### Cambios técnicos

- `upsertReminder` ya no depende de `onConflict: "calendar_event_id"` para recordatorios ligados a eventos.
- Cuando el recordatorio pertenece a una actividad de calendario, primero busca si existe por `user_id + calendar_event_id`.
- Si existe, actualiza el recordatorio.
- Si no existe, crea uno nuevo.
- Mantiene `upsert(..., onConflict: "id")` solo para recordatorios independientes.
- Agrega migración `0012_v2161_reminder_upsert_fix.sql`.
- La migración elimina duplicados antiguos por `calendar_event_id` y crea un índice único completo compatible con PostgREST.

### Migración obligatoria

Ejecutar después de `0011_v216_background_push_notifications.sql`:

```txt
supabase/migrations/0012_v2161_reminder_upsert_fix.sql
```

### QA recomendado

1. Entrar a `/today`.
2. Crear o usar una actividad de calendario.
3. Activar campanita.
4. Confirmar que ya no aparece “No se pudo activar la alarma”.
5. Ir a `/reminders` y validar que el recordatorio aparece.
6. Apagar campanita desde Hoy.
7. Validar que el recordatorio se elimina o desactiva.
8. Crear recordatorio con hora próxima y probar push/in-app alert.
9. Revisar `/api/cron/reminders` después de configurar `CRON_SECRET` y VAPID.

## v2.16.2 — Today Completion Animation + Monkey Activity System

Ajustes UX/UI sobre v2.16.1:

- Hero de Hoy refinado: el mono queda mejor centrado verticalmente y el fondo tiene movimiento sutil con blobs/shine animado.
- Al completar una actividad desde Hoy, la card hace una animación de brinquito + salida suave y se oculta únicamente de la vista Hoy.
- La actividad completada permanece visible en Calendario con estilo tachado/suavizado.
- Se agrega flag flotante `Completada · Deshacer` para recuperar una actividad marcada por error.
- El selector `Tipo de actividad` ahora usa solo actividades con monitos como fuente principal.
- Se agrega carpeta limpia `public/assets/activities/monkeys` usando los assets de `activities(1).zip`.
- Los monitos transparentes reciben fondo pastel por CSS, sin modificar los PNG originales.
- Hoy y Calendario usan el mismo catálogo visual de actividades, listo para métricas futuras por `activity_type_key`.
- Se conserva compatibilidad con `icon_key`/tipos antiguos mediante alias internos.

QA recomendado:

1. Crear una actividad en Hoy con un tipo de monito.
2. Confirmar que aparece en Calendario con el mismo tipo.
3. Completar la actividad desde Hoy.
4. Confirmar animación de salida + flag `Deshacer`.
5. No tocar deshacer y confirmar que desaparece de Hoy.
6. Revisar Calendario: debe permanecer visible como completada/tachada.
7. Crear una actividad recurrente, completarla solo hoy y validar que mañana siga pendiente.
