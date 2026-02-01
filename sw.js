const CACHE_NAME = 'taxi-manager-v1.1.2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // En mode développement ou aperçu, on privilégie toujours le réseau
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
