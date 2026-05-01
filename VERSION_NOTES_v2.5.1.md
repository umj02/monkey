# Monkey Checks v2.5.1 — Auth Strict Fix

Base: v2.5 estable.

Cambios incluidos:
- Login y registro requieren respuesta real de Supabase antes de entrar a `/today`.
- Google y Apple ya no hacen redirect mock; si OAuth no está configurado muestran error.
- Rutas internas protegidas con `AppShell`.
- `use-settings.ts` ya no depende de `initialSettings` exportado desde `profile-service`, evitando el error de Turbopack/Vercel.
- Validación estática de imports/exports OK en 54 archivos TS/TSX.

Nota:
- En este entorno `npm install` no completó por timeout antes de crear `node_modules`, así que no se pudo ejecutar `next build` localmente aquí.
- El error exacto reportado por Vercel (`initialSettings doesn't exist`) fue eliminado de raíz quitando ese import.
