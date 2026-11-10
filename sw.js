// Service worker: permite instalar la app y abrirla rápido (y sin señal).
// Si cambiás index.html, subí también este archivo con VERSION nueva para que los teléfonos se actualicen.
const VERSION = "despensa-v56";
const APP = ["./", "./index.html", "./recetas.js", "./ticket.js", "./consumo.js", "./nativo.js", "./i18n.js", "./traductor.js", "./i18n/es.json", "./i18n/en.json", "./i18n/pt.json", "./datos/regiones.json", "./manifest.webmanifest", "./icon.svg", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

// Librerías externas que conviene guardar en el teléfono (Firebase, fuentes, escáner)
const EXTERNOS = ["www.gstatic.com", "fonts.googleapis.com", "fonts.gstatic.com", "unpkg.com", "cdn.jsdelivr.net"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(APP)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== "despensa-datos" && k !== "kai-compartido").map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  // «Compartir → Kai»: una foto del ticket o un texto llegan acá; los guardamos y abrimos la app para procesarlos
  if (req.method === "POST" && new URL(req.url).pathname.endsWith("/compartir")) {
    e.respondWith((async () => {
      const fd = await req.formData();
      const c = await caches.open("kai-compartido");
      await c.delete("foto"); await c.delete("texto");
      const foto = fd.get("foto");
      if (foto && foto.size) await c.put("foto", new Response(foto, { headers: { "content-type": foto.type || (/\.pdf$/i.test(foto.name || "") ? "application/pdf" : "image/jpeg"), "x-nombre": encodeURIComponent(foto.name || "") } }));
      const texto = [fd.get("titulo"), fd.get("texto"), fd.get("link")].filter(x => x && String(x).trim()).join("\n");
      if (texto) await c.put("texto", new Response(texto));
      return Response.redirect(new URL("./?compartido=1", self.registration.scope).href, 303);
    })());
    return;
  }
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // La página: primero la red (para tener siempre la última versión), si no hay señal la guardada
  if (req.mode === "navigate") {
    // otras páginas (como admin.html) van directo a la red y no pisan la app guardada
    if (!/\/(index\.html)?$/.test(url.pathname)) return;
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

// Avisos que llegan con la app cerrada (los manda scripts/avisos.mjs desde GitHub Actions)
self.addEventListener("push", e => {
  let d = {};
  try { const j = e.data?.json() || {}; d = j.data || j.notification || j; } catch { d = { body: e.data?.text() }; }
  const actions = d.tipo === "pregunta" ? [{ action: "ok", title: "Queda" }, { action: "agotado", title: "Se terminó" }]
    : d.tipo === "comida" && d.receta ? [{ action: "si", title: "Sí, eso" }, { action: "otra", title: "Otra cosa" }] : [];
  e.waitUntil(self.registration.showNotification(d.title || "Kai", {
    body: d.body || "", tag: d.tag || undefined, renotify: !!d.tag, icon: "icon-192.png", badge: "icon-192.png", actions,
    data: { ...d, tab: d.tab || "despensa" },
  }));
});

// ---- contestar la pregunta del día desde el aviso, sin abrir la app ----
// Usa la sesión de Firebase que la app ya dejó guardada en el teléfono y escribe directo en Firestore.
const FB_KEY = "AIzaSyDg0svGUiA37wOkrs31ROHMfx-OieBG6Xo";
const FS = "https://firestore.googleapis.com/v1/";
const DOCS = "projects/casa-48f64/databases/default/documents";
function sesionFirebase() {
  return new Promise((ok, mal) => {
    const r = indexedDB.open("firebaseLocalStorageDb");
    r.onerror = () => mal(r.error);
    r.onsuccess = () => {
      try {
        const tx = r.result.transaction("firebaseLocalStorage", "readonly"), q = tx.objectStore("firebaseLocalStorage").getAll();
        q.onsuccess = () => { const u = (q.result || []).map(x => x.value).find(v => v && v.stsTokenManager); u ? ok(u) : mal(new Error("sin sesión")); };
        q.onerror = () => mal(q.error);
      } catch (er) { mal(er); }
    };
  });
}
async function tokenFirebase() {
  const u = await sesionFirebase(), t = u.stsTokenManager;
  if (t.accessToken && t.expirationTime > Date.now() + 60000) return { token: t.accessToken, u };
  const r = await fetch(`https://securetoken.googleapis.com/v1/token?key=${FB_KEY}`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=refresh_token&refresh_token=" + encodeURIComponent(t.refreshToken) });
  if (!r.ok) throw new Error("no se pudo renovar la sesión");
  return { token: (await r.json()).id_token, u };
}
const valor = v => typeof v === "boolean" ? { booleanValue: v } : typeof v === "number" ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v }) : { stringValue: String(v) };
async function responderDesdeAviso(d, est) {
  const r = JSON.parse(d.r || "{}")[est]; if (!r || !d.casa || !d.item) throw new Error("faltan datos");
  const { token, u } = await tokenFirebase();
  const por = u.displayName || u.email || "";
  const campos = { cantidad: r.cantidad, por, ...(r.minimo != null ? { minimo: r.minimo } : {}), ...(r.enLista != null ? { enLista: r.enLista } : {}), ...(r.ritmo != null ? { ritmo: r.ritmo } : {}) };
  const casa = `${DOCS}/hogar/${d.casa}`;
  const writes = [
    { update: { name: `${casa}/items/${d.item}`, fields: Object.fromEntries(Object.entries(campos).map(([k, v]) => [k, valor(v)])) }, updateMask: { fieldPaths: Object.keys(campos) },
      updateTransforms: [{ fieldPath: "actualizado", setToServerValue: "REQUEST_TIME" }], currentDocument: { exists: true } },
    { update: { name: casa, fields: { pregunta: { mapValue: { fields: { resp: { booleanValue: true }, por: { stringValue: por }, est: { stringValue: est } } } } } }, updateMask: { fieldPaths: ["pregunta.resp", "pregunta.por", "pregunta.est"] } },
  ];
  if (r.delta) writes.push({ update: { name: `${casa}/movimientos/${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`, fields: Object.fromEntries(Object.entries({ itemId: d.item, nombre: d.nombre || "", unidad: d.unidad || "", delta: r.delta, tipo: r.delta < 0 ? "consumo" : "suma", por, estado: est, aviso: true }).map(([k, v]) => [k, valor(v)])) },
    updateTransforms: [{ fieldPath: "ts", setToServerValue: "REQUEST_TIME" }], currentDocument: { exists: false } });
  const d0 = new Date(), dia = `${d0.getFullYear()}-${String(d0.getMonth() + 1).padStart(2, "0")}-${String(d0.getDate()).padStart(2, "0")}`;
  writes.push({ transform: { document: `${DOCS}/metricas/${dia}`, fieldTransforms: [{ fieldPath: "preguntas", increment: { integerValue: "1" } }] } });
  const res = await fetch(`${FS}${DOCS}:commit`, { method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify({ writes }) });
  if (!res.ok) throw new Error("Firestore " + res.status);
}

// Tocar un aviso (o uno de sus botones) abre la app donde corresponde
async function abrir(url) {
  const abiertas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  for (const c of abiertas) { if ("focus" in c) { await c.navigate?.(url).catch(() => {}); return c.focus(); } }
  return self.clients.openWindow(url);
}
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const d = e.notification.data || {}, act = e.action;
  const url = q => new URL("./?" + q, self.registration.scope).href;
  e.waitUntil((async () => {
    if (d.tipo === "pregunta") {
      if (act === "ok" || act === "agotado") {
        const nom = String(d.nombre || "").toLowerCase();
        try {
          await responderDesdeAviso(d, act);
          return self.registration.showNotification(act === "ok" ? `✓ Anotado: queda ${nom}` : `✓ Anotado: se terminó ${nom}`, {
            body: act === "ok" ? "Gracias. Kai ajusta cuánto les dura." : "Pasó a la lista del súper.", tag: "pregunta", icon: "icon-192.png", badge: "icon-192.png", data: { tab: act === "ok" ? "despensa" : "lista" } });
        } catch { return abrir(url(`accion=pregunta&item=${encodeURIComponent(d.item)}&est=${act}`)); }
      }
      return abrir(url(`accion=pregunta&item=${encodeURIComponent(d.item || "")}`));
    }
    if (d.tipo === "comida") return abrir(url(act === "si" && d.receta ? `accion=comida&receta=${encodeURIComponent(d.receta)}&hice=1` : "accion=comida"));
    return abrir(url("tab=" + (d.tab || "despensa")));
  })());
});

