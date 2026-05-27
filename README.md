
## v2.18.8 — Welcome Visual Scale + Playful Motion Polish

- Aumenta ligeramente el visual principal del onboarding sin tocar el alto del card.
- Agrega entrada con rebote suave para imagen y copy.
- Mejora la microinteracción del botón **Siguiente / Ir a Hoy** con respiración y flecha animada.
- Agrega bounce sutil al dot activo del carrusel.
- Mantiene la composición aprobada de v2.18.7, el flujo `/welcome`, `/welcome?review=1`, `hasCompletedOnboarding`, Learn desde Hoy y acceso desde Settings.

# Monkey Checks v2.18 — Welcome Onboarding UX

Base: v2.17.1 — Planned Expenses Frequency UX Fix.

## Cambios principales

- Nueva ruta `/welcome` con onboarding visual de 8 cards.
- Las pantallas de onboarding usan los fondos entregados en `Pantallas.zip`.
- El onboarding aparece automáticamente después del login cuando el usuario todavía no lo completó.
- El primer card **Tu día** incluye botón **Omitir**, que marca la guía como vista y envía al usuario a `/today`.
- La última pantalla usa **Ir a Hoy** y también marca la guía como completada.
- En la vista **Hoy** se agregó botón de ayuda/learn para repasar la guía cuando el usuario quiera.
- En **Configuración** se agregó acceso **Ver guía de uso**.
- El carrusel soporta avanzar, regresar y swipe horizontal en móvil.
- Se agregó estado persistente `profiles.has_completed_onboarding` para que la guía solo se muestre una vez a usuarios nuevos.
- Usuarios existentes quedan marcados como onboarding completado en la migración para no forzarles la guía después del upgrade.

## Cards incluidas

1. Tu día en un solo lugar.
2. Creá actividades rápidas.
3. Planificá por horas.
4. No se te olvida nada.
5. Marcá avances.
6. Controlá tu dinero.
7. Ganate medallas.
8. Todo listo.

## Migración nueva

```txt
supabase/migrations/0014_v218_welcome_onboarding.sql
```

Esta migración agrega `has_completed_onboarding` a `profiles`.

## QA recomendado

```bash
npm install
npm run validate:assets
npm run typecheck
npm run build
```

Probar:

- Login con usuario nuevo → debe ir a `/welcome`.
- En el primer card tocar **Omitir** → debe ir a `/today` y no volver a mostrar onboarding.
- Completar las 8 cards → **Ir a Hoy** marca la guía como completada.
- Cerrar sesión y volver a entrar → debe ir directo a `/today`.
- En `/today` tocar el botón learn/ayuda → debe abrir `/welcome?review=1`.
- En Configuración → **Ver guía de uso** abre el onboarding para repaso.
- Validar swipe horizontal en móvil.

## Migraciones acumuladas requeridas

```txt
0001_v25_full_schema.sql
0002_v259_data_stability.sql
0003_v210_calendar_end_time.sql
0004_v2121_calendar_event_reminders.sql
0005_v213_wallet_extra_period_filters.sql
0006_v2135_calendar_recurrence.sql
0007_v2136_calendar_done_today_sync.sql
0008_v2137_calendar_event_completions.sql
0009_v214_calendar_event_icon_key.sql
0010_v215_recurring_overrides_activity_types.sql
0011_v216_background_push_notifications.sql
0012_v2161_reminder_upsert_fix.sql
0013_v217_budget_planned_expenses.sql
0014_v218_welcome_onboarding.sql
```


## v2.18.3 — Register Onboarding Type Fix

- Corrige el typecheck de `app/register/page.tsx` agregando `hasCompletedOnboarding: false` al perfil creado en registro.
- Si un registro local/mock crea sesión inmediata, redirige a `/welcome` para mantener el flujo de onboarding.


## v2.18.3 — Welcome Suspense Build Fix

- Corrige el build de Next.js en `/welcome` envolviendo `useSearchParams` dentro de un `Suspense` boundary.
- Mantiene el onboarding de 8 cards, botón Omitir, botón Learn en Hoy y acceso desde Settings.


## v2.18.3 — Welcome Overlay Copy Polish

- Onboarding renderiza textos, dots y botones reales sobre los fondos visuales.
- Se mantiene el diseño de las 8 pantallas de bienvenida, pero ya no depende de que los textos estén incrustados en la imagen.
- Botón “Omitir guía” en el primer card.
- Botones Atrás/Siguiente/Ir a Hoy reales, accesibles y animados.
- Conserva swipe móvil, review desde Hoy y acceso desde Settings.

## v2.18.4 — Welcome Layout Polish + Mobile Fit

- Regenerada desde base limpia v2.18.3.
- Ajusta el layout responsive de `/welcome` para que textos, imagen y botones no se monten entre sí.
- Botón **Omitir guía** queda fuera del card en el primer paso.
- Botón **Cerrar guía** queda fuera del card cuando se abre en modo repaso (`/welcome?review=1`).
- Títulos y textos se reducen para móvil y quedan mejor contenidos en el área superior.
- Dots más compactos.
- Botones Atrás/Siguiente/Ir a Hoy más proporcionados.
- Card más estable usando `100dvh`, safe-area y altura mínima controlada.
- No modifica la lógica de onboarding, perfiles, migraciones, push, wallet ni calendario.


## v2.18.5 — Welcome Card Height + Overlay Fit

- Ajusta el onboarding sobre base v2.18.4.
- Card principal ahora usa altura mínima 620px para separar mejor título, texto, visual y botones.
- Reduce tamaños de título/texto y mueve el bloque superior para evitar sobreposición con la imagen.
- Mantiene Omitir guía/Cerrar guía fuera del card y no cambia la lógica de onboarding.

