/*
 * Universal Flashcards PWA - Service Worker
 * Version: 3.5.1 - Voice Dropdown Persistence + Function Name Conflict Fix
 * Provides offline functionality, caching, and background sync
 */

const CACHE_VERSION = 'v3.5.1';
const CACHE_NAME = `flashcards-pwa-${CACHE_VERSION}`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
    './',
    './flashcard.html',
    './manifest.json',
    './offline.html',
    './favicon.svg',
    './favicon.ico',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png'
];

// Firebase URLs (cache but update frequently)
const FIREBASE_URLS = [
    'https://www.gstatic.com/firebasejs/',
    'https://apis.google.com/',
    'https://identitytoolkit.googleapis.com/',
    'https://firebaseinstallations.googleapis.com/'
];

/**
 * Install Event - Cache static assets
 */
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing version:', CACHE_VERSION);

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[ServiceWorker] Installation complete');
                // Force the waiting service worker to become the active service worker
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[ServiceWorker] Installation failed:', error);
            })
    );
});

/**
 * Activate Event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activating version:', CACHE_VERSION);

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[ServiceWorker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[ServiceWorker] Activation complete');
                // Take control of all pages immediately
                return self.clients.claim();
            })
    );
});

/**
 * Fetch Event - Serve from cache, fallback to network
 * Strategy: Cache-First for static assets, Network-First for dynamic content
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip chrome-extension and non-http(s) requests
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return;
    }

    // Handle Firebase requests with Network-First strategy
    if (isFirebaseRequest(url)) {
        event.respondWith(networkFirstStrategy(request));
        return;
    }

    // Handle API requests with Network-First strategy
    if (request.url.includes('/api/') || request.method !== 'GET') {
        event.respondWith(networkFirstStrategy(request));
        return;
    }

    // Handle static assets with Cache-First strategy
    event.respondWith(cacheFirstStrategy(request));
});

/**
 * Cache-First Strategy
 * Try cache first, fallback to network, then offline page
 */
async function cacheFirstStrategy(request) {
    try {
        // Try to get from cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('[ServiceWorker] Serving from cache:', request.url);
            return cachedResponse;
        }

        // Fetch from network
        console.log('[ServiceWorker] Fetching from network:', request.url);
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[ServiceWorker] Fetch failed, serving offline page:', error);

        // Serve offline page for navigation requests
        if (request.mode === 'navigate') {
            const offlinePage = await caches.match('./offline.html');
            if (offlinePage) {
                return offlinePage;
            }
        }

        throw error;
    }
}

/**
 * Network-First Strategy
 * Try network first, fallback to cache
 */
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[ServiceWorker] Network failed, trying cache:', request.url);

        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        throw error;
    }
}

/**
 * Check if request is for Firebase services
 */
function isFirebaseRequest(url) {
    return FIREBASE_URLS.some(firebaseUrl => url.href.includes(firebaseUrl));
}

/**
 * Message Event - Handle messages from clients
 */
self.addEventListener('message', (event) => {
    console.log('[ServiceWorker] Message received:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            type: 'VERSION',
            version: CACHE_VERSION
        });
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME).then(() => {
            event.ports[0].postMessage({
                type: 'CACHE_CLEARED',
                success: true
            });
        });
    }
});

/**
 * Background Sync - Sync data when connection is restored
 */
self.addEventListener('sync', (event) => {
    console.log('[ServiceWorker] Background sync:', event.tag);

    if (event.tag === 'sync-flashcards') {
        event.waitUntil(syncFlashcards());
    }
});

/**
 * Sync flashcards with Firebase when online
 */
async function syncFlashcards() {
    console.log('[ServiceWorker] Syncing flashcards...');
    // Note: Actual sync logic will be handled by the main app
    // This is just a placeholder for future background sync implementation
    try {
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_REQUESTED',
                timestamp: Date.now()
            });
        });
    } catch (error) {
        console.error('[ServiceWorker] Sync failed:', error);
        throw error;
    }
}

/**
 * Push Notification - Handle push notifications
 * (For future implementation)
 */
self.addEventListener('push', (event) => {
    console.log('[ServiceWorker] Push notification received');

    if (event.data) {
        const data = event.data.json();

        const options = {
            body: data.body || 'Time to practice your flashcards!',
            icon: './icons/icon-192x192.png',
            badge: './icons/icon-72x72.png',
            vibrate: [200, 100, 200],
            tag: 'flashcard-reminder',
            requireInteraction: false,
            actions: [
                {
                    action: 'open',
                    title: 'Open App'
                },
                {
                    action: 'close',
                    title: 'Dismiss'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(
                data.title || 'Flashcard Reminder',
                options
            )
        );
    }
});

/**
 * Notification Click - Handle notification interactions
 */
self.addEventListener('notificationclick', (event) => {
    console.log('[ServiceWorker] Notification clicked:', event.action);

    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('./flashcard.html')
        );
    }
});

console.log('[ServiceWorker] Service Worker loaded, version:', CACHE_VERSION);
