// Lector de tickets de supermercados argentinos.
// 1) leerTicket(texto): del texto que sale de la foto saca los renglones de productos (descripción, cantidad,
//    importe, código de barras) y el total. Entiende los formatos de Coto, Día, Carrefour, Jumbo/Disco/Vea,
//    Changomás, La Anónima, cooperativas y autoservicios: cantidad arriba o abajo, pesables, columna de IVA,
//    códigos de barras, descuentos y el pie de la Ley de Transparencia Fiscal.
// 2) nombrar(desc, dic): pasa la descripción abreviada del ticket ("GALL OREO X118G") a un nombre que se
//    entiende ("Galletitas Oreo"), con el vocabulario armado de la base SEPA (datos/tickets.json):
//    24 mil descripciones de ticket reales con su nombre completo, abreviaturas aprendidas y palabras frecuentes.

export const normal = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

/* ---------- números ---------- */
// "1.234,56" · "1234,56" · "1,234.56" · "$ 990,00" · "-360,00"
const NUM = String.raw`-?\$?\s?(?:\d{1,3}(?:[.,\s]\d{3})+|\d+)[.,]\d{2}`;
const RE_PRECIO_FIN = new RegExp(String.raw`(${NUM})\s*(?:[A-Za-z*%]{1,3}|\(?\d{1,2}[.,]?\d{0,2}\s?%\)?)?\s*$`);
const RE_DOS_PRECIOS = new RegExp(String.raw`(${NUM})\s+(${NUM})\s*(?:[A-Za-z*%]{1,3})?\s*$`);
const RE_CANT = /^\s*(\d+(?:[.,]\d{1,3})?)\s*(kgs?|k|grs?|un|u|unid|uni|unidades)?\.?\s*[xX*×]{1,2}\s*\$?\s*(\d[\d.,]*)\s*(?:\/\s*(kg|k|un|u))?/i;
export const parsePrecio = s => {
  s = String(s).replace(/[$\s]/g, "");
  const neg = s.startsWith("-"); s = s.replace(/^-/, "");
  const m = s.match(/^(.*)[.,](\d{2})$/);
  s = m ? m[1].replace(/[.,]/g, "") + "." + m[2] : s.replace(/,/g, "");
  const v = parseFloat(s) || 0; return neg ? -v : v;
};
// centavos que en realidad eran ",00" mal leído (",08", ",60", ",98"...)
const centRaros = v => { const cc = String(Math.round(v * 100) % 100).padStart(2, "0"); return cc !== "00" && /^[0689]{2}$/.test(cc) && (cc.includes("0") || cc[0] !== cc[1]) ? Math.floor(v) : v; };
const parseCant = s => parseFloat(String(s).replace(",", ".")) || 1;
const sinPrimerDigito = v => { const e = Math.floor(v), s = String(e); return s.length >= 4 ? parseFloat(s.slice(1)) + (v - e) : null; };
const cerca = (a, b) => Math.abs(a - b) <= Math.max(1, Math.abs(b) * 0.01);

/* ---------- renglones que no son productos ---------- */
const NO_PRODUCTO = new RegExp([
  String.raw`\btotal`, String.raw`sub ?total`, String.raw`\bi\.?\s?v\.?\s?a\b`, "iva contenido", "transparencia", String.raw`ley\s?27`, "consumidor",
  String.raw`otros imp`, "impuestos?", "percep", "retenc", "ingresos brutos", String.raw`i\.?\s?i\.?\s?b\.?\s?b`, String.raw`c\.?\s?u\.?\s?i\.?\s?t`,
  "tarjeta", "vuelto", "efectivo", String.raw`\bcambio\b`, String.raw`su pago`, "recibimos", "recibido", String.raw`\bpago`, "debito", "credito", "cuotas?",
  String.raw`\bvisa\b`, "master", "maestro", "cabal", "naranja x", String.raw`mercado ?pago`, String.raw`\bqr\b`, String.raw`\bmodo\b`, "cuenta dni",
  "cajer", String.raw`^caja\b`, String.raw`\bticket\b`, String.raw`\btique\b`, "factura", "fecha", String.raw`\bhora\b`, "cliente", String.raw`cant\.? ?art`,
  "articulos", String.raw`\bitems?\b`, "redondeo", "donacion", "saldo", "puntos", "gracias", String.raw`\bcae\b`, String.raw`\bvto\b`, "domicilio",
  "telefono", String.raw`inicio act`, String.raw`resp\.? ?insc`, "monotrib", String.raw`precio unit`, String.raw`^importe`, "recargo", "sucursal",
  String.raw`^suc\b`, String.raw`p\.?\s?v\.?\s?n`, String.raw`\bnro\b`, "defensa del consumidor", "comprobante", "original", "duplicado",
].join("|"), "i");
const DESCUENTO_INICIO = /^(desc(uento|to)?s?|dto|bonif|promo|ahorro|beneficio|cupon|reintegro|oferta)\b/;
const DESCUENTO = /\b(desc(uento|to)?s?|dto|bonif|promo|ahorr|oferta|2x1|3x2|2da|segunda|beneficio|club|comunidad|mi carrefour|jumbo mas|ahorro dia|cupon|reintegro)\b/i;

