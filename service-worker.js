const CACHE_NAME = 'orcamento-cache-v14';

const ASSETS = [
  './index.html',
  './caixa.html',
  './impressora.html',
  './orcamento-pc-v2.js',
  './caixa.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-1024.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        return caches.match('./index.html');
      });
    })
  );
});
