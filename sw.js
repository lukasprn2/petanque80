// ===================== SERVICE WORKER — Pétanque Boves =====================
// Change cette valeur à chaque déploiement pour forcer la mise à jour du cache
const CACHE_VERSION = '2026-05-05-11';
const CACHE_NAME = 'petanque-boves-' + CACHE_VERSION;

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

const CACHE_URLS = [
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

// ─── Initialisation Firebase dans le SW ──────────────────────────────────────
firebase.initializeApp({
    apiKey: "AIzaSyC27gFQjA3WbpHcgzerSjQvOX0h6VO3EgY",
    authDomain: "petanqueboves-54950.firebaseapp.com",
    projectId: "petanqueboves-54950",
    storageBucket: "petanqueboves-54950.firebasestorage.app",
    messagingSenderId: "920624937926",
    appId: "1:920624937926:web:fac2aa801abd3a5ee450c7"
});

const messaging = firebase.messaging();

// ─── Réception des notifs en arrière-plan (app fermée / onglet inactif) ──────
messaging.onBackgroundMessage(function(payload) {
    var notifTitle = (payload.notification && payload.notification.title) || '🎯 Pétanque Boves';
    var notifOptions = {
        body:    (payload.notification && payload.notification.body) || 'Nouvelle mise à jour du club !',
        icon:    '/petanque80/logo.png',
        badge:   '/petanque80/logo.png',
        tag:     (payload.data && payload.data.tag) || 'petanque-update',
        data:    payload.data || {},
        actions: [
            { action: 'open',    title: '👀 Voir' },
            { action: 'dismiss', title: 'Ignorer' }
        ],
        requireInteraction: false,
        vibrate: [200, 100, 200]
    };
    return self.registration.showNotification(notifTitle, notifOptions);
});

// ─── Clic sur la notification ─────────────────────────────────────────────────
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    if (event.action === 'dismiss') return;
    var urlCible = (event.notification.data && event.notification.data.url) || '/petanque80/';
    var urlAncre = (event.notification.data && event.notification.data.ancre)
        ? urlCible + '#' + event.notification.data.ancre
        : urlCible;
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url.includes('/petanque80/') && 'focus' in client) {
                    client.focus();
                    client.postMessage({ type: 'NAVIGATE', url: urlAncre });
                    return;
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlAncre);
            }
        })
    );
});

// ─── Installation : mise en cache des assets ──────────────────────────────────
self.addEventListener('install', function(event) {
    console.log('[SW] Installation — version', CACHE_VERSION);
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return Promise.allSettled(
                CACHE_URLS.map(function(url) {
                    return cache.add(url).catch(function(err) {
                        console.warn('[SW] Impossible de cacher :', url, err.message);
                    });
                })
            );
        })
    );
});

// ─── Activation : supprime les anciens caches et prend le contrôle ───────────
self.addEventListener('activate', function(event) {
    console.log('[SW] Activation — version', CACHE_VERSION);
    event.waitUntil(
        self.clients.claim().then(function() {
            return caches.keys().then(function(keys) {
                return Promise.all(
                    keys.filter(function(k) { return k !== CACHE_NAME; })
                        .map(function(k) {
                            console.log('[SW] Suppression ancien cache :', k);
                            return caches.delete(k);
                        })
                );
            });
        }).then(function() {
            return self.clients.matchAll({ type: 'window' }).then(function(clients) {
                clients.forEach(function(client) {
                    console.log('[SW] Rechargement automatique');
                    client.navigate(client.url);
                });
            });
        })
    );
});

// ─── Fetch : Network First pour HTML, Cache First pour les assets ─────────────
self.addEventListener('fetch', function(event) {
    var url = event.request.url;
    if (event.request.method !== 'GET') return;
    if (!url.includes('/petanque80/') && !url.endsWith('/petanque80')) return;

    if (url.endsWith('/') || url.endsWith('/petanque80') || url.includes('index.html') || url.includes('admin.html')) {
        event.respondWith(
            fetch(event.request).then(function(networkResponse) {
                var clone = networkResponse.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request, clone);
                });
                return networkResponse;
            }).catch(function() {
                return caches.match(event.request);
            })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(function(cached) {
            if (cached) return cached;
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
