// Minimal service worker for the "Sahu Bhai" PWA.
// - Makes the app installable (a fetch handler is part of the install
//   criteria on Chromium).
// - Caches the app shell so /sahu opens even with a flaky connection.
// - Never caches API calls or auth — those always hit the network.

const CACHE = "sahu-bhai-v2";
// Only pre-cache assets that always return 200 for everyone. /sahu itself
// redirects to /login when signed out, which would fail cache.addAll — it's
// cached at runtime by the navigation handler instead.
const SHELL = ["/manifest.webmanifest", "/sahu-icon-192.png", "/sahu-icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Always go to the network for API + auth — never serve stale data.
  if (url.pathname.startsWith("/api/")) return;

  // Navigations: network first, fall back to the cached shell when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then((r) => r || caches.match("/sahu"))),
    );
    return;
  }

  // Static assets: cache first, then network (and cache the result).
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((resp) => {
          if (resp.ok && resp.type === "basic") {
            const copy = resp.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return resp;
        }),
    ),
  );
});
