# Monkey Checks v2.5.2 — Full Supabase Stable

Base limpia tomada de v2.5.

## Incluye
- Auth real con Supabase.
- Login/Register sin redirección mock.
- Google/Apple no entran directo hasta configurar providers reales.
- Protección de rutas internas con sesión obligatoria.
- `supabase-data-service.ts` tipado para evitar `implicit any` en Vercel.
- `initialSettings` corregido.
- Migración full para base vacía en `supabase/migrations/0001_v25_full_schema.sql`.

## Variables requeridas en Vercel
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Importante
Si tenés confirmación de email activada en Supabase, el registro muestra mensaje para confirmar correo y no entra a `/today` hasta que exista sesión real.


## v2.5.3 — Confirm Flow

Nueva ruta de confirmación de cuenta:

- `/auth/confirm`

El registro envía `emailRedirectTo` a `/auth/confirm`. En Supabase debe configurarse:

- Site URL: URL real de Vercel
- Redirect URL permitida: `https://tu-app.vercel.app/auth/confirm`

Después de confirmar, la pantalla muestra contador y redirige a `/login`.

## v2.5.6 — Register Confirmation UX
- Después de crear cuenta, el formulario queda bloqueado y la contraseña se limpia.
- Se agrega panel de “Correo enviado”.
- Se agrega botón “Reenviar correo” con contador de 60 segundos.
- El reenvío usa Supabase Auth `resend` con redirect a `/auth/confirm`.


## v2.5.7 — Smart Email Control

- Cooldown de reenvío ampliado a 120 segundos.
- Detección de rate limit de Supabase Auth.
- Bloqueo dinámico de 180 segundos cuando Supabase limita correos.
- Mensajes UX más claros para registro y reenvío.
- Mantiene confirm flow y Supabase Auth estable.