## v2.18.7 — Welcome Final Motion + Copy Fit

- Ajusta el onboarding sobre la base v2.18.5.
- Reduce ligeramente las imágenes de fondo para que no queden tan justas dentro del card.
- Simplifica los textos descriptivos de los 8 cards.
- Elimina el difuminado blanco que cubría los visuales.
- Mejora la transición entre cards con animación de copy + imagen.
- Agrega animación sutil al botón “Siguiente / Ir a Hoy”.
- Cambia el botón Learn de Hoy de ícono “?” a ícono de librito.
- No cambia Supabase, migraciones, autenticación, Wallet, calendario ni push.


## v2.18.7 — Welcome Typography + Composition Fix

- Ajusta composición del onboarding para evitar que los dots se monten sobre los títulos.
- Aumenta ligeramente el visual de fondo sin cambiar el alto del card.
- Reduce y compacta copy para separar mejor texto, imagen y botones.
- Mantiene la lógica de onboarding de v2.18.x sin migraciones nuevas.

## v2.19.1 — Analytics Foundation Regenerada Full Pro

Base validada: `v2.18.8 — Welcome Visual Scale + Playful Motion Polish`.

Esta versión regenera la capa de analítica desde una base limpia, sin reutilizar el ZIP v2.19/v2.19.1 anterior.

### Incluye

- Nueva ruta protegida `/analytics` dentro de `AppShell`.
- Acceso a Analítica desde:
  - Hoy.
  - Perfil.
  - Configuración.
- Selector Semana / Mes.
- Resumen de cumplimiento general.
- Conteo de actividades completadas vs. total.
- Días activos.
- Racha de días con actividad completada.
- Métricas combinadas de:
  - tareas de Hoy,
  - calendario,
  - completions de calendario,
  - Wallet/Budget.
- Actividades por tipo usando `AssetThumb` correctamente con `icon`.
- Rutinas constantes por repetición de actividad.
- Resumen financiero de Wallet:
  - ingresos,
  - extras,
  - gastos,
  - ahorros,
  - uso de presupuesto,
  - meta principal.
- Card futura para Logros y Medallas.
- Versión visible en Settings actualizada a `2.19.1`.

### Validación recomendada

```bash
npm install
npm run validate:assets
npm run typecheck
npm run build
```

### Nota técnica

No se agregan migraciones nuevas en esta versión. Analytics consume información existente de tareas, calendario, completions y Wallet.

## v2.19.2 — Analytics UX Polish + Empty States

Base validada: `v2.19.1 — Analytics Foundation Regenerada Full Pro`.

### Incluye

- Pulido UX/UI completo de `/analytics` sin cambiar Supabase ni migraciones.
- Empty states reales para:
  - primer reporte sin datos,
  - ritmo por día,
  - actividades por tipo,
  - rutinas constantes,
  - Wallet/Budget.
- CTAs contextuales hacia Hoy, Calendario y Wallet cuando no hay información suficiente.
- Nuevas tarjetas de insight:
  - mejor día,
  - actividad top,
  - balance del período.
- Banner de sincronización/error más claro.
- Bloque “Fuentes del reporte” para explicar de dónde salen los números.
- Selector Semana/Mes con `aria-pressed` para accesibilidad.
- Versión visible en Settings actualizada a `2.19.2`.
- No agrega migraciones nuevas.

### QA recomendado

```bash
npm install
npm run validate:assets
npm run typecheck
npm run build
```

Probar en `/analytics`:

- Usuario sin datos: debe mostrar empty states y CTAs.
- Usuario con tareas de Hoy completadas: debe mostrar porcentaje, ritmo por día y actividades por tipo.
- Usuario con eventos de calendario completados: debe sumarlos al reporte.
- Usuario con Wallet/Budget: debe mostrar resumen financiero y balance.
- Cambiar Semana/Mes sin perder layout ni romper scroll móvil.

## v2.20 — Achievements + Badges Foundation

Base validada: `v2.19.2 — Analytics UX Polish + Empty States`.

Esta versión activa la base real de logros y medallas sin agregar migraciones nuevas. Los logros se calculan de forma derivada usando datos existentes de Hoy, Calendario, completions, Wallet y onboarding.

### Incluye

- Nueva ruta `/achievements` protegida por `AppShell`.
- Tablero de medallas con progreso general.
- Filtros: Todos, Ganados y Próximos.
- Logros por tareas/checks de Hoy.
- Logros por racha y constancia.
- Logros por Calendario.
- Logros por Wallet, presupuesto, metas y ahorro.
- Logro especial de guía/onboarding completado.
- Card de próximo logro con progreso.
- Resumen por grupo: Hoy, Calendario, Wallet y Crecimiento.
- Integración en `/analytics` con conteo real de medallas y link al tablero.
- Accesos desde Perfil y Configuración.
- Versión visible en Settings actualizada a `2.20.0`.

## v2.20.1 — Achievements UX Polish + Empty States

Base validada: `v2.20.0 — Achievements + Badges Foundation`.

### Incluye

- Pulido visual completo de `/achievements`.
- Empty state inicial para usuarios sin datos.
- Empty state por filtro cuando no hay medallas ganadas o próximas visibles.
- Conteos visibles en filtros Todos / Ganados / Próximos.
- Cards de grupo con descripción breve para Hoy, Calendario, Wallet y Crecimiento.
- Card de próximo logro con porcentaje explícito.
- Tips accionables para desbloquear medallas desde Hoy, Calendario y Wallet.
- Mensajes más humanos para medallas bloqueadas.
- Versión visible actualizada a `2.20.1`.
- Sin migraciones nuevas de Supabase.

