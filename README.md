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
