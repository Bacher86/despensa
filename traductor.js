// Motor de traducción (sin nada del navegador): lo usan la app (i18n.js) y el servidor de avisos.
const norm = s => s.replace(/\s+/g, " ").trim();
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function crearTraductor(d) {
  const DIC = new Map(Object.entries(d)), PAT = [];
  for (const [k, v] of DIC) {
    if (!/\{\d\}/.test(k)) continue;
    const partes = k.split(/(\{\d\})/);
    const lits = partes.filter((p, i) => i % 2 === 0 && p);
    const re = new RegExp("^" + partes.map((p, i) => i % 2 ? "(.*?)" : escRe(p)).join("") + "$");
    const orden = partes.filter((p, i) => i % 2).map(p => Number(p[1]));
    PAT.push({ re, v, orden, lit: lits.sort((a, b) => b.length - a.length)[0] || "" });
  }
  PAT.sort((a, b) => b.lit.length - a.lit.length);

  // traduce un texto (o devuelve null si no hay traducción)
  function tr(s) {
  if (!DIC.size || !s) return null;
  const k = norm(s);
  const d = DIC.get(k);
  if (d != null) return d;
  for (const p of PAT) {
    if (p.lit && !k.includes(p.lit)) continue;
    const m = p.re.exec(k); if (!m) continue;
    const val = {}; p.orden.forEach((n, i) => { const x = m[i + 1]; val[n] = DIC.get(norm(x)) ?? (x.length > 2 ? trPatron(norm(x)) : null) ?? x; });
    return p.v.replace(/\{(\d)\}/g, (_, n) => val[n] ?? "");
  }
  // textos armados con " · " (ej: "Creó la casa · usó Kai hoy"): se traduce cada parte
  if (k.includes(" · ")) {
    const partes = k.split(" · "), tr2 = partes.map(x => DIC.get(x) ?? trPatron(x));
    if (tr2.some(x => x != null)) return partes.map((x, i) => tr2[i] ?? x).join(" · ");
  }
  // listas cortas armadas con "," e "y" (ej: "2 adultos y 1 chico"): solo si TODAS las partes tienen traducción
  if (/, | y /.test(k) && k.length < 120) {
    const partes = k.split(/, | y /), tr2 = partes.map(x => DIC.get(x) ?? trPatron(x));
    if (tr2.every(x => x != null)) {
      const y = DIC.get("__y") || "y";
      return tr2.length > 1 ? tr2.slice(0, -1).join(", ") + " " + y + " " + tr2[tr2.length - 1] : tr2[0];
    }
  }
  return null;
}
function trPatron(k) {
  for (const p of PAT) {
    if (p.lit && !k.includes(p.lit)) continue;
    const m = p.re.exec(k); if (!m) continue;
    const val = {}; p.orden.forEach((n, i) => { const x = m[i + 1]; val[n] = DIC.get(norm(x)) ?? x; });
    return p.v.replace(/\{(\d)\}/g, (_, n) => val[n] ?? "");
  }
  return null;
}
  return tr;
}
