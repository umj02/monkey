self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = { title: 'Monkey Checks', body: 'Tenés una alerta pendiente.' };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch (error) {}
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/assets/monkey/faces/face-main.png',
      badge: '/assets/monkey/faces/face-main.png',
      data: payload.url || '/today'
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data || '/today';
  event.waitUntil(self.clients.openWindow(url));
});