## v2.21 — Persistent Achievements + Supabase Sync

Base validada: `v2.20.1 — Achievements UX Polish + Empty States`.

Esta versión convierte los logros en un sistema persistente conectado a Supabase:

- Nueva migración `0015_v221_persistent_achievements.sql`.
- Nueva tabla `achievement_unlocks` con RLS por usuario.
- Guarda `achievement_id`, `unlocked_at`, `source_progress` y `metadata`.
- `/achievements` conserva medallas desbloqueadas aunque después cambie el cálculo derivado.
- Las cards muestran fecha de desbloqueo cuando el logro ya está sincronizado.
- `/analytics` lee el resultado persistente y muestra estado de sync de medallas.
- Se mantiene el cálculo local/derivado como fallback y como fuente para detectar nuevos desbloqueos.
- Versión visible en Settings actualizada a `2.21.1`.

### Migraciones requeridas

Ejecutar en Supabase en este orden acumulado:

1. `0001_v25_full_schema.sql`
2. `0002_v259_data_stability.sql`
3. `0003_v210_calendar_end_time.sql`
4. `0004_v2121_calendar_event_reminders.sql`
5. `0005_v213_wallet_extra_period_filters.sql`
6. `0006_v2135_calendar_recurrence.sql`
7. `0007_v2136_calendar_done_today_sync.sql`
8. `0008_v2137_calendar_event_completions.sql`
9. `0009_v214_calendar_event_icon_key.sql`
10. `0010_v215_recurring_overrides_activity_types.sql`
11. `0011_v216_background_push_notifications.sql`
12. `0012_v2161_reminder_upsert_fix.sql`
13. `0013_v217_budget_planned_expenses.sql`
14. `0014_v218_welcome_onboarding.sql`
15. `0015_v221_persistent_achievements.sql`

### QA sugerido

```bash
npm install
npm run validate:assets
npm run typecheck
npm run build
```

Pruebas manuales clave:

- Entrar a `/achievements` con usuario nuevo.
- Completar una tarea en Hoy y verificar que se desbloquee `Primer check`.
- Refrescar la app y confirmar que la medalla siga guardada.
- Revisar que `/analytics` muestre el avance persistente.
- Confirmar en Supabase que se cree una fila en `achievement_unlocks`.



## v2.21.1 — Achievement Sync Polish + Unlock Feedback

Base: `v2.21 — Persistent Achievements + Supabase Sync`.

Cambios principales:

- Feedback visual cuando se desbloquean nuevas medallas.
- Las medallas ya persistidas no se vuelven a animar como nuevas al recargar.
- `usePersistentAchievements` expone `recentUnlockIds`, `lastSyncedAt` y `clearRecentUnlocks`.
- El guardado de logros revisa primero los existentes y solo inserta desbloqueos nuevos.
- El `upsert` usa `ignoreDuplicates: true` para evitar actualizar innecesariamente registros ya guardados.
- El historial conserva `unlocked_at` como fecha original del logro.
- Cards de logros resaltan medallas recién desbloqueadas con estado `Nueva`.
- Logros ganados se ordenan por fecha de desbloqueo para una lectura más natural.
- Estado de sincronización muestra la hora del último sync.
- Sin migraciones nuevas; usa `0015_v221_persistent_achievements.sql`.

QA recomendado:

```bash
npm install
npm run validate:assets
npm run typecheck
npm run build
```

Validación funcional sugerida:

1. Entrar con usuario real Supabase.
2. Crear o completar una acción que desbloquee una medalla.
3. Confirmar banner de logro nuevo.
4. Recargar la página.
5. Confirmar que la medalla sigue guardada, pero no vuelve a animarse como nueva.
6. Revisar `achievement_unlocks` y confirmar que no se duplican registros por usuario/logro.


## v2.22 — Achievement Notifications + Reward Moment Polish

Base: v2.21.1 — Achievement Sync Polish + Unlock Feedback.

Incluye:

- Nuevo motor global `AchievementRewardEngine` montado dentro de `AppShell`.
- Feedback visual de logro desbloqueado desde pantallas protegidas como Hoy, Calendario, Wallet, Analítica, Perfil y Settings.
- Evita duplicar el feedback dentro de `/achievements`, donde ya existe el banner propio de medallas.
- Agrupa varios logros desbloqueados juntos para evitar spam visual.
- Auto-cierre con barra de tiempo de 7.2s.
- Botones rápidos hacia `/achievements` y `/analytics`.
- Respeta la persistencia de v2.21: las medallas ya guardadas no se vuelven a mostrar como nuevas al recargar.
- Sin migraciones nuevas; reutiliza `achievement_unlocks`.

QA recomendado:

```bash
npm install
npm run validate:assets
npm run typecheck
npm run build
```

Pruebas manuales:

1. Iniciar sesión con usuario real de Supabase.
2. Desbloquear un logro desde Hoy o Calendario.
3. Confirmar que aparece el reward moment global.
4. Refrescar la app y confirmar que el mismo logro no se anima otra vez.
5. Ir a `/achievements` y confirmar fecha/estado persistido.
6. Desbloquear varios logros en una acción y confirmar que se agrupan en una sola notificación.


## v2.22.1 — Reward Moment UX Polish + Mobile QA
- Integra assets dedicados de trofeo y medallas oro/plata/bronce.
- Usa ilustraciones del mono para reward moments según tier.
- Ajusta el momento de recompensa para móvil con overlay, CTA más claros y cierre manual.
- Mejora tarjetas de logros y el resumen de analítica con iconografía visual de logros.


