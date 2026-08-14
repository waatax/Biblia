/* Biblia — PWA Service Worker (離線快取引擎)
 * 提供靜態資產快取與動態經文資料離線存取支援
 */
const CACHE_NAME = 'biblia-cache-v4';

const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './reader.js',
  './manifest.json',
  './icons/icon.svg',
  './data/books.js',
  './data/search_index.js',
  './data/morph_codes.js',
  './data/golden_verses.js',
  './data/plan_2026_q3.js',
  './data/plan_su101_2026.js',
  './data/su101_references.js',
  './data/book_intros.js',
  './data/timeline_data.js'
];

// 安裝階段：預先快取核心外殼資產
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// 啟用階段：清除舊版快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 攔截請求：Cache First with Network Fallback & Runtime Caching for data scripts
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // 僅處理同源請求或 Google Fonts
  const isSameOrigin = url.origin === self.location.origin;
  const isGoogleFont = url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com');

  if (!isSameOrigin && !isGoogleFont) return;

  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // 在背景發送請求更新快取 (Stale-While-Revalidate)
        fetch(req).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, responseClone);
            });
          }
        }).catch(() => { /* 離線狀態下忽略網路錯誤 */ });

        return cachedResponse;
      }

      return fetch(req).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          // 對於 Google Fonts 等 opaque responses 仍然快取
          if (isGoogleFont && networkResponse) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, responseClone);
            });
          }
          return networkResponse;
        }

        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, responseClone);
        });

        return networkResponse;
      }).catch(() => {
        // 若離線且快取無此資源，且請求為 HTML 頁面，回傳首頁快取
        if (req.headers.get('accept') && req.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// 監聽訊息：支援手動觸發跳過等待
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
