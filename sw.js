const CACHE_NAME = 'petanque-boves-v3';

const ASSETS = [
  '/petanque80/',
  '/petanque80/index.html',
  '/petanque80/manifest.json',
  '/petanque80/logo.webp',
  '/petanque80/logo.png',
  '/petanque80/sonintro.mp3',
  '/petanque80/adresse.jpg',
  '/petanque80/president.webp',
  '/petanque80/vice-president.webp',
  '/petanque80/secretaire.webp',
  '/petanque80/tresorier.webp',
  '/petanque80/vincent.webp',
  '/petanque80/denis.webp',
  '/petanque80/virginie.webp',
  '/petanque80/philippe-d.webp',
  '/petanque80/eric.webp',
  '/petanque80/philippe-m.webp',
  '/petanque80/benoit.webp',
  '/petanque80/jean-marie.webp'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

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

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request).catch(function() {
        if (event.request.mode === 'navigate') {
          return caches.match('/petanque80/index.html');
        }
      });
    })
  );
});
