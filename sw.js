// Unicorn Racers service worker: NETWORK FIRST, so an updated game always shows up straight away;
// the last good copy is only used when there is no connection (the Android app and the installed web app can then still start).
const CACHE = 'unicorn-racers-v1';
const PRECACHE = ['./', './manifest.webmanifest', './icon-192.png', './icon-512.png', './favicon.svg'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(PRECACHE.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE && k.startsWith('unicorn-racers-')).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || r.headers.has('range') || new URL(r.url).origin !== location.origin) return;
  if (new URL(r.url).pathname.endsWith('/sw.js')) return;
  e.respondWith(
    fetch(r).then((res) => {
      if (res && res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(r, copy)).catch(() => {}); }
      return res;
    }).catch(() => caches.match(r, { ignoreSearch: true }).then((hit) => hit || (r.mode === 'navigate' ? caches.match('./') : undefined) || Response.error()))
  );
});
