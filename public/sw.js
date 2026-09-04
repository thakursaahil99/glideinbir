// Service worker for the "Sahu Bhai" PWA.
// Priorities: (1) installability, (2) /sahu opens offline, (3) NEVER serve a
// stale app after a deploy. So: the admin is left entirely to the network,
// navigations are network-first, and assets are stale-while-revalidate.

const CACHE = "sahu-bhai-v4";
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

  // API, auth and the whole admin: always straight to the network, never
  // cached — so a deploy is picked up immediately and data is never stale.
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) return;

  // Navigations: network-first; fall back to a cached page only when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((r) => r || caches.match("/sahu") || caches.match("/")),
      ),
    );
    return;
  }

  // Other assets: stale-while-revalidate — instant from cache, but always
  // refresh in the background so the next load is current.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((resp) => {
          if (resp.ok && resp.type === "basic") {
            const copy = resp.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return resp;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