## v2.24 — Parent/Guardian View + Shared Progress
- Nueva ruta `/guardian-share`.
- Genera una vista segura de solo lectura para padre/madre/encargado.
- Comparte snapshot de progreso semanal sin datos de login ni capacidad de edición.
- Permite controlar alias visible y si se incluye o no el resumen Wallet.
- Integra acceso desde Perfil, Configuración, Analítica y Resumen semanal.
- No requiere migración nueva de Supabase.


## v2.27.0 — Guardian Share UX Polish + Mobile QA
- Pule `/guardian-share` con mejor copy, privacidad granular y QA móvil.
- Agrega controles para ocultar/mostrar Calendario, Logros, Mejor día, Racha y Wallet antes de generar el link.
- Agrega expiración local del snapshot compartido: 7, 14 o 30 días.
- Maneja links inválidos y vencidos con pantallas públicas claras.
- Mejora el link largo con estado de expiración, regeneración y copia más clara.
- Mantiene la estrategia sin migración nueva; el link sigue siendo un snapshot local de solo lectura.

QA recomendado:
1. Crear link con Wallet oculto y verificar que la vista pública no lo muestre.
2. Ocultar Calendario/Logros/Mejor día/Racha y confirmar que aparezcan como privados/ocultos.
3. Copiar un link generado y abrirlo en ventana privada.
4. Probar un `?share=abc` inválido y confirmar pantalla de error.
5. Ejecutar `npm run validate:assets`, `npm run typecheck` y `npm run build`.


## v2.25 — Secure Guardian Share Tokens + Supabase Sync

- Agrega migración `0016_v225_guardian_share_tokens.sql`.
- Los links de encargado ahora usan token corto `?token=...` en lugar de cargar todo el snapshot en la URL.
- El snapshot se guarda en Supabase en `guardian_share_tokens`.
- Incluye expiración, revocación manual, estado de link revocado/vencido y función pública segura `get_guardian_share_by_token`.
- Mantiene compatibilidad de lectura con links legacy `?share=...` de v2.24.x.

QA recomendado:
1. Ejecutar la migración 0016 en Supabase.
2. Generar link desde `/guardian-share`.
3. Confirmar que el link usa `?token=`.
4. Abrir en ventana privada y validar vista pública.
5. Revocar link y confirmar pantalla de link desactivado.
6. Correr `npm run validate:assets`, `npm run typecheck`, `npm run build`.


## v2.26 — Activity & Wallet Asset Centralization + Custom Categories Foundation
- Centraliza monitos en `public/assets/monitos/` e iconos en `public/assets/icons/`.
- Alinea categorías de actividades y Wallet con keys estables para analítica.
- Agrega migración `0017_v226_user_category_preferences.sql` para preferencias/categorías por usuario.
- Agrega `/settings/categories` para editar nombres visibles, iconos, visibilidad y crear categorías custom.
- Mantiene aliases legacy para datos antiguos de actividades e iconos.


## v2.27 — Custom Image Upload + Supabase Storage
- Permite subir imágenes propias para categorías desde `/settings/categories`.
- Usa el bucket público `custom-category-assets` con límite de 2 MB y mime types PNG/JPG/WEBP/GIF.
- La imagen subida se guarda en `user_category_preferences.image_path` y la key histórica se mantiene estable para analítica.
- No reemplaza el catálogo base: el usuario puede volver a usar un icono/monito del catálogo cuando quiera.
- Requiere ejecutar `supabase/migrations/0018_v227_custom_category_assets_storage.sql`.

## v2.27.2 — Category Preferences API Key Mapping Hotfix

Hotfix sobre v2.27 para corregir el error runtime `400 Bad Request` en `/rest/v1/user_category_preferences` cuando el frontend consultaba `key` pero la tabla real usa `category_key`.

Cambios:

- `lib/services/category-preferences-service.ts` ahora consulta `category_key`.
- El frontend mantiene `key` como nombre interno estable para no tocar pickers ni analytics.
- Insert/update usa `category_key` y `onConflict: "user_id,scope,category_key"`.
- Delete usa `.eq("category_key", key)`.
- Nueva migración `0019_v2271_category_preferences_category_key_hotfix.sql` para alinear instalaciones que todavía tengan columna `key`.
- Refresca PostgREST con `notify pgrst, 'reload schema'`.

Validación esperada:

```bash
npm install
npm run validate:assets
npm run typecheck
npm run build
```

SQL recomendado antes del CLI:

```sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
and table_name = 'user_category_preferences'
order by ordinal_position;
```

Debe existir `category_key`. Después de la migración ya no debería aparecer el error de GET 400 por `key` inexistente.


## v2.27.2 — Analytics Category Alignment + Stable Keys

Alinea categorías personalizadas con Analytics sin romper datos existentes.

- Analytics resuelve actividades usando `user_category_preferences`.
- Calendario y Hoy guardan `activityTypeKey` estable, respetando label/icono/imagen personalizados.
- Wallet prepara `category_key` estable en transacciones y gastos planificados.
- Analytics agrupa Wallet por key estable y muestra el label personalizado.
- Agrega migración `0020_v2272_analytics_category_alignment_stable_keys.sql`.

Validación recomendada:

```bash
npm install
npm run validate:assets
npm run typecheck
npm run build
```



## v2.28.1.7 — Challenge Reward Economy + UX Final Polish

Base: v2.28.1.6 — Partial Banana Rewards + Daily Completion Modal QA.

