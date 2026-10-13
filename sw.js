// Service worker: permite instalar la app y abrirla rápido (y sin señal).
// Si cambiás index.html, subí también este archivo con VERSION nueva para que los teléfonos se actualicen.
const VERSION = "despensa-v14";
const APP = ["./", "./index.html", "./recetas.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

// Librerías externas que conviene guardar en el teléfono (Firebase, fuentes, escáner)
const EXTERNOS = ["www.gstatic.com", "fonts.googleapis.com", "fonts.gstatic.com", "unpkg.com", "cdn.jsdelivr.net"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(APP)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== "despensa-datos").map(k => caches.delete(k))))
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

// Tocar un aviso abre la app en la pestaña que corresponde
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const tab = e.notification.data?.tab || "despensa";
  const url = new URL("./?tab=" + tab, self.registration.scope).href;
  e.waitUntil((async () => {
    const abiertas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of abiertas) { if ("focus" in c) { await c.navigate?.(url).catch(() => {}); return c.focus(); } }
    return self.clients.openWindow(url);
  })());
});

// Resumen semanal con la app cerrada (Chrome en Android, con la app instalada)
function ultimoMomento(cfg, ahora = new Date()) {
  const d = new Date(ahora); d.setHours(cfg.hora, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() - cfg.dia + 7) % 7));
  if (d > ahora) d.setDate(d.getDate() - 7);
  return d.getTime();
}
self.addEventListener("periodicsync", e => {
  if (e.tag !== "resumen") return;
  e.waitUntil((async () => {
    const c = await caches.open("despensa-datos");
    const r = await c.match("./__resumen");
    if (!r) return;
    const d = await r.json();
    if (!d.on || !d.cfg || d.cfg.dia < 0) return;
    const debido = ultimoMomento(d.cfg);
    if ((d.ult || 0) >= debido) return;
    await self.registration.showNotification(d.titulo, { body: d.cuerpo, tag: "resumen", icon: "icon-192.png", badge: "icon-192.png", data: { tab: "lista" } });
    d.ult = Date.now();
    await c.put("./__resumen", new Response(JSON.stringify(d), { headers: { "Content-Type": "application/json" } }));
  })());
});
