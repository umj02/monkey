# Monkey Checks v2.4.1 — App Architecture Cleanup

Base: v2.4 Supabase Prep.

## Qué cambia

- Mantiene el diseño y la UI estable de v2.4.
- Todas las pantallas principales pasan por hooks oficiales:
  - `useTasks`
  - `useCalendarEvents`
  - `useNotes`
  - `useReminders`
  - `useProfile`
  - `useSettings`
  - `useAuth`
- Centraliza storage keys en `lib/storage-keys.ts`.
- Agrega migración local desde keys antiguas v2.2/v2.3 hacia keys v2.4.
- Login/Register quedan como mock funcional con validaciones y sesión local.
- Profile tiene logout mock y muestra estado de sesión local.
- Servicios quedan listos para reemplazar localStorage por Supabase en v2.5.

## Validación

Ejecutar:

```bash
npm install
npm run build
```

## Siguiente paso recomendado

v2.5 — Supabase Auth + DB real.

## v2.4.2 — Wallet + Calendar Month

Base: v2.4.1 Architecture Cleanup.

Cambios principales:
- Nueva vista `/wallet` para finanzas personales: balance, ingresos, gastos, ahorros, presupuesto, categorías, consejo inteligente y meta de ahorro.
- Nuevo hook `useWallet`, servicio `wallet-service`, seed local y storage key preparada para migración posterior a Supabase.
- Bottom navigation actualizado con Wallet.
- Calendario actualizado con switch real entre vista Semana y Mes.

Nota: Wallet funciona con localStorage en esta versión. La persistencia en Supabase queda para v2.5.

## v2.4.3 — Calendar Navigation Fix

Base: v2.4.2 / v2.4.1 architecture.

Cambios incluidos:
- Botón de mes funcional con selector mensual.
- Navegación de mes anterior / siguiente.
- Selección real de días en la tira semanal.
- Vista mensual con días seleccionables y marcadores de eventos.
- Botón de ajustes superior funcional con opciones rápidas.
- Eventos asociados a fecha para preparar Supabase.
