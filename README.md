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


## v2.17.1 — Planned Expenses Frequency UX Fix

- El selector de frecuencia de gastos planificados ahora muestra etiquetas en español: Mensual, Quincenal, Semanal, Anual y Una sola vez.
- La frecuencia sigue guardándose con valores técnicos estables (`monthly`, `biweekly`, `weekly`, `yearly`, `one_time`) para Supabase y métricas.
- Los gastos planificados se reactivan por periodo: un pago mensual pagado en mayo vuelve a aparecer pendiente en junio.
- Quincenal usa la fecha base y calcula la segunda quincena con +15 días, por ejemplo día 5 y día 20.
- Semanal usa el día de la semana de la fecha base.
- Anual usa la misma fecha cada año.
- Una sola vez no se reactiva después de pagarse.
- El formulario ahora explica cómo funciona la frecuencia seleccionada para evitar confusión.
- La vista de detalle muestra el vencimiento correspondiente al periodo actual, no solo la fecha base original.

### QA recomendado v2.17.1

1. Crear un gasto planificado mensual con fecha base día 5.
2. Marcarlo como pagado en el periodo actual y confirmar que aparece como pagado solo en ese periodo.
3. Cambiar filtros Mes / Quincena / Semana y validar que los vencimientos se recalculan.
4. Crear un gasto quincenal día 5 y verificar que en vista mensual se muestre como día 5 y día 20.
5. Confirmar que el selector de frecuencia nunca muestra valores internos como `monthly` o `biweekly`.