// errores típicos de lectura dentro de los números
function arreglarNumeros(l) {
  return l
    .replace(/(\d)[%'`"´°*]+(?=[\d.,])/g, "$1")
    .replace(/(?<=\d[.,]?)[Oo](?=[\d.,]|$)/g, "0").replace(/(?<=[\d.,])[Oo]/g, "0")
    .replace(/(?<=\d[.,]?)[lI|](?=[\d.,])/g, "1")
    .replace(/(?<=\d[.,]?)[S](?=\d)/g, "5").replace(/(?<=\d[.,]?)B(?=\d)/g, "8")
    .replace(/(\d,\d{2})\d(?=\s*$)/, "$1")
    .replace(/(\d[.,])\s+(\d{2})(?=\D{0,4}$)/, "$1$2")
    .replace(/^(\d+[.,])\s(\d{3})(?=\s*(kgs?|k|un|u|x)\b)/i, "$1$2")
    .replace(/(\d)\s+([.,]\d{2})(?=\D*$)/, "$1$2")
    .replace(/(\d)\s([.,])\s?(\d{2})(?=\D*$)/, "$1$2$3")
    .replace(/(\d{1,3})\s(\d{3}[.,]\d{2})(?=\D*$)/, "$1.$2");
}

const PESABLE = /\b(queso|jamon|fiambre|salame|salamin|mortadela|bondiola|carne|picada|asado|vacio|nalga|bola de lomo|cuadril|pollo|pechuga|suprema|muslo|cerdo|bife|milanesa|osobuco|papa|batata|cebolla|tomate|zanahoria|zapallo|lechuga|banana|manzana|naranja|mandarina|pera|limon|frutilla|uva|kiwi|palta|morron|pimiento|verdura|fruta|x ?kg|granel|suelto)\b/i;

export function leerTicket(texto) {
  const lineas = String(texto || "").split(/\n/).map(l => arreglarNumeros(l.replace(/[|_~=]+/g, " ").replace(/\s+/g, " ").trim())).filter(Boolean);
  const filas = []; let total = 0, subtotal = 0, eanPend = null, fin = false;
  for (const lOrig of lineas) {
    let l = lOrig;
    const n = normal(l);
    if (fin) continue;
    // pie del ticket: a partir de acá no hay más productos
    if (/transparencia|ley ?27|iva contenido|vuelto|su pago|gracias por/.test(n) && filas.some(f => f.tipo === "prod")) { if (!/total/.test(n)) fin = /gracias|transparencia|ley ?27/.test(n); }
    if (/\btotal\b/.test(n) && !/sub ?total|total (desc|ahorr|bonif|de art|items)|iva/.test(n)) {
      const m = l.match(RE_PRECIO_FIN); if (m) total = Math.max(total, parsePrecio(m[1])); filas.push({ tipo: "corte" }); continue;
    }
    if (/sub ?total/.test(n)) { const m = l.match(RE_PRECIO_FIN); if (m) subtotal = Math.max(subtotal, parsePrecio(m[1])); filas.push({ tipo: "corte" }); continue; }
    // código de barras solo en su renglón (Jumbo, Disco, Vea)
    const soloCod = l.match(/^\s*(\d{8}|\d{12,14})\s*$/);
    if (soloCod) { eanPend = soloCod[1]; continue; }
    // renglón de cantidad: "2 x 1.390,00", "2 UN x 1.390,00", "1,235 kg x 2.400,00 /kg", "2,000 x 1.100,00"
    const qc = l.match(RE_CANT);
    const letras = (l.replace(RE_CANT, "").replace(/\/?\s*\b(kgs?|un|u|unid|c\/u|x|precio|p\.?\s?unit)\b\.?/gi, "").match(/[a-zA-ZáéíóúñÑ]/g) || []).length;
    if (qc && letras < 3) {
      const cant = parseCant(qc[1]), kgMarca = /^k/i.test(qc[2] || "") || /^k/i.test(qc[4] || "");
      filas.push({ tipo: "cant", cant, precio: parsePrecio(qc[3]), kg: kgMarca || (cant % 1 !== 0 && /[.,]\d{3}$/.test(qc[1])), dec3: /[.,]\d{3}$/.test(qc[1]) });
      continue;
    }
    const mp = l.match(RE_PRECIO_FIN);
    if (!mp) continue;
    let importe = parsePrecio(mp[1]);
    let desc = l.slice(0, mp.index);
    // descuentos: se restan del producto de arriba
    if ((importe < 0 || DESCUENTO_INICIO.test(n) || (DESCUENTO.test(n) && /%|-\s*\$?\s*\d/.test(l))) && !/^\s*\d+\s*x/i.test(desc)) {
      const prev = [...filas].reverse().find(f => f.tipo === "prod" || f.tipo === "corte");
      importe = centRaros(Math.abs(importe));
      if (prev?.tipo === "prod" && Math.abs(importe) < prev.importe) prev.desc0 = prev.desc0 || prev.importe, prev.importe = Math.round((prev.importe - Math.abs(importe)) * 100) / 100;
      continue;
    }
    if (NO_PRODUCTO.test(n) || importe <= 0) { filas.push({ tipo: "corte" }); continue; }
    let q = null;
    // autoservicio: "2 LECHE ENTERA 1L  1.490,00  2.980,00" (cantidad adelante, precio unitario e importe)
    const dos = l.match(RE_DOS_PRECIOS);
    if (dos) {
      const pu = parsePrecio(dos[1]); let imp = parsePrecio(dos[2]);
      const lead = desc.match(/^\s*(\d+(?:[.,]\d{1,3})?)\s+(?=[A-Za-z])/);
      const c = lead ? parseCant(lead[1]) : pu > 0 ? imp / pu : 1;
      const pu0 = Math.floor(pu), alt = sinPrimerDigito(imp);
      if (pu > 0 && !cerca(imp, pu * c) && alt != null && (cerca(alt, pu * c) || cerca(alt, pu0 * c))) imp = alt;
      if (pu > 0 && (cerca(imp, pu * c) || cerca(imp, pu0 * c))) { q = { cant: c, precio: pu, kg: c % 1 !== 0 }; desc = l.slice(0, dos.index); if (lead) desc = desc.slice(lead[0].length); importe = imp; }
    }
    // cantidad en el mismo renglón: "LECHE 2 x 1.490,00  2.980,00"
    const mi = desc.match(/(\d+(?:[.,]\d{1,3})?)\s*(kgs?|k|un|u)?\s*[xX*]\s*\$?\s*([\d.,]+)\s*$/i);
    if (!q && mi) { q = { cant: parseCant(mi[1]), precio: parsePrecio(mi[3]), kg: /^k/i.test(mi[2] || "") || (parseCant(mi[1]) % 1 !== 0) }; desc = desc.slice(0, mi.index); }
    // código de barras o PLU al principio
    let ean = null;
    const cod = desc.match(/^\s*(\d{8}|\d{12,14})\b\s*/);
    if (cod) { ean = cod[1]; desc = desc.slice(cod[0].length); }
    else desc = desc.replace(/^\s*\d{4,7}\s+/, "");
    if (!ean && eanPend) ean = eanPend;
    eanPend = null;
    desc = desc.replace(/\(\s*\d+[.,]?\d*\s*%?\s*\)/g, " ").replace(/\s+\d{1,2}[.,]\d{2}\s*%?\s*$/, "").replace(/\s+\d{1,2}\s*%\s*$/, "").replace(/\.{2,}/g, " ").replace(/\$\s*$/, "").replace(/\s+/g, " ").trim();
    if ((desc.match(/[a-zA-ZáéíóúñÑ]/g) || []).length < 3) continue;
    filas.push({ tipo: "prod", desc, importe, q, ean });
  }
  // cada renglón de cantidad va con el producto de abajo (Coto, Día, Changomás) o el de arriba (Carrefour, La Anónima):
  // primero vemos cuál cuadra con cantidad × precio, y para los dudosos usamos el lado que más cuadró en este ticket
  const variantes = v => {
    const t = v.toFixed(v % 1 ? 3 : 2), out = new Set([v]);
    const pos = [...t].map((c, i) => "689".includes(c) ? i : -1).filter(i => i >= 0).slice(0, 4);
    for (let m = 1; m < 1 << pos.length; m++) { const a = [...t]; pos.forEach((p, b) => { if (m >> b & 1) a[p] = "0"; }); out.add(parseFloat(a.join(""))); }
    return [...out];
  };
  // los ceros del ticket (con raya o punto) se leen como 6, 8 o 9: probamos esas variantes
  const cuadraCon = (c, p) => {
    if (!p) return null;
    const esp = c.cant * c.precio;
    const justo = (a, b) => Math.abs(a - b) <= Math.max(0.02, b * 0.0005);
    for (const v of [p.importe, p.desc0]) if (v && justo(v, esp)) return { exacto: true };
    for (const cc of variantes(c.cant)) for (const pp of variantes(c.precio)) for (const ii of variantes(p.importe))
      if (justo(cc * pp, ii)) return { cant: cc, precio: pp, importe: ii };
    for (const v of [p.importe, p.desc0]) if (v && (cerca(v, esp) || (sinPrimerDigito(v) != null && cerca(sinPrimerDigito(v), esp)))) return { exacto: true };
    return null;
  };
  const libre = f => f?.tipo === "prod" && !f.q ? f : null;
  let abajo = 0, arriba = 0;
  const pend = [];
  for (let i = 0; i < filas.length; i++) {
    const c = filas[i]; if (c.tipo !== "cant") continue;
    const sig = libre(filas[i + 1]), ant = libre(filas[i - 1]);
    const ms = cuadraCon(c, sig), ma = cuadraCon(c, ant);
    const usar = (p, m) => { if (m && !m.exacto) { c.cant = m.cant; c.precio = m.precio; p.importe = m.importe; } p.q = c; };
    if (ms && !ma) { usar(sig, ms); abajo++; }
    else if (ma && !ms) { usar(ant, ma); arriba++; }
    else pend.push(i);
  }
  const cad = cadenaDe(texto);
  const haciaArriba = arriba > abajo || (arriba === abajo && ["Carrefour", "La Anónima"].includes(cad));
  for (const i of pend) {
    const c = filas[i], p = haciaArriba ? (libre(filas[i - 1]) || libre(filas[i + 1])) : (libre(filas[i + 1]) || libre(filas[i - 1]));
    if (p) p.q = c;
  }
  const res = [];
  for (const f of filas) if (f.tipo === "prod" && !(f.q && (f.q.kg || f.q.cant % 1))) { f.importe = centRaros(f.importe); if (f.q) f.q.precio = centRaros(f.q.precio); }
  for (const f of filas) {
    if (f.tipo !== "prod") continue;
    let { importe } = f, cant = 1, kg = false;
    if (f.q) {
      cant = f.q.cant;
      // "2,000 x" son 2 unidades; "0,765 x" o "1,000 x" de queso son kilos
      kg = f.q.kg || (f.q.dec3 && (cant % 1 !== 0 || PESABLE.test(normal(f.desc))));
      const esp = f.q.cant * f.q.precio, alt = sinPrimerDigito(importe), base = f.desc0 || importe;
      if (esp > 0 && !cerca(base, esp) && alt != null && cerca(alt, esp)) importe = Math.round(esp * 100) / 100;
    } else if (PESABLE.test(normal(f.desc)) && /\b(x ?kg|kg)\b/i.test(f.desc)) kg = true;
    res.push({ desc: f.desc, importe, cant: kg ? Math.round(cant * 1000) / 1000 : Math.max(1, Math.round(cant)), kg, ean: f.ean || null, _q: !!f.q, _ok: !!f.q && Math.abs(importe - f.q.cant * f.q.precio) <= Math.max(0.02, importe * 0.0005) });
  }
  // si la suma no da el total, buscamos uno o dos precios mal leídos (un dígito de más, o ceros leídos como 6/8/9) que lo expliquen
  // el total también puede tener los ceros mal leídos: si los centavos son "raros", los pasamos a ,00
  const cent = v => { const cc = String(Math.round(v * 100) % 100).padStart(2, "0"); return cc !== "00" && /^[0689]{2}$/.test(cc) && res.every(r => r.kg || Math.round(r.importe * 100) % 100 === 0) ? Math.floor(v) : v; };
  total = cent(total); subtotal = cent(subtotal);
  if (total && subtotal && !cerca(total, subtotal) && variantes(total).some(v => cerca(v, subtotal))) total = subtotal;
  const objetivo = total || subtotal;
  const suma = () => res.reduce((s, r) => s + r.importe, 0);
  const igual = (a, b) => Math.abs(a - b) < 0.5;
  if (objetivo > 0 && !igual(suma(), objetivo)) {
    const alt = res.map((r, i) => r._ok ? [] : [...variantes(r.importe).filter(v => v !== r.importe), sinPrimerDigito(r.importe)].filter(v => v != null && v > 0).map(v => [i, v]));
    const todos = alt.flat(), dif = suma() - objetivo;
    let listo = false;
    for (const [i, v] of todos) if (igual(res[i].importe - v, dif)) { res[i].importe = v; listo = true; break; }
    // varios precios con ceros mal leídos a la vez: buscamos la combinación que cierra con el total
    if (!listo && dif > 0) {
      let alc = new Map([[0, []]]);
      res.forEach((r, i) => {
        const nuevo = new Map(alc);
        for (const [, v] of alt[i]) { const d = Math.round((r.importe - v) * 100); if (d <= 0) continue;
          for (const [k, cam] of alc) { const t = k + d; if (t <= Math.round(dif * 100) + 50 && !nuevo.has(t) && nuevo.size < 40000) nuevo.set(t, [...cam, [i, v]]); } }
        alc = nuevo;
      });
      for (const [k, cam] of alc) if (Math.abs(k - dif * 100) < 50 && cam.length) { for (const [i, v] of cam) res[i].importe = v; listo = true; break; }
    }
    if (!listo) for (let x = 0; x < todos.length && !listo; x++) for (let y = x + 1; y < todos.length; y++) {
      const [i, a] = todos[x], [j, b] = todos[y];
      if (i !== j && igual(res[i].importe - a + res[j].importe - b, dif)) { res[i].importe = a; res[j].importe = b; listo = true; break; }
    }
  }
  if (objetivo > 0 && !cerca(suma(), objetivo)) {
    const cand = res.map((r, i) => [i, sinPrimerDigito(r.importe)]).filter(([i, a]) => a != null && !res[i]._q);
    const dif = suma() - objetivo;
    let hecho = false;
    for (const [i, a] of cand) if (Math.abs(res[i].importe - a - dif) < 0.5) { res[i].importe = a; hecho = true; break; }
    if (!hecho) for (let x = 0; x < cand.length && !hecho; x++) for (let y = x + 1; y < cand.length; y++) {
      const [i, a] = cand[x], [j, b] = cand[y];
      if (Math.abs(res[i].importe - a + res[j].importe - b - dif) < 0.5) { res[i].importe = a; res[j].importe = b; hecho = true; break; }
    }
  }
  return { renglones: res.map(({ _q, _ok, ...r }) => r), total: total || subtotal };
}

/* ---------- de qué súper es el ticket ---------- */
const CADENAS = [["Coto", /\bcoto\b/], ["Carrefour", /carrefour|\binc s ?a\b/], ["Día", /\bdia (argentina|%)|supermercados dia|\bdia s ?a\b/], ["Jumbo", /\bjumbo\b/], ["Disco", /\bdisco\b/], ["Vea", /\bvea\b/],
  ["Changomás", /chango ?mas|dorinka|walmart/], ["La Anónima", /la anonima|importadora y exportadora de la patagonia/], ["Cooperativa Obrera", /cooperativa obrera/], ["Toledo", /\btoledo\b/], ["Josimar", /josimar/], ["Makro", /\bmakro\b/], ["Vital", /\bvital\b/], ["Maxiconsumo", /maxiconsumo/]];
export function cadenaDe(texto) {
  const n = normal(String(texto || "").split("\n").slice(0, 12).join(" "));
  for (const [nom, rx] of CADENAS) if (rx.test(n)) return nom;
  return null;
}

/* ---------- diccionario (datos/tickets.json + datos/vocab.json) ---------- */
// abreviaturas de ticket que la base no alcanza a enseñar bien
const ABREV_FIJAS = {
  desc: "descremada", descr: "descremada", ent: "entera", sach: "sachet", lch: "leche", lech: "leche", yer: "yerba", yerb: "yerba", fid: "fideos", fide: "fideos",
  acei: "aceite", acte: "aceite", azuc: "azucar", har: "harina", harin: "harina", arv: "arvejas", tom: "tomate", pure: "pure", gall: "galletitas", gallet: "galletitas", galle: "galletitas", galletit: "galletitas",
  qso: "queso", ques: "queso", mant: "manteca", yog: "yogur", yogh: "yogur", dce: "dulce", ddl: "dulce de leche", merm: "mermelada", cerv: "cerveza", gaseo: "gaseosa", gas: "gaseosa", gseosa: "gaseosa",
  choc: "chocolate", jab: "jabon", pvo: "polvo", liq: "liquido", deterg: "detergente", detg: "detergente", det: "detergente", lavand: "lavandina", lavan: "lavandina", suav: "suavizante",
  sh: "shampoo", sham: "shampoo", shamp: "shampoo", acond: "acondicionador", acon: "acondicionador", desod: "desodorante", deo: "desodorante", pta: "pasta", dent: "dental",
  pap: "papel", hig: "higienico", serv: "servilletas", rlo: "rollo", coc: "cocina", bco: "blanco", nat: "natural", sab: "sabor", sabo: "sabor", frut: "frutilla", vain: "vainilla", dur: "durazno",
  mzna: "manzana", nja: "naranja", nar: "naranja", lim: "limon", trit: "triturado", grat: "gratinado", rall: "rallado", fresc: "fresco", cong: "congelado", hamb: "hamburguesa", milan: "milanesas", mila: "milanesas",
  salch: "salchichas", jam: "jamon", pech: "pechuga", carn: "carne", pic: "picada", alf: "alfajor", alfaj: "alfajor", cafe: "cafe", inst: "instantaneo", mol: "molido", tost: "tostado",
  edul: "edulcorante", aceit: "aceitunas", arr: "arroz", lent: "lentejas", poro: "porotos", gar: "garbanzos", cald: "caldo", cub: "cubos", vin: "vino", tto: "tinto", agu: "agua", min: "mineral",
};
const NO_ABREV = new Set("pan sal te mate gas mar sol uva ajo ron gel".split(" "));
const ENVASE = /\b(bot|botella|pet|paq|paquete|cja|caja|est|estuche|doy|doypack|pack|pck|pote|pot|sob|sobre|bsa|bolsa|lat|lata|brk|brick|tetra|fco|frasco|bli|blister|pvc|pza|hma|aer|aerosol|bandeja|band|s e|cu)\b/g;
const TAMANIO = /\b\d+([.,]\d+)?\s*(x\s*\d+\s*)?(kg|kgs|k|g|gr|grs|grm|l|lt|lts|ltr|ml|cc|cm3|u|un|uni|unid|unidades|mts|mt|m|saq|saquitos)\b\.?|\bx\s*\d+([.,]\d+)?\b|\b\d+\s*x\s*\d+\b/g;

export function armarDiccionario(tickets, vocab) {
  const dic = { cortos: new Map(), porInicio: new Map(), nombres: tickets?.nombres || [], abrev: { ...(tickets?.abrev || {}), ...ABREV_FIJAS }, palabras: new Map(), porLargo: new Map() };
  for (const [k, i] of Object.entries(tickets?.cortos || {})) {
    dic.cortos.set(k, i);
    const ini = k.slice(0, 3); (dic.porInicio.get(ini) || dic.porInicio.set(ini, []).get(ini)).push(k);
  }
  for (const [w, c] of vocab?.palabras || []) if (w.length >= 3) dic.palabras.set(w, c);
  for (const [w, c] of vocab?.marcas || []) for (const p of w.split(" ")) if (p.length >= 3 && !dic.palabras.has(p)) dic.palabras.set(p, c);
  for (const w of Object.values(dic.abrev)) for (const p of w.split(" ")) if (!dic.palabras.has(p)) dic.palabras.set(p, 50);
  for (const w of dic.palabras.keys()) { const k = w.length; (dic.porLargo.get(k) || dic.porLargo.set(k, []).get(k)).push(w); }
  return dic;
}

// distancia de edición acotada (para corregir una o dos letras mal leídas)
function dist(a, b, max = 2) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]; let min = i;
    for (let j = 1; j <= b.length; j++) { cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); if (cur[j] < min) min = cur[j]; }
    if (min > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}
