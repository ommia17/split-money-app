// Split Money service worker: keeps the app usable with no internet.
// Online: always loads the latest files from the website (so updates show up right away).
// Offline (or very slow network): uses the copy saved on the phone.
// Bump VERSION whenever you change any app file.
const VERSION = 'splitmoney-v2';
const SHELL = ['./', './index.html', './config.js', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './icon-maskable.png', './apple-touch-icon.png'];
const FONT_CACHE = 'splitmoney-fonts';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION)
    .then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== FONT_CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Fonts: cache first, so text looks the same offline.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONT_CACHE).then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      try { const res = await fetch(req); c.put(req, res.clone()); return res; }
      catch { return new Response('', { status: 504 }); }
    }));
    return;
  }

  // Google sign-in and Drive calls always go straight to the network.
  if (url.origin !== self.location.origin) return;

  // App files: network first (fresh copy, also saved for offline), saved copy if offline or slow.
  const key = req.mode === 'navigate' ? './index.html' : url.pathname;
  e.respondWith(caches.open(VERSION).then(async c => {
    const net = fetch(req, { cache: 'no-cache' }).then(res => { if (res.ok) c.put(key, res.clone()); return res; });
    const slow = new Promise(r => setTimeout(r, 4000, null));
    try {
      const res = await Promise.race([net, slow]);
      if (res) return res;
    } catch {}
    const hit = await c.match(key, { ignoreSearch: true });
    if (hit) return hit;
    try { return await net; } catch { return new Response('Offline', { status: 503 }); }
  }));
});
