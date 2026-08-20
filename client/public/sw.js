const CACHE_NAME = 'lumae-ai-v2';
const CORE_ASSETS = ['/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Navigation and application HTML must always come from the network so a
  // deployed UI never remains stuck behind a stale service-worker cache.
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/')));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response.ok && response.type !== 'error') {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
