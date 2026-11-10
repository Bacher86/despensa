// Idiomas de Kai. El texto "fuente" es el español rioplatense que está escrito en el código;
// los diccionarios i18n/es.json (español neutro), en.json (inglés) y pt.json (portugués) lo traducen.
// La traducción se aplica sola a todo lo que aparece en pantalla (textos, placeholders, títulos).
export const IDIOMAS = [["es-AR", "Español (voseo)"], ["es", "Español"], ["en", "English"], ["pt", "Português"]];
const VOSEO = ["AR", "UY", "PY"];

function automatico() {
  const ls = navigator.languages?.length ? navigator.languages : [navigator.language || "es-AR"];
  for (const l of ls) {
    const [b, r = ""] = l.toLowerCase().split("-");
    if (b === "es") return VOSEO.includes(r.toUpperCase()) || !r ? "es-AR" : "es";
    if (b === "pt") return "pt";
    if (b === "en") return "en";
  }
  return "en";
}
const guardado = (() => { try { return localStorage.getItem("idioma"); } catch { return null; } })();
export const idioma = IDIOMAS.some(x => x[0] === guardado) ? guardado : automatico();
export const base = idioma === "es-AR" ? "es" : idioma;
export const LOC = { "es-AR": "es-AR", es: "es", en: "en", pt: "pt-BR" }[idioma];
document.documentElement.lang = LOC;
export function cambiarIdioma(l) { try { localStorage.setItem("idioma", l); } catch {} location.reload(); }

import { crearTraductor } from "./traductor.js";
let tr = () => null;
const HECHOS = new Set();       // textos ya traducidos (para no traducirlos dos veces)
const norm = s => s.replace(/\s+/g, " ").trim();
export { tr };
// para textos que no pasan por la pantalla (compartir, imágenes, títulos)
export const t = s => tr(s) ?? s;

const SALTAR = new Set(["SCRIPT", "STYLE", "TEXTAREA", "CODE", "NOSCRIPT"]);
const saltar = el => !el || SALTAR.has(el.nodeName) || el.closest?.('[translate="no"],[contenteditable="true"]');
function trTexto(n) {
  const v = n.nodeValue;
  if (!v || HECHOS.has(v) || !/[A-Za-zÁÉÍÓÚáéíóúñÑ¿¡]/.test(v)) return;
  const el = n.parentElement; if (saltar(el)) return;
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(v);
  const x = tr(m[2]); if (x == null) return;
  // un <option> sin value toma su texto como valor: se guarda el original para no cambiar los datos
  if (el.nodeName === "OPTION" && !el.hasAttribute("value")) el.setAttribute("value", norm(m[2]));
  const nv = m[1] + x + m[3];
  if (HECHOS.size > 8000) HECHOS.clear();
  HECHOS.add(nv); n.nodeValue = nv;
}
const ATRS = ["placeholder", "title", "aria-label"];
function trAtrs(el) {
  if (saltar(el)) return;
  for (const a of ATRS) {
    const v = el.getAttribute?.(a); if (!v || HECHOS.has(v)) continue;
    const x = tr(v); if (x != null) { HECHOS.add(x); el.setAttribute(a, x); }
  }
}
function recorrer(raiz) {
  if (raiz.nodeType === 3) { trTexto(raiz); return; }
  if (raiz.nodeType !== 1 || SALTAR.has(raiz.nodeName)) return;
  trAtrs(raiz);
  for (const el of raiz.querySelectorAll("[placeholder],[title],[aria-label]")) trAtrs(el);
  const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) trTexto(n);
}

// mientras llega el diccionario, la pantalla espera (como mucho 1,5 s) para no mostrar textos mezclados
if (idioma !== "es-AR") { document.documentElement.classList.add("tr-carga"); setTimeout(() => document.documentElement.classList.remove("tr-carga"), 1500); }
export const listo = idioma === "es-AR" ? Promise.resolve() :
  fetch(`i18n/${base}.json`).then(r => r.json()).then(d => {
    tr = crearTraductor(d);
    recorrer(document.body);
    if (document.title) document.title = t(document.title);
    new MutationObserver(ms => {
      for (const m of ms) {
        if (m.type === "characterData") trTexto(m.target);
        else if (m.type === "attributes") trAtrs(m.target);
        else for (const n of m.addedNodes) recorrer(n);
      }
    }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATRS });
  }).catch(e => console.warn("Idioma:", e)).finally(() => document.documentElement.classList.remove("tr-carga"));
