/* Math Blaster service worker — enables offline play when the app is served over http(s).
   (Service workers do not run from file:// pages, so this only activates when hosted.) */
const CACHE = 'mathblaster-v7';
const PAGE = './math_blaster_scoreboard.html';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(['./', PAGE, './manifest.webmanifest'])).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first with runtime caching: once the font and Pokémon sprites load online,
// they're cached and the app works fully offline afterwards.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit =>
      hit || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(PAGE))
    )
  );
});