- Refuerza la economía de bananas separando visualmente cobradas, por cobrar, perdidas y retos cerrados.
- Permite cierres parciales: si un reto tiene checks perdidos, se pueden cobrar solo las bananas realmente ganadas cuando todos los checks queden cerrados.
- Mejora los textos de estado de los cards para que sean más claros: reto perfecto, cierre parcial, próximo check, tareas de hoy y reto cerrado.
- Agrega historial visual de bananas perdidas calculado desde los retos, sin crear migraciones nuevas.
- Ajusta el modal de Hoy: el cierre del día se comunica como progreso diario, no como cobro inmediato si el reto todavía no terminó.
- Agrega acción para cancelar un reto sin borrar historial, conservando la medición para Analytics.
- Mejora Analytics con porcentaje de cumplimiento de retos.
- No toca dependencias, package.json, lockfiles, next.config, Vercel ni migraciones.

## v2.28.1 — Challenges UX Polish + Completion QA

Base: v2.28 estable.

- Pule la pantalla `/challenges` para móvil con estados de sincronización, próximos checks y progreso más claro.
- Evita crear el mismo reto activo dos veces desde las sugerencias.
- Mejora el flujo de cobro: antes de liberar bananas, sincroniza el estado de tareas del reto con los checks reales de Calendario/Hoy.
- Hoy muestra las actividades de reto como `Reto`, mantiene bloqueo de edición y usa mensajes específicos al completar o desmarcar.
- Las bananas siguen separadas del Wallet financiero mediante `banana_ledger`.
- No requiere migración nueva; usa la estructura de v2.28.

## v2.28 — Personal Challenges + Banana Rewards Foundation

Base: v2.27.2 — Analytics Category Alignment + Stable Keys.

### Objetivo

Agregar una primera base de retos personales sin cambiar la dinámica normal de Monkey Checks. Las tareas normales siguen siendo editables y borrables; las tareas creadas por reto quedan marcadas como especiales y bloqueadas para mantener una medición más limpia.

### Cambios principales

- Nueva ruta `/challenges` para retos personales y bananas.
- Nuevos retos sugeridos: agua, caminar, ordenar espacio y respirar/pausar.
- Al aceptar un reto, se crean actividades especiales automáticamente en Calendario y Hoy.
- Las actividades de reto quedan con metadata:
  - `source: personal_challenge`
  - `challengeId`
  - `challengeTaskId`
  - `isLocked`
  - `verificationStatus`
  - `rewardBananas`
- Las actividades de reto no se editan ni eliminan desde Calendar/Hoy; se completan con check como el resto.
- Nuevo Wallet de logros basado en bananas, separado del Wallet financiero.
- Nueva tabla `banana_ledger` para historial auditable de bananas.
- Analytics muestra un bloque de retos/bananas y conecta con `/challenges`.
- Settings agrega acceso a **Retos y bananas**.

### Migración nueva

```txt
supabase/migrations/0021_v228_personal_challenges_banana_rewards.sql
```

Agrega columnas seguras a `calendar_events` y crea:

```txt
personal_challenges
challenge_tasks
banana_ledger
```

### QA recomendado

```bash
cd ~/Documents/"Web Projects"/monkey
npm install
npm run validate:assets
npm run typecheck
npm run build
```

Probar:

1. Ejecutar migración `0021_v228_personal_challenges_banana_rewards.sql`.
2. Entrar a `/challenges`.
3. Crear un reto de 1 día con 1–3 horarios.
4. Validar que aparecen actividades en `/today` y `/calendar`.
5. Intentar editar una actividad de reto desde Hoy/Calendario: debe bloquear edición.
6. Marcar checks del reto desde Hoy.
7. Volver a `/challenges` y cobrar bananas cuando el reto esté completo.
8. Verificar que Analytics muestra el bloque de retos/bananas.

### Alcance no incluido todavía

- Retos padre/hijo.
- Validación por encargado.
- Canje real de premios.
- Evidencias con fotos.
- Notificaciones push específicas de retos.

Estos quedan preparados para una versión futura sobre esta base.


## v2.28.1.8 — Challenge State Consistency + Builder Preview QA

- Agrega recursos visuales en `public/assets/rewards`: trofeos oro/plata/bronce, banana de oro y racimo de bananas de oro.
- Mejora el preview del creador de retos antes de guardar: checks, fechas, horarios y bananas posibles.
- Refuerza la economía visual de retos: trofeo por estado, bananas en historial y modal de día completado.
- No toca dependencias, package-lock, next.config, vercel.json ni migraciones.


## v2.28.1.8.1 — Challenge Button Labels + Cancelled Future Checks Polish

- Botones de reto más claros: `Ya cobrado`, `Reto cancelado`, `Cobrar X bananas`, `Ver tareas de hoy` y `Ver próximo check`.
- Los retos cancelados conservan historial, pero sus checks futuros ya no aparecen como tareas activas en Hoy/Calendario.
- Analytics y cards mantienen el historial sin contar retos cancelados como acciones pendientes.

## v2.28.1.9 — Friendly UX Copy + Rewards Intro Modal Polish

- Fix visual del hero de Hoy: ahora renderiza el monito en lugar de mostrar la key técnica.
- Modal motivacional diario de Retos y bananas en Hoy, con animación de entrada/salida tipo brinco y arte de banana.
- Switch en Retos y bananas para apagar o encender el aviso diario.
- Navegación inferior: Perfil pasa a Cuenta.
- Ajustes de copy: Tema pasa a Configuración y se reducen textos técnicos visibles.
- Builder de reto personalizado con microcopy por campo y selector visual de monitos/iconos.
- Sin cambios en dependencias, package.json, next.config, vercel.json o migraciones.

