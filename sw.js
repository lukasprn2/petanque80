const CACHE_NAME = 'petanque-boves-v7';

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

// Installation
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // Active immédiatement la nouvelle version
});

// Activation : supprime les anciens caches automatiquement
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) {
              console.log('Ancien cache supprimé :', key);
              return caches.delete(key);
            })
      );
    })
  );
  self.clients.claim(); // Prend le contrôle immédiatement
});

// Fetch : réseau en priorité, cache en fallback
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request)
      .then(function(networkResponse) {
        // Met à jour le cache avec la version réseau
        var responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(function() {
        // Hors ligne : on sert depuis le cache
        return caches.match(event.request).then(function(cached) {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('/petanque80/index.html');
          }
        });
      })
  );
});
