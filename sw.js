const CACHE = 'glossary-v3';
const BASE = '/Command/';
const ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'favicon.svg',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png',
  BASE + 'css/reset.css?v=2',
  BASE + 'css/tokens.css?v=2',
  BASE + 'css/theme.css?v=2',
  BASE + 'css/layout.css?v=2',
  BASE + 'css/components.css?v=2',
  BASE + 'js/storage.js?v=2',
  BASE + 'js/theme.js?v=2',
  BASE + 'js/render.js?v=2',
  BASE + 'js/search.js?v=2',
  BASE + 'js/backup.js?v=2',
  BASE + 'js/main.js?v=2',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request).catch(() => caches.match(BASE + 'index.html')))
  );
});