// palabra leída con errores -> la palabra de producto más parecida y frecuente
function corregirPalabra(w, dic) {
  if (dic.palabras.has(w) || w.length < 4) return w;
  const ocr = w.replace(/0/g, "o").replace(/1/g, "i").replace(/5/g, "s").replace(/8/g, "b");
  if (dic.palabras.has(ocr)) return ocr;
  const max = w.length >= 7 ? 2 : 1;
  let mejor = null, md = max + 1, mf = 0;
  for (let L = w.length - max; L <= w.length + max; L++) for (const c of dic.porLargo.get(L) || []) {
    if (c[0] !== ocr[0] && c[1] !== ocr[1]) continue;
    const d = dist(ocr, c, max);
    const f = dic.palabras.get(c);
    if (d < md || (d === md && f > mf)) { mejor = c; md = d; mf = f; }
  }
  return mejor && md <= max && mf >= 5 ? mejor : w;
}
const bigr = s => { const t = ` ${s} `, r = []; for (let i = 0; i < t.length - 1; i++) r.push(t.slice(i, i + 2)); return r; };
function parecido(a, b) {
  const x = bigr(a), y = bigr(b); if (!x.length || !y.length) return 0;
  const m = new Map(); for (const g of y) m.set(g, (m.get(g) || 0) + 1);
  let comun = 0; for (const g of x) if (m.get(g) > 0) { comun++; m.set(g, m.get(g) - 1); }
  return 2 * comun / (x.length + y.length);
}
const MINUS = new Set("de del con sin y en a al para por o".split(" "));
export const capital = s => s.split(" ").filter(Boolean).map((w, i) => i && MINUS.has(w) ? w : w[0].toUpperCase() + w.slice(1)).join(" ");
// nombre para la despensa: sin tamaño ni envase ("Galletitas Kesitas Estuche 125 g" -> "Galletitas Kesitas")
export const nombreDespensa = s => capital(normal(s).replace(TAMANIO, " ").replace(ENVASE, " ").replace(/\b\d+\b/g, " ").replace(/\s+/g, " ").trim()).slice(0, 48);