## v2.28.1.9.1 — Rewards modal CTA + Challenge icon folder polish

- Ajusta el modal diario de Retos y bananas para que el título y el CTA sean legibles sobre el fondo verde/amarillo.
- Centraliza iconos de retos en `public/assets/challenge`.
- El selector visual de retos usa iconos específicos de retos y muestra 8 opciones visibles por página/scroll para evitar cortes en móvil.
- No toca dependencias, lockfiles, configuración de Vercel ni migraciones.

## v2.28.1.10 — Challenge Rewards Readiness + Medal Integration QA

Base: v2.28.1.9.2.

Cambios aplicados sin tocar dependencias ni configuración:

- Se agregó una capa visual de medallas de retos en `/challenges`.
- Se agregó una sección de medallas de constancia en `/achievements` conectada a retos y bananas.
- `/analytics` ahora cuenta mejor retos perfectos, cierres parciales, bananas cobradas, bananas por cobrar, bananas no ganadas y próximo check.
- El preview del builder explica de forma más clara cuántos checks se crearán, fechas, horarios y bananas por check.
- Se mantiene la economía limpia: bananas como puntos, medallas como hitos, retos como acciones especiales.

Archivos intencionalmente no modificados:

- `package.json`
- `package-lock.json`
- `next.config.mjs`
- `tsconfig.json`
- `vercel.json`
- `supabase/migrations/*`

## v2.28.1.11 — Friendly UX Copy + Auth Flow Reset QA

Base: `v2.28.1.10 — Challenge Rewards Readiness + Medal Integration QA`.

Objetivo: cerrar la experiencia individual antes de avanzar a retos padre/hijo, sin tocar dependencias, Vercel, lockfiles ni migraciones.

Cambios principales:

- Cerrar sesión ahora devuelve al inicio/intro (`/`) en vez de quedarse en la pantalla anterior.
- Iniciar sesión ahora entra siempre a `/today`, sin reutilizar `next` de rutas anteriores.
- AppShell ya no conserva `next=/ruta-anterior` cuando una sesión queda inactiva.
- Copy de Retos y bananas más corto, más amigable y menos técnico.
- Copy de Analytics y Medallas más humano: `reclamadas`, `listas`, `no ganadas`, `completados`.
- Se reducen textos visibles como `sincronizado/sync/Supabase` en pantallas de usuario cuando se podían expresar de forma más clara.
- Se mantiene la lógica de retos, bananas, medallas y calendario sin cambios de esquema.

No se modifica:

- `package.json`
- `package-lock.json`
- `next.config.mjs`
- `tsconfig.json`
- `vercel.json`
- dependencias
- migraciones Supabase

Validación esperada:

```bash
npm install
npm run validate:assets
npm run typecheck
npm run build
```

Pruebas UX:

1. Cerrar sesión desde Cuenta debe enviar a `/`.
2. Iniciar sesión debe entrar a `/today`.
3. Entrar a Retos y bananas y validar textos más cortos.
4. Revisar Analytics y Medallas para confirmar que no se muestran textos técnicos.
5. Confirmar que retos/bananas siguen reclamando y mostrando historial correctamente.

## v2.28.1.12 — Today Time Windows + Expired Tasks UX

Base: `v2.28.1.11 — Friendly UX Copy + Auth Flow Reset QA`.

Objetivo: hacer que Hoy trabaje con ventanas de cumplimiento claras, sin tocar Supabase, dependencias, Vercel, lockfiles ni migraciones.

Cambios principales:

- Hoy ahora calcula una ventana de cumplimiento para actividades de calendario.
- Si una actividad tiene `endTime`, vence a esa hora.
- Si una actividad no tiene `endTime`, vence 30 minutos después de la hora de inicio.
- Las actividades vencidas en Hoy se muestran en gris con el texto `No se completó`.
- Las actividades vencidas ya no permiten check desde Hoy.
- El formulario rápido de Hoy ahora incluye `Inicio` y `Fin opcional`.
- Si `Fin opcional` queda vacío, la app usa la ventana default de 30 minutos.
- Retos vencidos por ventana de tiempo se marcan como `missed` para proteger bananas y analítica.
- Calendario mantiene `Fin opcional`, pero actualiza el default visual/lógico a 30 minutos.

No se modifica:

- `package.json`
- `package-lock.json`
- `next.config.mjs`
- `tsconfig.json`
- `vercel.json`
- dependencias
- migraciones Supabase
- RLS/policies
- variables de Vercel

Validación esperada:

```bash
npm install
npm run validate:assets
npm run typecheck
npm run build
```

Pruebas UX:

1. Crear una tarea en Hoy a la hora actual sin fin; debe mostrar una ventana de 30 minutos.
2. Crear una tarea en Hoy con fin opcional; debe respetar esa hora final.
3. Pasada la ventana, la tarea debe verse gris y decir `No se completó`.
4. Pasada la ventana, el check debe quedar bloqueado desde Hoy.
5. Una tarea vencida normal debe poder reprogramarse desde Calendario.
6. Un check de reto vencido debe contar como no cumplido y no regalar bananas.

## v2.28.1.13 — Expired Task Reactivation + Date/Time Guard UX

Base: `v2.28.1.12 — Today Time Windows + Expired Tasks UX`.

Objetivo: proteger Hoy contra tareas vencidas editables, guiar la reprogramación desde Calendario y evitar que se creen actividades con fechas u horas ya pasadas, sin tocar Supabase ni dependencias.

Cambios principales:

