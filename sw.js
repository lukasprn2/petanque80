// ===================== SERVICE WORKER — Pétanque Boves =====================
// Gère : cache offline + notifications push Firebase Cloud Messaging

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

const CACHE_NAME = 'petanque-boves-v3';
const CACHE_URLS = [
    '/petanque80/',
    '/petanque80/index.html',
    '/petanque80/logo.webp',
    '/petanque80/manifest.json'
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
    console.log('[SW] Notif reçue en arrière-plan:', payload);

    const notifTitle = payload.notification?.title || '🎯 Pétanque Boves';
    const notifOptions = {
        body:    payload.notification?.body  || 'Nouvelle mise à jour du club !',
        icon:    '/petanque80/logo.png',
        badge:   '/petanque80/logo.png',
        tag:     payload.data?.tag || 'petanque-update',
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

    const urlCible = event.notification.data?.url || '/petanque80/';
    const urlAncre = event.notification.data?.ancre ? urlCible + '#' + event.notification.data.ancre : urlCible;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (const client of clientList) {
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

// ─── Cache offline ────────────────────────────────────────────────────────────
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(CACHE_URLS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        caches.match(event.request).then(function(cached) {
            return cached || fetch(event.request);
        })
    );
});
