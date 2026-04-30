# Monkey Checks v2.2 — Functional Local App

Base: v2.1.2.

## Cambios principales

- App conectada entre secciones con navegación funcional.
- Dashboard Hoy funcional con `localStorage`:
  - crear tareas desde el botón `+`
  - marcar/desmarcar checks
  - abrir detalle de tarea
  - editar tarea
  - eliminar tarea
  - progreso persistente
- Calendario funcional local:
  - agregar evento
  - editar evento
  - eliminar evento
  - persistencia local
- Notas funcional local:
  - agregar nota
  - editar nota
  - eliminar nota
  - buscar notas
  - persistencia local
- Recordatorios funcional local:
  - agregar recordatorio
  - editar recordatorio
  - eliminar recordatorio
  - activar/desactivar toggle
  - persistencia local
- Perfil editable localmente.
- Configuración con toggles persistentes.
- Login/Register mock funcional antes de Supabase Auth.

## Deploy

```bash
npm install
npm run build
```

Variables existentes se mantienen igual para la siguiente etapa con Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Siguiente fase recomendada

v2.3 UX Pro + validaciones visuales antes de conectar Supabase.
