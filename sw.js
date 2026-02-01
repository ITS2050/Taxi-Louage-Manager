
const CACHE_NAME = 'taxi-manager-v1.0.6';
// Liste des fichiers à mettre en cache pour le mode hors-ligne
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/index.js', // Ces chemins seront générés par le build Vite
  './assets/index.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // On utilise une approche plus souple pour ne pas bloquer si un fichier manque
      return Promise.allSettled(ASSETS.map(url => cache.add(url)));
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        // Optionnel: retourner une page d'erreur personnalisée si hors-ligne total
      });
    })
  );
});
