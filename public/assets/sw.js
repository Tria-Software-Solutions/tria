// Service Worker for Tria
const CACHE_NAME = 'tria-v1';
const urlsToCache = [
  '/',
  '/assets/css/style.css',
  '/assets/css/responsive.css',
  '/assets/js/script.js',
  '/assets/js/main.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
