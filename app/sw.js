/* Biblia — PWA Service Worker (離線快取引擎)
 *
 * 兩個快取分開管理：
 *   SHELL_CACHE  介面外殼（HTML/CSS/JS、首頁小資料）。每次發佈改版號；
 *                採 stale-while-revalidate：先給快取秒開，背景再更新。
 *   DATA_CACHE   經文分層、Strong 索引與字典。內容固定不變，
 *                採 cache-first、永不背景重抓，且外殼改版時「不」清除，
 *                讀過的書卷與預存的和合本一直留著。經文資料真的重建時才改它的版號。
 */
const SHELL_CACHE = 'biblia-shell-v22';
const DATA_CACHE = 'biblia-data-v1';
const FONT_CACHE = 'biblia-fonts-v1';
const KEEP = [SHELL_CACHE, DATA_CACHE, FONT_CACHE];

// 只預存首屏必要的小檔；研經導讀等大型參考資料改為用到時才進快取
const SHELL_ASSETS = [
  './',
  './index.html',
  './style.css',
  './reader.js',
  './manifest.json',
  './icons/icon.svg',
  './data/books.js',
  './data/plan_2026_q3.js',
  './data/plan_su101_2026.js',
  './data/golden_verses.js',
  './data/morph_codes.js'
];

const DATA_PATH = /\/data\/(text|words)\/|\/data\/strong_(index|dict)_/;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      // cache: 'reload' 繞過瀏覽器 HTTP 快取，確保存進來的是這一版的檔案
      .then((cache) => cache.addAll(SHELL_ASSETS.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    // 舊版（biblia-cache-vNN）的頁面還在跑舊 reader.js，會去抓已移除的整卷檔；升級後重新整理一次即可
    const fromLegacy = names.some((n) => n.indexOf('biblia-cache-') === 0);
    await Promise.all(names.filter((n) => KEEP.indexOf(n) === -1).map((n) => caches.delete(n)));
    await self.clients.claim();
    if (fromLegacy) {
      const wins = await self.clients.matchAll({ type: 'window' });
      wins.forEach((c) => { if ('navigate' in c) c.navigate(c.url).catch(() => {}); });
    }
  })());
});

function putIfOk(cacheName, req, res) {
  if (res && (res.ok || res.type === 'opaque')) {
    const copy = res.clone();
    caches.open(cacheName).then((c) => c.put(req, copy)).catch(() => {});
  }
  return res;
}

async function cacheFirst(cacheName, req) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  return putIfOk(cacheName, req, await fetch(req));
}

async function staleWhileRevalidate(req, event) {
  const hit = await caches.match(req, { ignoreSearch: req.mode === 'navigate' });
  const network = fetch(req).then((res) => putIfOk(SHELL_CACHE, req, res));
  if (hit) {
    event.waitUntil(network.catch(() => {}));
    return hit;
  }
  try {
    return await network;
  } catch (err) {
    if (req.mode === 'navigate') {
      const shell = await caches.match('./index.html');
      if (shell) return shell;
    }
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    if (DATA_PATH.test(url.pathname)) {
      event.respondWith(cacheFirst(DATA_CACHE, req));
    } else {
      event.respondWith(staleWhileRevalidate(req, event));
    }
    return;
  }

  // Google 字型：字型檔網址帶雜湊、內容永不變，cache-first；樣式表則背景更新
  if (url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(FONT_CACHE, req));
  } else if (url.hostname === 'fonts.googleapis.com') {
    event.respondWith(caches.open(FONT_CACHE).then(async (cache) => {
      const hit = await cache.match(req);
      const network = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; });
      if (hit) { event.waitUntil(network.catch(() => {})); return hit; }
      return network;
    }));
  }
});

/* 頁面閒置時送來 { type: 'WARM', urls }：在背景把整本和合本存進 DATA_CACHE，
 * 一次兩個、已存在的跳過，不跟使用者正在讀的章節搶頻寬。 */
async function warm(urls) {
  const cache = await caches.open(DATA_CACHE);
  const queue = urls.map((u) => new URL(u, self.registration.scope).href);
  async function worker() {
    while (queue.length) {
      const u = queue.shift();
      try {
        if (await cache.match(u)) continue;
        const res = await fetch(u);
        if (res.ok) await cache.put(u, res);
      } catch (e) { /* 斷線就下次再補 */ }
    }
  }
  await Promise.all([worker(), worker()]);
}

self.addEventListener('message', (event) => {
  const msg = event.data || {};
  if (msg.type === 'SKIP_WAITING') self.skipWaiting();
  if (msg.type === 'WARM' && Array.isArray(msg.urls)) event.waitUntil(warm(msg.urls));
});
