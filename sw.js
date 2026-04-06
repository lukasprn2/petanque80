// ============================================================
//  Service Worker – Club Pétanque Boves
//  Mise à jour silencieuse et automatique pour les utilisateurs
// ============================================================

// Change cette valeur à chaque déploiement pour déclencher la MAJ
const CACHE_VERSION = '2026-04-05-18';
const CACHE_NAME = 'petanque-boves-' + CACHE_VERSION;

const ASSETS = [
    '/petanque80/',
    '/petanque80/index.html',
    '/petanque80/logo.webp',
    '/petanque80/logo.png',
    '/petanque80/manifest.json',
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
    '/petanque80/jean-marie.webp',
    '/petanque80/arbitre.webp',
    '/petanque80/amiens.webp',
    '/petanque80/somme.webp',
    '/petanque80/estaminet.webp',
    '/petanque80/clarins.webp',
    '/petanque80/photo1.webp',
    '/petanque80/photo2.webp',
    '/petanque80/photo3.webp',
    '/petanque80/photo4.webp',
];

// ── INSTALLATION ──
self.addEventListener('install', function(event) {
    console.log('[SW] Installation – version', CACHE_VERSION);
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return Promise.allSettled(
                ASSETS.map(function(url) {
                    return cache.add(url).catch(function(err) {
                        console.warn('[SW] Impossible de cacher :', url, err);
                    });
                })
            );
        })
    );
});

// ── ACTIVATION : supprime les anciens caches et recharge toutes les pages ──
self.addEventListener('activate', function(event) {
    console.log('[SW] Activation – version', CACHE_VERSION);
    event.waitUntil(
        self.clients.claim()
            .then(function() {
                return caches.keys().then(function(cacheNames) {
                    return Promise.all(
                        cacheNames.map(function(name) {
                            if (name !== CACHE_NAME) {
                                console.log('[SW] Suppression ancien cache :', name);
                                return caches.delete(name);
                            }
                        })
                    );
                });
            })
            .then(function() {
                // Recharge automatiquement toutes les fenêtres ouvertes
                return self.clients.matchAll({ type: 'window' }).then(function(clients) {
                    clients.forEach(function(client) {
                        console.log('[SW] Rechargement automatique');
                        client.navigate(client.url);
                    });
                });
            })
    );
});

// ── FETCH : Network First pour HTML, Cache First pour les assets ──
self.addEventListener('fetch', function(event) {
    var url = event.request.url;

    if (event.request.method !== 'GET') return;
    if (!url.includes('/petanque80/') && !url.endsWith('/petanque80')) return;

    // index.html → toujours le réseau en priorité
    if (url.endsWith('/') || url.endsWith('/petanque80') || url.includes('index.html')) {
        event.respondWith(
            fetch(event.request)
                .then(function(networkResponse) {
                    var clone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, clone);
                    });
                    return networkResponse;
                })
                .catch(function() {
                    return caches.match(event.request);
                })
        );
        return;
    }

    // Autres assets → Cache First
    event.respondWith(
        caches.match(event.request).then(function(cachedResponse) {
            if (cachedResponse) return cachedResponse;
            return fetch(event.request).then(function(networkResponse) {
                var clone = networkResponse.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request, clone);
                });
                return networkResponse;
            });
        })
    );
});
