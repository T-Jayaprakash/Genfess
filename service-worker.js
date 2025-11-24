
/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'lastbench-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.svg'
];

// Install SW
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate SW
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Listen for Push Notifications (Instagram-style alerts)
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || 'Lastbench';
  const body = data.body || 'New gossip waiting for you!';
  
  const options = {
    body: body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    tag: 'post-alert', // Collapse multiple notifications into one
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle Notification Click (Deep Linking)
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Close the notification

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 1. Check if there is already a window/tab open
      for (const client of clientList) {
        // If tab is open, focus it and maybe refresh
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      // 2. If not, open a new window/tab to the app root
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
