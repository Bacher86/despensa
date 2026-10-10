// Service worker: permite instalar la app y abrirla rápido (y sin señal).
// Si cambiás index.html, subí también este archivo con VERSION nueva para que los teléfonos se actualicen.
const VERSION = "despensa-v4";
const APP = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

// Librerías externas que conviene guardar en el teléfono (Firebase, fuentes, escáner)
const EXTERNOS = ["www.gstatic.com", "fonts.googleapis.com", "fonts.gstatic.com", "unpkg.com"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(APP)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // La página: primero la red (para tener siempre la última versión), si no hay señal la guardada
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(r => { const copia = r.clone(); caches.open(VERSION).then(c => c.put("./index.html", copia)); return r; })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Íconos y archivos propios, y librerías externas: lo guardado al instante, y se actualiza por detrás
  const propio = url.origin === self.location.origin;
  if (propio || EXTERNOS.includes(url.hostname)) {
    e.respondWith(
      caches.open(VERSION).then(async c => {
        const guardado = await c.match(req);
        const red = fetch(req).then(r => { if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; }).catch(() => guardado || Response.error());
        return guardado || red;
      })
    );
  }
  // Todo lo demás (Firebase, login de Google) pasa directo, sin tocar.
});
