# Monkey Checks v2.17 — Budget Planned Expenses + Expense Detail UX

Base: v2.16.4 — Hobby Cron Safe Push Fix.

## Cambios principales

- Wallet/Budget separa gastos en dos secciones: **Variables** y **Planificados**.
- Los gastos variables usan categorías cerradas para evitar inventar categorías y mantener métricas limpias.
- Los gastos planificados usan un selector de **Categoría** con opciones comunes: préstamos, casa, colegiatura, hipoteca, vehículo, salud, pases, peajes, remodelación, celular, internet, suscripciones, tarjetas, supermercado, ropa/zapatos, pólizas, marchamo y otros.
- Los íconos de gastos planificados quedan previstos con los assets actuales; se pueden reemplazar por una galería específica más adelante.
- Los gastos planificados tienen estado: pendiente, pagado o vencido.
- Se puede marcar un gasto planificado como pagado. Al pagarlo, se crea un movimiento de gasto planificado en el historial.
- Los gastos planificados se filtran por el mismo periodo de Wallet: mes, quincena o semana.
- El historial ahora permite abrir el detalle de un movimiento con tap/click.
- Desde el detalle se puede editar o eliminar un movimiento.
- Los gastos planificados también tienen detalle, edición y eliminación.
- El Consejo inteligente contempla gastos planificados pendientes/vencidos.

## Migración nueva

```txt
supabase/migrations/0013_v217_budget_planned_expenses.sql
```

Esta migración agrega campos a `wallet_transactions` y crea `wallet_planned_expenses`.

## QA recomendado

```bash
npm install
npm run validate:assets
npm run typecheck
npm run build
```

Probar:

- Crear un gasto variable con categoría cerrada.
- Abrir el detalle del movimiento, editarlo y eliminarlo.
- Crear un gasto planificado con categoría cerrada.
- Verlo en la pestaña Planificados.
- Marcarlo como pagado.
- Confirmar que aparece un movimiento en el historial como gasto planificado.
- Cambiar entre Mes, Quincena y Semana para confirmar filtrado.
- Refrescar y validar persistencia en Supabase.
