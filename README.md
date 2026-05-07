
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

### Decisión técnica

No se agregó tabla nueva en Supabase. En esta primera etapa los logros se calculan desde datos existentes para validar UX y reglas. Si la experiencia se aprueba, una versión posterior puede persistir desbloqueos y fechas exactas en Supabase.

### QA recomendado

```bash
npm install
npm run validate:assets
npm run typecheck
npm run build
```

Validar manualmente:

- `/achievements` carga sin sesión solamente después de login/onboarding.
- Medallas ganadas y bloqueadas se muestran correctamente.
- Filtros no rompen layout mobile.
- `/analytics` muestra conteo real de logros.
- Perfil y Settings enlazan correctamente a Logros.
