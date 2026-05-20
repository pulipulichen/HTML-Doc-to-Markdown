const CACHE_NAME = 'office-to-obsidian-v4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles/style.css',
  './scripts/globals.js',
  './scripts/processors.js',
  './scripts/ui-utils.js',
  './scripts/main.js',
  './manifest.json',
  './assets/favicon/favicon.png',
  './scripts/vendor/tailwindcss.cdn.js',
  './scripts/vendor/mammoth.browser.min.js',
  './scripts/vendor/turndown.js',
  './scripts/vendor/jszip.min.js',
  './scripts/vendor/FileSaver.min.js',
  './scripts/vendor/pdf.min.js',
  './scripts/vendor/pdf.worker.min.js'
];

// 安裝 Service Worker 並快取資產
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 激活 Service Worker 並清理舊快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 攔截網路請求並提供快取內容
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
