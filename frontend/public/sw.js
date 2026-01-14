// Service Worker for HealthWise.AI
// PWA with offline support and push notifications

const CACHE_NAME = 'healthwise-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon.svg',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// Install - cache static assets
self.addEventListener('install', (event) => {
    console.log('HealthWise SW: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('HealthWise SW: Caching static assets');
                return cache.addAll(STATIC_ASSETS).catch(err => {
                    console.log('Some assets failed to cache:', err);
                });
            })
    );
    self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
    console.log('HealthWise SW: Activated');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        console.log('HealthWise SW: Deleting old cache:', name);
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests and external URLs
    if (event.request.method !== 'GET') return;
    if (!event.request.url.startsWith(self.location.origin)) return;

    // Skip API calls - always fetch from network
    if (event.request.url.includes('/api/') ||
        event.request.url.includes('supabase') ||
        event.request.url.includes('googleapis') ||
        event.request.url.includes('openrouter') ||
        event.request.url.includes('groq')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone and cache successful responses
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Network failed, try cache
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Return offline page for navigation requests
                    if (event.request.mode === 'navigate') {
                        return caches.match('/');
                    }
                    return new Response('Offline', { status: 503 });
                });
            })
    );
});

// Push notifications
self.addEventListener('push', (event) => {
    console.log('HealthWise SW: Push received');

    let data = {
        title: 'HealthWise.AI',
        body: 'Time for your health check!',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        url: '/'
    };

    if (event.data) {
        try {
            data = { ...data, ...event.data.json() };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        vibrate: [200, 100, 200],
        data: { url: data.url },
        actions: [
            { action: 'open', title: '📱 Open App' },
            { action: 'dismiss', title: '✕ Dismiss' }
        ],
        requireInteraction: false,
        tag: 'healthwise-notification'
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('HealthWise SW: Notification clicked');
    event.notification.close();

    if (event.action === 'dismiss') return;

    const url = event.notification.data?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (self.clients.openWindow) {
                    return self.clients.openWindow(url);
                }
            })
    );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
    console.log('HealthWise SW: Background sync', event.tag);

    if (event.tag === 'sync-health-data') {
        event.waitUntil(syncHealthData());
    }
});

async function syncHealthData() {
    // This will sync offline data when connection is restored
    console.log('HealthWise SW: Syncing offline data...');
    // Future: Implement data sync from IndexedDB to Supabase
}
