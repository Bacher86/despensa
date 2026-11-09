// Avisos de Kai con la app cerrada.
// Lo corre GitHub Actions cada 30 minutos (.github/workflows/avisos.yml) con la cuenta de servicio
// de Firebase guardada en el secreto FIREBASE_SA. Manda, a cada teléfono que activó los avisos:
//  · "Uriel agregó leche a la lista" (a los demás de la casa)
//  · "Mañana se termina el café" (según lo que Kai aprendió que dura cada cosa) · una vez por día, 10 h
//  · "El yogur vence mañana"                                                     · una vez por día, 10 h
//  · "¿Revisamos la despensa?" los domingos a las 19 h, si hace 6 días que no se hace el repaso
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { hogarDe, tasaBase } from "../consumo.js";

const DIA = 86400000;
const num = v => { const n = parseFloat(String(v ?? "").replace(",", ".")); return isFinite(n) ? n : 0; };
const ms = t => t?.toMillis ? t.toMillis() : typeof t === "number" ? t : 0;
const primer = s => String(s || "").trim().split(/\s+/)[0] || "";
const minus = s => String(s || "").toLowerCase();
const listar = ns => ns.length <= 1 ? (ns[0] || "") : ns.length === 2 ? `${ns[0]} y ${ns[1]}` : `${ns.slice(0, 2).join(", ")} y ${ns.length - 2} más`;

// ---- la misma cuenta que hace la app (index.html: calcTasas, cantVista, estado) ----
export function calcTasas(movs, ahora = Date.now()) {
  const tasas = new Map(), info = new Map(), por = new Map();
  for (const m of movs) {
    if (!m.itemId || m.itemId === "-") continue;
    const p = por.get(m.itemId) || por.set(m.itemId, { cons: [], comp: [] }).get(m.itemId);
    if (m.tipo === "consumo") p.cons.push(m);
    else if ((m.tipo === "compra" || m.tipo === "suma") && num(m.delta) > 0) p.comp.push({ t: ms(m.ts), q: num(m.delta) });
  }
  for (const [id, p] of por) {
    const r = [];
    if (p.cons.length >= 2) {
      const total = p.cons.reduce((s, m) => s + Math.abs(num(m.delta)), 0);
      const primero = Math.min(...p.cons.map(m => ms(m.ts)));
      r.push(total / Math.min(90, Math.max(7, (ahora - primero) / DIA)));
    }
    const c = p.comp.sort((x, y) => x.t - y.t);
    if (c.length >= 2) {
      const dias = (c[c.length - 1].t - c[0].t) / DIA;
      if (dias >= 2) r.push(c.slice(0, -1).reduce((s, x) => s + x.q, 0) / dias);
    }
    if (r.length) {
      tasas.set(id, r.reduce((s, x) => s + x, 0) / r.length);
      info.set(id, { qProm: c.length ? c.reduce((s, x) => s + x.q, 0) / c.length : 0, n: c.length + p.cons.length });
    }
  }
  return { tasas, info };
}
export function pronostico(items, movs, config = {}, ahora = Date.now()) {
  const { tasas, info } = calcTasas(movs, ahora);
  const auto = config.autoConsumo !== false;
  // igual que la app: lo aprendido, mezclado con el consumo típico de la casa mientras hay pocos datos
  const h = hogarDe(config), baseDesde = ms(config.hogarTs) || Date.parse("2026-11-09T12:00:00-03:00");
  const cruda = it => {
    const l = tasas.get(it.id) || 0, b = tasaBase(it, h);
    if (!b) return l; if (!l) return b;
    const n = (info.get(it.id)?.n || 0);
    return n >= 6 ? l : (l * n + b * 1.5) / (n + 1.5);
  };
  const tasaDe = it => cruda(it) * Math.min(3, Math.max(.3, num(it.ritmo) || 1));
  const cantVista = it => {
    const q = num(it.cantidad), t = tasaDe(it);
    if (!auto || !t || it.auto === false || q <= 0 || !it.actualizado) return q;
    const desde = !tasas.get(it.id) && tasaBase(it, h) ? Math.max(ms(it.actualizado), baseDesde) : ms(it.actualizado);
    return Math.max(0, +(q - t * Math.max(0, (ahora - desde) / DIA - .5)).toFixed(2));
  };
  const estado = it => { const q = cantVista(it), m = num(it.minimo); return q <= 0 ? "agotado" : q <= m ? "bajo" : "ok"; };
  const pronto = items.filter(it => {
    const t = tasaDe(it); if (!t || it.enLista === true || estado(it) !== "ok") return false;
    return cantVista(it) / t <= 1.5;
  }).map(it => {
    const q = info.get(it.id)?.qProm || num(it.objetivo) || num(it.paso) || 1;
    return { ...it, dura: q / tasaDe(it) };
  });
  return { pronto, estado, cantVista };
}
const textoDura = d => d < 1.5 ? "menos de 2 días" : d < 13 ? `~${Math.round(d)} días` : d < 45 ? `~${Math.round(d / 7)} semana${Math.round(d / 7) > 1 ? "s" : ""}` : `~${Math.round(d / 30)} mes${Math.round(d / 30) > 1 ? "es" : ""}`;
// fecha y hora de Argentina (UTC−3, sin horario de verano)
export const horaAR = (t = Date.now()) => { const d = new Date(t - 3 * 3600000); return { fecha: d.toISOString().slice(0, 10), hora: d.getUTCHours(), dia: d.getUTCDay(), min: d.getUTCMinutes() }; };
const diasHasta = (fecha, hoy) => Math.round((Date.parse(fecha + "T00:00:00Z") - Date.parse(hoy + "T00:00:00Z")) / DIA);

