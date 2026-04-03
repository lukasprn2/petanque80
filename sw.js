const CACHE_NAME = 'petanque-boves-v1';

// Fichiers à mettre en cache pour fonctionner hors ligne
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.webp',
  '/logo.png',
  '/sonintro.mp3',
  '/adresse.jpg',
  '/president.webp',
  '/vice-president.webp',
  '/secretaire.webp',
  '/tresorier.webp',
  '/vincent.webp',
  '/denis.webp',
  '/virginie.webp',
  '/philippe-d.webp',
  '/eric.webp',
  '/philippe-m.webp',
  '/benoit.webp',
  '/jean-marie.webp'
];

// Installation : mise en cache des fichiers
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Fetch : répondre depuis le cache si disponible, sinon réseau
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request).catch(function() {
        // Si hors ligne et pas en cache, retourner la page principale
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
