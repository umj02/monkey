# Monkey Checks v2.5.1 — Auth Strict Fix

Base: v2.5 estable.

Cambios:
- Corrige export faltante `initialSettings` en `profile-service`.
- Login y register solo redirigen a `/today` cuando existe sesión real.
- Registro con confirmación de email muestra aviso y no entra a la app.
- Google/Apple usan Supabase OAuth y ya no hacen redirect mock.
- `AppShell` protege rutas internas y redirige a `/login` si no hay sesión.

Notas:
- Si Supabase Email Confirmation está activado, el usuario debe confirmar correo antes de entrar.
- Google/Apple requieren configurar proveedores OAuth en Supabase para funcionar.