- Las actividades vencidas en Hoy siguen en gris y ya no abren edición directa desde Hoy.
- Al tocar una actividad vencida en Hoy aparece un modal pequeño con la guía `Editar en Calendario`.
- El modal de vencidas ofrece el CTA `Ir a Calendario` para reprogramar la tarea.
- Se agrega guardado local de reactivaciones de actividades vencidas.
- Penalización de cumplimiento por reactivación:
  - 1 reactivación: `-5%`
  - 2 reactivaciones: `-10%`
  - 3 o más reactivaciones: `-30%`
- El porcentaje de Hoy descuenta las penalizaciones de las actividades reactivadas visibles en el día.
- Calendario agrega campo `Fecha` al formulario de actividad para permitir reprogramar una vencida a fecha actual o futura.
- Hoy bloquea crear actividades con hora anterior a la actual del sistema.
- Calendario bloquea crear o reprogramar actividades en fechas anteriores a hoy.
- Calendario bloquea crear o reprogramar actividades para hoy con hora anterior a la actual.
- Se agregan modales pequeños de alerta:
  - `Esta fecha ya pasó. Intentá con la fecha actual o una posterior.`
  - `Ups, ya pasó el tiempo. Intentá usar la hora actual o una posterior.`

No se modifica:

- `package.json`
- `package-lock.json`
- `next.config.mjs`
- `tsconfig.json`
- `vercel.json`
- dependencias
- migraciones Supabase
- RLS/policies
- variables de Vercel

Archivos tocados:

- `app/today/page.tsx`
- `app/calendar/page.tsx`
- `hooks/use-calendar-reactivations.ts`
- `README.md`

Validación esperada:

```bash
npm install
npm run validate:assets
npm run typecheck
npm run build
```

Pruebas UX:

1. Crear una actividad en Hoy con hora anterior a la actual: debe abrir modal pequeño de hora pasada.
2. Crear una actividad en Calendario con fecha anterior a hoy: debe abrir modal pequeño de fecha pasada.
3. Crear una actividad en Calendario para hoy con hora anterior a la actual: debe abrir modal pequeño de hora pasada.
4. Dejar vencer una tarea en Hoy: debe verse gris y no permitir check.
5. Tocar una tarea vencida en Hoy: debe abrir modal `Editar en Calendario`.
6. Reprogramar una vencida desde Calendario: debe contar como reactivación y descontar el porcentaje correspondiente cuando aplique.

## v2.28.1.14 — Minute-Safe Time Guard + Edit Start Time Flex

Base: `v2.28.1.13 — Expired Task Reactivation + Date/Time Guard UX`.

Objetivo: corregir el guardado de horas para que el minuto actual no choque por segundos/retraso de interfaz y permitir conservar la hora inicial original al editar una tarea.

Cambios principales:

- La validación de hora se mantiene a nivel de minuto (`HH:mm`), no de segundos.
- En Hoy y Calendario, si el usuario conserva la hora inicial original al editar, no se bloquea aunque esa hora ya haya pasado.
- Al crear una tarea nueva, se siguen bloqueando horas realmente anteriores a la actual.
- El modal de hora pasada ahora guía mejor: `Podés usar la hora actual o elegir un minuto después.`
- Se mantiene intacta la lógica de tareas vencidas, reactivaciones y penalizaciones de v2.28.1.13.

No se modifica:

- Supabase
- migraciones
- `package.json`
- `package-lock.json`
- dependencias
- configuración de Vercel

Archivos tocados:

- `app/today/page.tsx`
- `app/calendar/page.tsx`
- `README.md`

Validación esperada:

```bash
npm install
npm run validate:assets
npm run typecheck
npm run build
```

Pruebas UX:

1. Si son las 07:34, crear una tarea a las 07:34 debe permitirse.
2. Si son las 07:34, crear una tarea a las 07:33 debe mostrar el modal de hora pasada.
3. Editar una tarea existente y conservar su hora inicial original debe permitirse.
4. Editar solo la hora final debe permitirse si el fin queda después del inicio.
5. Cambiar manualmente la hora inicial a una hora pasada distinta debe bloquearse.

## v2.28.1.15 — Reactivation Penalty Supabase Metrics Consistency

Esta versión persiste en Supabase las reactivaciones de actividades vencidas por tiempo para que el Hero de Hoy y Analytics no dependan de `localStorage`.

### Requisito antes de deploy

Ejecutar la migración:

```sql
supabase/migrations/0018_v228115_calendar_reactivation_penalties.sql
```

### Qué cambia

- `calendar_events` ahora puede guardar:
  - `reactivation_count`
  - `reactivation_penalty`
  - `expired_at`
  - `last_reactivated_at`
- Si una actividad se edita antes de vencer, no se penaliza.
- Si una actividad ya venció por su ventana de tiempo y se reprograma desde Calendario, aumenta la penalización.
- Hero de Hoy calcula el avance usando la penalización persistida.
- Analytics también descuenta penalizaciones en el resumen y ritmo por día.

### Qué no cambia

- No se tocaron dependencias.
- No se tocó Vercel config.
- No se cambiaron policies RLS.
- No se alteró la lógica de autenticación.

## v2.28.1.16 — Same-Day Penalty Scope Fix

- Adds `reactivation_penalty_date` to `calendar_events`.
- Reactivation penalties only affect the day where the task expired.
- Reprogramming an expired task to tomorrow no longer penalizes tomorrow's Hero progress.
- Same-day reactivation still applies the corresponding penalty for that day.
- No dependency or Vercel config changes.

## v2.28.1.17 — Sound System UX Controls + Audio Events

Esta versión integra la carpeta de audios MP3 de Monkey Checks como un sistema centralizado y controlable por el usuario.

