const CACHE_NAME = 'flexed-v1';
const FALLBACK_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.add(FALLBACK_URL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignore non-GET requests (e.g. POST to /api/generate-review)
  if (event.request.method !== 'GET') return;

  // Never cache API or auth routes
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) return;

  // Cache static assets
  if (url.pathname.startsWith('/_next/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(event.request).then((res) => res || fetch(event.request).then((networkRes) => {
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkRes.clone()));
        return networkRes;
      })).catch(() => caches.match(FALLBACK_URL))
    );
    return;
  }

  // Network-first for pages, fallback to offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(FALLBACK_URL))
    );
  }
});
