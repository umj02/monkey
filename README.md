
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

## v2.27.1 — Category Preferences API Key Mapping Hotfix

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
