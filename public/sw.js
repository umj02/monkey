const CACHE_NAME = 'monkey-checks-v216';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = {
    title: 'Monkey Checks',
    body: 'Tenés una alerta pendiente.',
    url: '/reminders',
    reminderId: null,
  };

  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch (error) {
    payload = { ...payload, body: event.data?.text() || payload.body };
  }

  const options = {
    body: payload.body,
    icon: '/assets/monkey/faces/face-main.png',
    badge: '/assets/monkey/faces/face-main.png',
    tag: payload.reminderId || payload.body,
    renotify: true,
    data: {
      url: payload.url || '/reminders',
      reminderId: payload.reminderId,
    },
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'dismiss', title: 'Listo' },
    ],
  };

  event.waitUntil(self.registration.showNotification(payload.title || 'Monkey Checks', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = event.notification?.data?.url || '/reminders';
  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const existing = allClients.find((client) => client.url.includes(self.location.origin));
    if (existing) {
      await existing.focus();
      existing.navigate(url);
      return;
    }
    await self.clients.openWindow(url);
  })());
});
