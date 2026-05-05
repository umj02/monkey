# Background Push en Vercel Hobby

Esta versión mantiene el endpoint de push en segundo plano, pero **no registra un cron frecuente en `vercel.json`** para evitar el error de deploy en cuentas Hobby de Vercel.

Vercel Hobby solo permite cron jobs que corran una vez al día. Los recordatorios necesitan una frecuencia más alta, normalmente cada 1–5 minutos.

## Qué queda activo

- `/api/cron/reminders` sigue disponible.
- Las notificaciones push siguen funcionando si un scheduler externo llama ese endpoint.
- Las alertas dentro de la app siguen funcionando cuando el usuario tiene la app abierta.
- El Service Worker y las suscripciones push se mantienen.

## Opción recomendada en Hobby

Usar un scheduler externo, por ejemplo `cron-job.org`, para llamar el endpoint cada 5 minutos:

```txt
https://TU_DOMINIO.vercel.app/api/cron/reminders
```

Header requerido:

```txt
Authorization: Bearer TU_CRON_SECRET
```

También se acepta:

```txt
x-cron-secret: TU_CRON_SECRET
```

## Variables necesarias

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:tu-correo@gmail.com
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
```

## Si usás Vercel Pro

Podés volver a agregar un cron frecuente en `vercel.json`, por ejemplo:

```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Para Hobby, no agregues ese bloque porque Vercel bloqueará el deploy.
