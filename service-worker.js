const CACHE_NAME = 'orcamento-cache-v1';
const ASSETS = [
  './index.html',
  './login.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-1024.png',
  './firebase.js',
  './orcamento.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request).catch(()=>caches.match('./index.html')))
  );
});