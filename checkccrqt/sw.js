/* CheckCCRQT v0.4.0+ Pro / v0.5.0 — Offline-First PWA Service Worker */
const CACHE_NAME = "checkccrqt-v050-report4d-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./bao-cao-sang-kien-4d.html",
  "./css/style.css",
  "./js/eudr-validator.js",
  "./js/knowledge-base.js",
  "./js/map-composer.js",
  "./js/app.js",
  "./data/sample-cam-lo.geojson",
  "./manifest.webmanifest",
  "./assets/logo_kiemlam.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (
          res &&
          res.status === 200 &&
          (url.origin === self.location.origin ||
            url.hostname.includes("unpkg.com") ||
            url.hostname.includes("jsdelivr.net") ||
            url.hostname.includes("cdnjs.cloudflare.com"))
        ) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match("./index.html")))
  );
});
