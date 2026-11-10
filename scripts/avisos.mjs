// Avisos de Kai con la app cerrada.
// Lo corre GitHub Actions cada 30 minutos (.github/workflows/avisos.yml) con la cuenta de servicio
// de Firebase guardada en el secreto FIREBASE_SA. Manda, a cada teléfono que activó los avisos:
//  · "Uriel agregó leche a la lista" (a los demás de la casa)
//  · "Mañana se termina el café" (según lo que Kai aprendió que dura cada cosa) · una vez por día, 10 h
//  · "El yogur vence mañana"                                                     · una vez por día, 10 h
//  · "¿Queda yerba?" una vez por día, con botones para contestar desde el aviso (a la hora que elige cada uno, 11 h si no)
//  · "¿Qué comieron hoy?" para descontar lo que se cocinó (21 h si no eligió otra hora)
//  · el resumen, los días y a la hora que eligió cada uno (por defecto domingos 19 h):
//    "¿Revisamos la despensa?" si hace días que no se hace el repaso, o lo que falta y lo que vence
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
  // la pregunta del día: lo que Kai calcula que se está terminando, o lo que hace mucho nadie mira
  const candidatos = () => items.map(it => {
    const s = estado(it), t = tasaDe(it), dr = t ? cantVista(it) / t : null, quieto = (ahora - ms(it.actualizado || 0)) / DIA;
    const estim = cantVista(it) !== num(it.cantidad);
    let pts = -1;
    if (it.enCarrito || it.enLista === true) pts = -1;
    else if (estim && s !== "ok") pts = 100 - (dr ?? 0);
    else if (dr != null && dr <= 7) pts = 60 - dr;
    else if (s === "ok" && quieto > 21) pts = 20 + Math.min(20, quieto / 7);
    return { it, pts, s, dr, quieto: Math.floor(quieto) };
  }).filter(x => x.pts > 0).sort((a, b) => b.pts - a.pts);
  // qué guardar según lo que contesten (igual que "Hay · Poco · No hay" en la app, con el aprendizaje del ritmo)
  const respuestas = it => {
    const m = num(it.minimo), paso = num(it.paso) || 1, q = cantVista(it), obj = num(it.objetivo), orden = { ok: 2, bajo: 1, agotado: 0 };
    const out = {};
    for (const est of ["ok", "bajo", "agotado"]) {
      const d = est === "agotado" ? { cantidad: 0 } : est === "bajo" ? (m > 0 ? { cantidad: m } : { cantidad: paso, minimo: paso })
        : { cantidad: estado(it) === "ok" ? q : Math.max(obj > m ? obj : 0, m + paso, num(it.cantidad) > m ? num(it.cantidad) : 0, paso), enLista: false };
      const dif = orden[est] - orden[estado(it)];
      if (tasas.get(it.id) && q !== num(it.cantidad) && dif) d.ritmo = +Math.min(3, Math.max(.3, (num(it.ritmo) || 1) * (dif > 0 ? .75 : 1.3))).toFixed(2);
      d.delta = +(d.cantidad - q).toFixed(3);
      out[est] = d;
    }
    return out;
  };
  return { pronto, estado, cantVista, candidatos, respuestas };
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
  let total = 0;

  const casas = await db.collection("hogar").get();
  for (const casa of casas.docs) {
    const mSnap = await casa.ref.collection("miembros").get();
    const miembros = mSnap.docs.map(d => ({ uid: d.id, ref: d.ref, ...d.data() })).filter(m => (Array.isArray(m.fcm) && m.fcm.length) || (Array.isArray(m.fcmApp) && m.fcmApp.length));
    if (!miembros.length) continue;
    const config = casa.data() || {};
    const avisos = [];   // { title, body, tab, tag, salvo?, solo? }
    let itemsCasa = null;

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

    // 1b) alguien avisó que va al súper
    if (config.voy && ms(config.voy.ts) > desde && !enviados[`${casa.id}:voy:${ms(config.voy.ts)}`]) {
      enviados[`${casa.id}:voy:${ms(config.voy.ts)}`] = ahora;
      avisos.push({ title: `${primer(config.voy.nombre) || "Alguien"} va al súper`, body: "¿Falta algo? Sumalo a la lista y le aparece.", tab: "lista", tag: "voy", salvo: primer(config.voy.nombre), salvoUid: config.voy.uid });
    }

    // 2) lo que se termina mañana y lo que vence mañana (una vez por día)
    if (diario) {
      const items = itemsCasa = (await casa.ref.collection("items").get()).docs.map(d => ({ id: d.id, ...d.data() }));
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

    // 3) pregunta del día y "¿qué comieron hoy?": a cada uno a la hora que eligió
    const hoyPreg = config.pregunta?.fecha === ar.fecha ? config.pregunta : null;
    const quierePreg = miembros.filter(m => { const h = m.diario?.pregunta === undefined ? 11 : m.diario.pregunta; return h != null && ar.hora >= h && !enviados[`${casa.id}:preg:${m.uid}:${ar.fecha}`]; });
    if (quierePreg.length && !hoyPreg?.resp) {
      let preg = hoyPreg;
      if (!preg) {
        const items = itemsCasa || (itemsCasa = (await casa.ref.collection("items").get()).docs.map(d => ({ id: d.id, ...d.data() })));
        const movs = (await casa.ref.collection("movimientos").where("ts", ">=", Timestamp.fromMillis(ahora - 90 * DIA)).get()).docs.map(d => d.data());
        const P = pronostico(items, movs, config, ahora);
        const ya = new Set(Object.keys(enviados).filter(k => k.startsWith(casa.id + ":pregitem:")).map(k => k.split(":")[2]));
        const c = P.candidatos().find(x => !ya.has(x.it.id));
        if (c) {
          preg = { item: c.it.id, nombre: c.it.nombre, fecha: ar.fecha, resp: false, motivo: c.s !== "ok" ? "calc" : c.dr != null && c.dr <= 7 ? "pronto" : "quieto", dias: c.quieto, r: P.respuestas(c.it) };
          enviados[`${casa.id}:pregitem:${c.it.id}`] = ahora;
          await casa.ref.update({ pregunta: preg }).catch(e => console.log("pregunta:", e.message));
        }
      }
      if (preg) {
        for (const m of quierePreg) enviados[`${casa.id}:preg:${m.uid}:${ar.fecha}`] = ahora;
        avisos.push({ title: `¿Queda ${minus(preg.nombre)}?`, tipo: "pregunta",
          body: preg.motivo === "calc" ? "Kai calcula que se está terminando. Contestá desde acá." : preg.motivo === "pronto" ? "Kai calcula que se termina esta semana. Contestá desde acá." : `Hace ${preg.dias} días que nadie lo revisa. Contestá desde acá.`,
          tab: "despensa", tag: "pregunta", extra: { casa: casa.id, item: preg.item, nombre: preg.nombre, unidad: "", r: JSON.stringify(preg.r) }, solo: new Set(quierePreg.map(m => m.uid)) });
      }
    }
    const quiereComida = miembros.filter(m => { const h = m.diario?.comida === undefined ? 21 : m.diario.comida; return h != null && ar.hora >= h && m.comidaResp !== ar.fecha && !enviados[`${casa.id}:comida:${m.uid}:${ar.fecha}`]; });
    if (quiereComida.length) {
      const sug = config.sugerida && (Date.parse(ar.fecha) - Date.parse(config.sugerida.fecha || "2000-01-01")) / DIA <= 1 ? config.sugerida : null;
      for (const m of quiereComida) enviados[`${casa.id}:comida:${m.uid}:${ar.fecha}`] = ahora;
      avisos.push({ title: "¿Qué comieron hoy?", tipo: "comida", body: sug ? (sug.menu ? `Hoy tocaba ${minus(sug.n)} en el menú. ¿Lo hicieron? Kai descuenta lo que usaron.` : `¿Hicieron ${minus(sug.n)}? Contale a Kai y descuenta lo que usaron.`) : "Contale a Kai qué cocinaron y descuenta lo que usaron.",
        tab: "despensa", tag: "comida", extra: sug ? { receta: sug.id, nreceta: sug.n } : {}, solo: new Set(quiereComida.map(m => m.uid)) });
    }

    // 4) resumen: a cada uno, los días y la hora que eligió
    const resumenPara = miembros.filter(m => {
      const c = m.resumen || { dias: [0], hora: 19 };
      return Array.isArray(c.dias) && c.dias.includes(ar.dia) && ar.hora >= (c.hora ?? 19) && !enviados[`${casa.id}:resumen:${m.uid}:${ar.fecha}`];
    });
    if (resumenPara.length) {
      const items = itemsCasa || (await casa.ref.collection("items").get()).docs.map(d => ({ id: d.id, ...d.data() }));
      const faltan = items.filter(i => i.enLista === true || num(i.cantidad) <= 0).map(i => minus(i.nombre));
      const sinRepaso = (ahora - ms(config.repasoUlt)) / DIA >= 2 && items.length >= 3;
      const a = sinRepaso
        ? { title: "¿Revisamos la despensa?", body: "30 segundos: deslizá lo que queda y lo que se terminó.", tab: "repaso", tag: "resumen" }
        : { title: "Tu resumen de Kai", body: faltan.length ? `Faltan ${faltan.length}: ${listar(faltan)}.` : "No falta nada en la despensa.", tab: "lista", tag: "resumen" };
      for (const m of resumenPara) enviados[`${casa.id}:resumen:${m.uid}:${ar.fecha}`] = ahora;
      avisos.push({ ...a, solo: new Set(resumenPara.map(m => m.uid)) });
    }

    for (const a of avisos) {
      for (const m of miembros) {
        if (a.salvo && primer(m.nombre) === a.salvo) continue;
        if (a.salvoUid && m.uid === a.salvoUid) continue;
        if (a.solo && !a.solo.has(m.uid)) continue;
        const datos = { title: a.title.slice(0, 120), body: a.body, tab: a.tab, tag: a.tag, ...(a.tipo ? { tipo: a.tipo } : {}), ...(a.extra || {}) };
        // app de Android: notificación nativa (la muestra el sistema aunque la app esté cerrada)
        const toks = (m.fcmApp || []).slice(-3);
        if (toks.length) {
          const ra = await fcm.sendEachForMulticast({
            tokens: toks,
            notification: { title: datos.title, body: datos.body },
            data: datos,
            android: { priority: "high", ttl: 20 * 3600 * 1000, collapseKey: datos.tag, notification: { channelId: "avisos", tag: datos.tag, color: "#3f4a20" } },
          });
          total += ra.successCount;
          const malosA = ra.responses.map((x, i) => !x.success && /not-registered|invalid-registration|invalid-argument/.test(x.error?.code || "") ? toks[i] : null).filter(Boolean);
          if (malosA.length) await m.ref.update({ fcmApp: FieldValue.arrayRemove(...malosA) }).catch(() => {});
        }
        if (!m.fcm?.length) continue;
        const r = await fcm.sendEachForMulticast({
          tokens: m.fcm.slice(-5),
          data: { title: a.title.slice(0, 120), body: a.body, tab: a.tab, tag: a.tag, ...(a.tipo ? { tipo: a.tipo } : {}), ...(a.extra || {}) },
          webpush: { headers: { Urgency: "high", TTL: String(20 * 3600) } },
        });
        total += r.successCount;
        const malos = r.responses.map((x, i) => !x.success && /not-registered|invalid-registration|invalid-argument/.test(x.error?.code || "") ? m.fcm.slice(-5)[i] : null).filter(Boolean);
        if (malos.length) await m.ref.update({ fcm: FieldValue.arrayRemove(...malos) }).catch(() => {});
      }
    }
  }
  await estadoRef.set({ ultimo: ahora, enviados, ...(diario ? { diario: ar.fecha } : {}) }, { merge: false });
  console.log(`Listo: ${total} avisos entregados.`);
}
if (process.argv[1]?.endsWith("avisos.mjs")) main().catch(e => { console.error(e); process.exit(1); });
