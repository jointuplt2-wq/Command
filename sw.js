const CACHE = 'glossary-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './icon-192.png',
  './icon-512.png',
  './css/reset.css?v=2',
  './css/tokens.css?v=2',
  './css/theme.css?v=2',
  './css/layout.css?v=2',
  './css/components.css?v=2',
  './js/storage.js?v=2',
  './js/theme.js?v=2',
  './js/render.js?v=2',
  './js/search.js?v=2',
  './js/backup.js?v=2',
  './js/main.js?v=2',
];

// 설치: 모든 파일 캐시
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// 활성화: 구버전 캐시 삭제
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 요청: 캐시 우선, 없으면 네트워크
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