### Qué incluye

- Nueva carpeta limpia: `public/assets/sounds/`.
- Se integran 9 audios MP3, sin `__MACOSX` ni `.DS_Store`.
- Nuevo proveedor global: `components/sound-system-provider.tsx`.
- Nuevo dispatcher central: `lib/sound/sound-events.ts`.
- Nuevas preferencias: `hooks/use-sound-settings.ts` y `lib/sound/sound-settings.ts`.
- Controles en Configuración:
  - Sonidos activos
  - Música de inicio
  - Música ambiente
  - Efectos de acciones
  - Alertas
  - Recompensas y logros
  - Notificaciones del sistema
  - Volumen general

### Mapeo de audios

- `alertas-trofeos-medallas.mp3`: logros, medallas y trofeos.
- `error-action.mp3`: errores y acciones inválidas.
- `intromusic_home_login_register.mp3`: `/`, `/login`, `/register`, `/welcome`.
- `modal-bananas-ganadas.mp3`: bananas ganadas o recompensas de retos.
- `modal-confirmacion.mp3`: confirmaciones y acciones exitosas.
- `musica-ambientacion.mp3`: navegación dentro de la app.
- `Alertas.mp3`: alertas del usuario.
- `tarea-hoy-complete.mp3`: tareas de Hoy completadas.
- `notificaciones.mp3`: notificaciones del sistema.

### Reglas UX

- El navegador solo permite audio después de la primera interacción del usuario; el sistema respeta esa regla.
- La música de inicio se apaga con fade al salir de inicio/login/register/welcome.
- La música ambiente se activa dentro de la app y se apaga al volver al inicio/cerrar sesión.
- El usuario puede apagar por separado música, efectos, alertas, recompensas y notificaciones.

### Qué no cambia

- No se toca Supabase.
- No se agregan migraciones.
- No se cambian dependencias.
- No se cambia configuración de Vercel.

## v2.28.1.18 — Task Reactivation Rules + Sound Controls Fix

- Corrige reglas de negocio entre tareas vencidas y tareas completadas por error.
- Una tarea vencida por tiempo sigue bloqueada en Hoy y solo puede reprogramarse desde Calendario.
- Una tarea completada por error puede reactivarse desde Calendario; al guardarla vuelve a quedar pendiente para Hoy o para la fecha elegida.
- Refuerza que la penalización solo aplique cuando la tarea venció por tiempo, no cuando estaba completada.
- Corrige sincronización de controles de sonido entre Configuración y el proveedor global de audio.
- Agrega silencio rápido global con acceso directo a Configuración > Sonidos.
- Agrega `alarma.mp3` para modales/recordatorios de alarma.
- Mantiene `modal-confirmacion.mp3` y agrega alias `confirmacion.mp3` para confirmaciones.
- No toca Supabase, migraciones, dependencias ni configuración de Vercel.

## v2.28.1.19 — Full Stability Cleanup + Sound Lifecycle QA

Esta versión estabiliza el ciclo de vida del audio antes de iniciar Parent.

### Qué incluye

- La música y efectos ahora respetan la pestaña activa del navegador.
- Si el usuario cambia de pestaña, minimiza o deja de enfocar Monkey Checks, la música se pausa.
- Al volver a Monkey Checks, la música se retoma solo si esa pestaña queda activa.
- Evita doble música cuando Monkey Checks está abierto en varias pestañas usando un dueño activo por `localStorage`.
- Los efectos de sonido solo se disparan si la pestaña está visible, enfocada y autorizada como pestaña activa.
- Los controles de sonido siguen funcionando en vivo sin recargar la app.
- Mantiene fade suave entre música de intro y música ambiente.

### Qué no cambia

- No se toca Supabase.
- No se agregan migraciones.
- No se cambian dependencias.
- No se toca configuración de Vercel.
- No se cambian reglas de negocio de tareas, penalizaciones o Parent.

### QA recomendado

```bash
npm install
npm run validate:assets
npm run typecheck
npm run build
```

Pruebas manuales clave:

- Entrar a `/`, `/login` o `/register`, hacer un click y confirmar música de inicio.
- Entrar a `/today` y confirmar que la música de inicio se apaga y entra ambiente.
- Cambiar a otra pestaña del navegador: la música debe pausarse.
- Volver a Monkey Checks: la música debe retomar si los controles están activos.
- Abrir Monkey en dos pestañas: solo la pestaña enfocada debe sonar.
- Probar silencio rápido y controles en Configuración > Sonidos sin recargar.

## v2.28.1.20 — Sound Alerts + Ambient Controls QA

- Desactiva la música de intro/login/register/welcome.
- La música ambiente solo suena dentro de pantallas autenticadas de la app.
- La música ambiente usa 60% del volumen general.
- Los controles de sonido reaccionan en vivo y pausan audio al apagar/silenciar.
- Las alertas internas de recordatorio usan el sonido de alerta.
- El botón de alarma en Hoy tiene actualización optimista para reflejar estado inmediato.
- El estado de sincronización de Hoy evita mostrar “Revisá la conexión” durante cargas normales.

Sin cambios en Supabase, dependencias ni configuración de Vercel.


## v2.28.1.21 — Favicon + Supabase Column Hotfix

- Agrega `public/favicon.ico` para eliminar el 404 del navegador.
- Declara `icons` en `app/layout.tsx`.
- Agrega migración idempotente `0023_v228121_favicon_supabase_column_hotfix.sql` para asegurar `calendar_events.reactivation_penalty_date`.
- No cambia lógica de negocio, dependencias, RLS ni configuración de Vercel.