// Resumen semanal con la app cerrada (Chrome en Android, con la app instalada)
function ultimoMomento(cfg, ahora = new Date()) {
  const dias = Array.isArray(cfg.dias) ? cfg.dias : cfg.dia >= 0 ? [cfg.dia] : [];
  for (let i = 0; i < 8; i++) {
    const d = new Date(ahora); d.setDate(d.getDate() - i); d.setHours(cfg.hora, 0, 0, 0);
    if (d <= ahora && dias.includes(d.getDay())) return d.getTime();
  }
  return 0;
}
self.addEventListener("periodicsync", e => {
  if (e.tag !== "resumen") return;
  e.waitUntil((async () => {
    const c = await caches.open("despensa-datos");
    const r = await c.match("./__resumen");
    if (!r) return;
    const d = await r.json();
    if (!d.on || !d.cfg) return;
    const debido = ultimoMomento(d.cfg);
    if (!debido || (d.ult || 0) >= debido) return;
    await self.registration.showNotification(d.titulo, { body: d.cuerpo, tag: "resumen", icon: "icon-192.png", badge: "icon-192.png", data: { tab: "lista" } });
    d.ult = Date.now();
    await c.put("./__resumen", new Response(JSON.stringify(d), { headers: { "Content-Type": "application/json" } }));
  })());
});
