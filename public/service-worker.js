/* eslint-disable no-restricted-globals */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

const showNotification = (rawPayload = {}) => {
  const payload = typeof rawPayload === 'string' ? { body: rawPayload } : rawPayload;
  const title = payload.title || 'Flashcards reminder';
  const body = payload.body || 'Time to review your flashcards.';
  const tag = payload.tag || `flashcards-${Date.now()}`;
  const data = payload.data || {};

  return self.registration.showNotification(title, {
    body,
    tag,
    data,
    badge: payload.badge || '/icons/icon-192.svg',
    icon: payload.icon || '/icons/icon-192.svg',
    vibrate: [100, 50, 100],
    actions: payload.actions || [],
    requireInteraction: payload.requireInteraction || false,
  });
};

self.addEventListener('push', (event) => {
  const payload = (() => {
    try {
      return event.data ? event.data.json() : {};
    } catch (error) {
      return { body: event.data ? event.data.text() : undefined };
    }
  })();

  event.waitUntil(showNotification(payload));
});

self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};
  if (type === 'notify') {
    event.waitUntil(showNotification(payload));
  }
});

self.addEventListener('notificationclick', (event) => {
  const targetUrl = event.notification?.data?.url || '/';
  event.notification.close();

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            if (client.url.includes(targetUrl)) {
              return client.focus();
            }
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
        return undefined;
      }),
  );
});