// descripción del ticket -> { nombre, fuente: "ean" | "ticket" | "palabras" }
export function nombrar(desc, dic, eanDic, ean) {
  if (ean && eanDic) {
    const k = ean.replace(/^0+/, "").padStart(13, "0"), i = eanDic.ean?.[k];
    if (i != null) return { nombre: nombreDespensa(eanDic.nombres[i]), completo: eanDic.nombres[i], fuente: "ean" };
  }
  const base = normal(desc).replace(/\b(c|s|d|p)\s(?=[a-z])/g, (m, l) => ({ c: "con ", s: "sin ", d: "de ", p: "para " }[l]));
  if (dic) {
    const k = normal(desc);
    let i = dic.cortos.get(k);
    if (i == null && k.length >= 8) {
      // el lector pudo errar una o dos letras: buscamos la descripción de ticket más parecida
      let mejor = null, ms = 0;
      for (const c of dic.porInicio.get(k.slice(0, 3)) || []) { const p = parecido(k, c); if (p > ms) { ms = p; mejor = c; } }
      if (mejor && ms >= 0.86) i = dic.cortos.get(mejor);
    }
    if (i != null) return { nombre: nombreDespensa(dic.nombres[i]), completo: dic.nombres[i], fuente: "ticket" };
  }
  // palabra por palabra: corrige lo mal leído y completa abreviaturas
  const pal = base.replace(TAMANIO, " ").split(" ").filter(w => w && !/^\d+$/.test(w));
  const out = [];
  for (let w of pal) {
    if (dic) w = corregirPalabra(w, dic);
    const ab = !NO_ABREV.has(w) && (dic?.abrev || ABREV_FIJAS)[w];
    if (ab && !(dic?.palabras.get(w) > 200 && !ABREV_FIJAS[w])) w = ab;
    out.push(w);
  }
  const nom = nombreDespensa(out.join(" ")) || capital(normal(desc));
  return { nombre: nom, completo: nom, fuente: "palabras" };
}
