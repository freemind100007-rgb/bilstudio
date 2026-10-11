// Cachar appen och AI-modellen så den startar snabbt och kan återanvändas.
const CACHE = 'bilstudio-v1';
const CORE = ['./', 'index.html', 'logo.png', 'icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);
  const cacheable = url.origin === location.origin ||
    /(^|\.)staticimgly\.com$/.test(url.hostname) || url.hostname === 'cdn.jsdelivr.net' || url.hostname === 'esm.sh';
  if (!cacheable) return;
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {}); }
        return res;
      });
    })
  );
});
