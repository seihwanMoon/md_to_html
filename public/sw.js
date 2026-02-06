const CACHE_NAME = "md-to-html-v1";

self.addEventListener("install", (event) => {
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
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.endsWith(".js") || url.pathname.endsWith(".css") || url.pathname === "/" || url.pathname === "/index.html") {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cached) =>
          cached || fetch(event.request).then((res) => {
            if (res.ok) cache.put(event.request, res.clone());
            return res;
          })
        )
      )
    );
  }
});
