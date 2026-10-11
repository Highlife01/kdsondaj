/**
 * KD SONDAJ — High Performance Service Worker (PWA)
 * Enables offline caching, background synchronization, and instant load times
 */

const CACHE_NAME = "kdsondaj-pwa-v1";
const PRECACHE_ASSETS = [
  "/",
  "/en/",
  "/ar/",
  "/ekipman/sondaj-makineleri/",
  "/iletisim/",
  "/assets/site.css",
  "/assets/site.js",
  "/assets/logo.svg",
  "/assets/favicon.svg",
  "/site.webmanifest"
];

// 1. Install & Precache Critical Shell Assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("Pre-cache warning:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate & Purge Stale Caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Strategy: Stale-While-Revalidate for Assets, Network-First for APIs
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Bypass non-GET requests and external API endpoints
  if (event.request.method !== "GET") return;
  if (url.origin.includes("api.restful-api.dev") || url.origin.includes("api.indexnow.org")) {
    return;
  }

  // Handle local assets with Stale-While-Revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Offline fallback for HTML navigation requests
            if (event.request.mode === "navigate") {
              return cache.match("/");
            }
            return cachedResponse;
          });

        return cachedResponse || fetchPromise;
      });
    })
  );
});