async function main() {
  if (!process.env.FIREBASE_SA) { console.log("::notice::Falta el secreto FIREBASE_SA: los avisos con la app cerrada no se mandan todavía."); return; }
  const app = initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SA)) });
  const db = getFirestore(app, "default");
  const fcm = getMessaging(app);
  const ahora = Date.now(), ar = horaAR(ahora);
  const estadoRef = db.doc("sistema/avisos");
  const est = (await estadoRef.get()).data() || {};
  const desde = Math.max(ms(est.ultimo) || ahora - 30 * 60000, ahora - 6 * 3600000);
  const enviados = Object.fromEntries(Object.entries(est.enviados || {}).filter(([, t]) => ahora - t < 4 * DIA));
  const diario = ar.hora >= 10 && est.diario !== ar.fecha;          // primera corrida después de las 10
  const domingo = ar.dia === 0 && ar.hora >= 19 && est.repaso !== ar.fecha;
  let total = 0;

  const casas = await db.collection("hogar").get();
  for (const casa of casas.docs) {
    const mSnap = await casa.ref.collection("miembros").get();
    const miembros = mSnap.docs.map(d => ({ uid: d.id, ref: d.ref, ...d.data() })).filter(m => Array.isArray(m.fcm) && m.fcm.length);
    if (!miembros.length) continue;
    const config = casa.data() || {};
    const avisos = [];   // { title, body, tab, tag, salvo? }

    // 1) lo que se agregó a la lista desde la última vuelta
    const nuevos = await casa.ref.collection("items").where("agregadoTs", ">", Timestamp.fromMillis(desde)).get();
    const porQuien = new Map();
    for (const d of nuevos.docs) {
      const it = d.data(); if (!it.enLista || it.enCarrito) continue;
      const k = `${casa.id}:lista:${d.id}:${ms(it.agregadoTs)}`; if (enviados[k]) continue; enviados[k] = ahora;
      const q = primer(it.agregadoPor) || "Alguien";
      (porQuien.get(q) || porQuien.set(q, []).get(q)).push(it.nombre);
    }
    for (const [q, ns] of porQuien) avisos.push({ title: `${q} agregó ${minus(listar(ns))} a la lista`, body: "Tocá para ver la lista del súper.", tab: "lista", tag: "lista-agregado", salvo: q });

    // 2) lo que se termina mañana y lo que vence mañana (una vez por día)
    if (diario) {
      const items = (await casa.ref.collection("items").get()).docs.map(d => ({ id: d.id, ...d.data() }));
      const movs = (await casa.ref.collection("movimientos").where("ts", ">=", Timestamp.fromMillis(ahora - 90 * DIA)).get()).docs.map(d => d.data());
      const { pronto } = pronostico(items, movs, config, ahora);
      for (const it of pronto.slice(0, 3)) {
        const k = `${casa.id}:pronto:${it.id}:${ar.fecha}`; if (enviados[k]) continue; enviados[k] = ahora;
        avisos.push({ title: `Mañana se termina ${minus(it.nombre)}`, body: `A tu casa le dura ${textoDura(it.dura)}. ¿La sumo a la lista?`, tab: "lista", tag: "pronto-" + it.id });
      }
      for (const it of items.filter(i => i.vence && num(i.cantidad) > 0 && diasHasta(i.vence, ar.fecha) === 1).slice(0, 3)) {
        const k = `${casa.id}:vence:${it.id}:${it.vence}`; if (enviados[k]) continue; enviados[k] = ahora;
        avisos.push({ title: `${it.nombre}: vence mañana`, body: "Fijate en Recetas qué podés hacer con eso.", tab: "cocinar", tag: "vence-" + it.id });
      }
    }

    // 3) repaso de los domingos
    if (domingo && (ahora - ms(config.repasoUlt)) / DIA >= 6) {
      const k = `${casa.id}:repaso:${ar.fecha}`;
      if (!enviados[k]) { enviados[k] = ahora; avisos.push({ title: "¿Revisamos la despensa?", body: "30 segundos: deslizá lo que queda y lo que se terminó.", tab: "repaso", tag: "repaso" }); }
    }

    for (const a of avisos) {
      for (const m of miembros) {
        if (a.salvo && primer(m.nombre) === a.salvo) continue;
        const r = await fcm.sendEachForMulticast({
          tokens: m.fcm.slice(-5),
          data: { title: a.title.slice(0, 120), body: a.body, tab: a.tab, tag: a.tag },
          webpush: { headers: { Urgency: "high", TTL: String(20 * 3600) } },
        });
        total += r.successCount;
        const malos = r.responses.map((x, i) => !x.success && /not-registered|invalid-registration|invalid-argument/.test(x.error?.code || "") ? m.fcm.slice(-5)[i] : null).filter(Boolean);
        if (malos.length) await m.ref.update({ fcm: FieldValue.arrayRemove(...malos) }).catch(() => {});
      }
    }
  }
  await estadoRef.set({ ultimo: ahora, enviados, ...(diario ? { diario: ar.fecha } : {}), ...(domingo ? { repaso: ar.fecha } : {}) }, { merge: false });
  console.log(`Listo: ${total} avisos entregados.`);
}
if (process.argv[1]?.endsWith("avisos.mjs")) main().catch(e => { console.error(e); process.exit(1); });
