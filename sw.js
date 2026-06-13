const CACHE_NAME = 'crypto-pwa-v2';
const ASSETS = [
  'index.html',
  'manifest.json'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Пропускаємо запити до сторонніх API (TradingView, CoinGecko), щоб не кешувати їх помилково
  if (!e.request.url.startsWith(self.location.origin)) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      // Safari Fix: додаємо параметр redirect: 'follow'
      return fetch(e.request, { redirect: 'follow' }).then((networkResponse) => {
        // Якщо Safari все ще скаржиться на редирект, ми просто повертаємо чистий запит
        if (networkResponse.redirected) {
          return Response.redirect(networkResponse.url, 302);
        }
        return networkResponse;
      }).catch(() => {
        // Якщо немає інтернету, намагаємось віддати хоча б щось
        return caches.match('index.html');
      });
    })
  );
});
