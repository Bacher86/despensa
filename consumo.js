// Cuánto consume una casa argentina de cada cosa, según quiénes viven en ella.
// Kai lo usa desde el primer día, antes de haber aprendido el ritmo propio de la casa, y lo va reemplazando
// por lo aprendido a medida que se compra y se usa.
//
// Fuentes:
//  · INDEC, Canasta Básica Alimentaria (composición mensual por adulto equivalente, región GBA) y la tabla de
//    unidades de adulto equivalente por edad y sexo (necesidades energéticas).
//  · Bolsa de Comercio de Rosario: yerba mate, 6,1 kg por habitante por año (2023).
//  · CAPIA, Informe Productivo 2025: 398 huevos por habitante por año (incluye uso industrial).
//  · Kantar (citado por Forbes Argentina): 98 rollos de papel higiénico por hogar por año.
//  · El resto (limpieza, higiene, pañales) son estimaciones de uso típico, marcadas como tales.

// Quiénes viven en la casa. Peso = adulto equivalente promedio de varones y mujeres (INDEC).
export const GRUPOS = [
  ["adultos", "Adultos", "18 a 60 años", 0.88, "adulto"],
  ["mayores", "Mayores", "más de 60", 0.72, "mayor"],
  ["adolescentes", "Adolescentes", "13 a 17", 0.88, "adolescente"],
  ["chicos", "Chicos", "4 a 12", 0.66, "chico"],
  ["bebes", "Bebés", "0 a 3", 0.42, "bebé"],
];
// para casas que eligieron el tipo antes de que existiera esta pregunta
const POR_TIPO = { solo: { adultos: 1 }, pareja: { adultos: 2 }, familia: { adultos: 2, chicos: 2 }, compartida: { adultos: 3 } };

export function hogarDe(config = {}) {
  const h = config.hogar && typeof config.hogar === "object" ? config.hogar : POR_TIPO[config.tipoCasa];
  if (!h) return null;
  const out = {}; let n = 0;
  for (const [k] of GRUPOS) { out[k] = Math.max(0, Math.min(15, Math.round(Number(h[k]) || 0))); n += out[k]; }
  return n ? out : null;
}
export const personas = h => h ? GRUPOS.reduce((s, [k]) => s + (h[k] || 0), 0) : 0;
export const adultoEq = h => h ? GRUPOS.reduce((s, [k, , , p]) => s + (h[k] || 0) * p, 0) : 0;
const adultosQueToman = h => (h.adultos || 0) + (h.mayores || 0) + 0.5 * (h.adolescentes || 0);
const conPelo = h => (h.adultos || 0) + (h.mayores || 0) + (h.adolescentes || 0) + 0.5 * (h.chicos || 0);
export function textoHogar(h) {
  if (!h) return "";
  const p = GRUPOS.filter(([k]) => h[k]).map(([k, t, , , uno]) => `${h[k]} ${h[k] === 1 ? uno : t.toLowerCase()}`);
  return p.length > 1 ? p.slice(0, -1).join(", ") + " y " + p[p.length - 1] : p[0] || "";
}

// por: "ae" = por adulto equivalente · "adulto" = solo adultos (y medio adolescente) · "persona" · "pelo" (shampoo)
//      "bebe" = por bebé · "casa" = fijo por casa + "mas" por persona
// mes: cantidad por mes en la unidad base (kg, L, u, rollo, saq) · env: envase típico en esa unidad · paq: unidades por paquete
const B = (id, rx, por, mes, base, env, extra = {}) => ({ id, rx, por, mes, base, env, ...extra });
export const BASE = [
  // panadería y almacén (INDEC, CBA GBA)
  B("pan_lactal", /\bpan (lactal|de molde|blanco|integral)\b/, "ae", 0.6, "kg", 0.55, { est: true }),
  B("pan_rallado", /\bpan rallado|rebozador\b/, "ae", 0.1, "kg", 0.5, { est: true }),
  B("pan", /^pan(es)?\b(?! (dulce|de pancho|de hamburguesa|rallado))|\bfrances|\bflautita|\bmignon/, "ae", 4.5, "kg", 1, { nota: "CBA: 6,75 kg; las casas de ingresos medios compran menos pan" }),
  B("galletitas_agua", /\bgalletit\w* (de )?agua|crackers?|criollitas|express|traviata|\bclub social/, "ae", 0.42, "kg", 0.3),
  B("galletitas", /\bgalletit|\bvainillas\b|\bbizcochitos?\b/, "ae", 0.63, "kg", 0.3),
  B("arroz", /\barroz\b(?! con leche)/, "ae", 1.2, "kg", 1),
  B("harina_maiz", /\bpolenta|harina de maiz/, "ae", 0.21, "kg", 0.5),
  B("harina", /\bharina\b/, "ae", 1.08, "kg", 1),
  B("fideos", /\bfideos?\b|spaghetti|tallarin|mostachol|tirabuzon|monito|codito|mo[nñ]ito|penne|\bmo[nñ]os\b/, "ae", 1.74, "kg", 0.5),
  B("azucar", /\bazucar\b/, "ae", 1.23, "kg", 1),
  B("dulce_leche", /\bdulce de leche\b/, "ae", 0.2, "kg", 0.4, { est: true }),
  B("mermelada", /\bmermelada|\bdulce de (membrillo|batata)/, "ae", 0.13, "kg", 0.4, { est: true }),
  B("legumbres", /\blentejas?\b|\bporotos?\b|\bgarbanzos?\b|\barvejas secas/, "ae", 0.24, "kg", 0.4),
  B("tomate_envasado", /\bpure de tomate|tomate (triturado|perita en lata|en lata)|\bpulpa de tomate|\bsalsa de tomate|\bfiletto/, "ae", 0.5, "kg", 0.52, { est: true }),
  B("aceite", /\baceite\b(?! de (oliva|coco))/, "ae", 1.2, "L", 1),
  B("aceite_oliva", /\baceite de oliva/, "ae", 0.1, "L", 0.5, { est: true }),
  B("mayonesa", /\bmayonesa|\bkétchup|\bketchup|\bmostaza/, "ae", 0.08, "kg", 0.25),
  B("sal", /^sal\b|\bsal (fina|gruesa|entrefina)/, "ae", 0.12, "kg", 0.5),
  B("vinagre", /\bvinagre\b/, "ae", 0.06, "L", 0.5),
  B("caldo", /\bcaldo\b/, "ae", 3, "u", 1, { paq: 12, est: true }),
  // verdulería (INDEC: hortalizas 5,73 kg y frutas 4,95 kg por mes, repartidas como la CBA)
  B("papa", /^papas?\b(?! fritas)|\bpapa (negra|blanca)/, "ae", 4.5, "kg", 1, { nota: "CBA: 6,51 kg" }),
  B("batata", /\bbatatas?\b/, "ae", 0.51, "kg", 1),
  B("cebolla", /\bcebollas?\b(?! de verdeo)/, "ae", 0.8, "kg", 1),
  B("tomate", /\btomates?\b/, "ae", 1.0, "kg", 1),
  B("zanahoria", /\bzanahorias?\b/, "ae", 0.62, "kg", 1),
  B("lechuga", /\blechugas?\b/, "ae", 0.62, "kg", 0.35),
  B("zapallo", /\bzapall/, "ae", 1.24, "kg", 1),
  B("morron", /\bmorron|\bpimiento/, "ae", 0.3, "kg", 0.25),
  B("acelga", /\bacelga|\bespinaca/, "ae", 0.78, "kg", 0.5),
  B("manzana", /\bmanzanas?\b/, "ae", 1.24, "kg", 1),
  B("naranja", /\bnaranjas?\b(?! jugo)/, "ae", 1.24, "kg", 1),
  B("mandarina", /\bmandarinas?\b/, "ae", 0.62, "kg", 1),
  B("banana", /\bbananas?\b/, "ae", 0.93, "kg", 1),
  B("pera", /\bperas?\b/, "ae", 0.31, "kg", 1),
  B("limon", /\blimon(es)?\b/, "ae", 0.3, "kg", 0.12),
  // carnes (INDEC: carnes 6,27 kg por mes; reparto como la CBA de Tucumán)
  B("carne_picada", /\bcarne picada|\bpicada\b/, "ae", 0.93, "kg", 1),
  B("pollo", /\bpollo|\bpechuga|\bsuprema|\bpata muslo/, "ae", 2.17, "kg", 1),
  B("milanesas", /\bmilanesas?\b/, "ae", 0.8, "kg", 1, { est: true }),
  B("cerdo", /\bcerdo|\bbondiola|\bcarre\b|\bcostilla de cerdo/, "ae", 0.4, "kg", 1),
  B("pescado", /\bmerluza|\bpescado|\bfilet\b|\bsalmon|\batun\b|\bcaballa|\bsardina/, "ae", 0.3, "kg", 0.17, { est: true }),
  B("carne", /\bcarne\b|\basado\b|\bvacio\b|\bnalga\b|\bcuadril|\bbola de lomo|\bbife|\bosobuco|\bpaleta\b|\broast ?beef|\bmatambre/, "ae", 3.0, "kg", 1),
  B("fiambre", /\bjamon|\bsalame|\bsalamin|\bmortadela|\bfiambre|\bpaleta cocida|\bquesoy?\s?jamon/, "ae", 0.25, "kg", 0.2, { est: true }),
  B("salchichas", /\bsalchichas?\b|\bhamburguesas?\b/, "ae", 0.25, "kg", 0.2, { est: true }),
  // lácteos y huevos
  B("huevos", /\bhuevos?\b(?! de pascua)/, "ae", 18, "u", 1, { paq: 12 }),
  B("leche", /\bleche\b(?! (en polvo|condensada|de coco|de almendra|chocolatada))|\bleche descremada|\bleche entera/, "ae", 4.0, "L", 1),
  B("leche_polvo", /\bleche en polvo/, "ae", 0.4, "kg", 0.8),
  B("queso_rallado", /\bqueso rallado|\breggianito rallado/, "ae", 0.06, "kg", 0.15),
  B("queso_crema", /\bqueso (crema|blanco|untable)|\bcasancrem|\bmendicrim/, "ae", 0.15, "kg", 0.29, { est: true }),
  B("queso", /\bqueso|\bmuzzarella|\bmozzarella|\bcremoso|\bpategras|\breggianito|\bsardo|\bprovoleta/, "ae", 0.33, "kg", 0.5),
  B("yogur", /\byogh?urt?\b/, "ae", 0.57, "kg", 0.19),
  B("manteca", /\bmanteca\b(?! de mani)|\bmargarina/, "ae", 0.08, "kg", 0.2),
  B("crema", /\bcrema de leche|\bcrema\b(?! (dental|de manos|corporal|facial|de enjuague))/, "ae", 0.1, "L", 0.2, { est: true }),
  // bebidas e infusiones
  B("yerba", /\byerba\b/, "adulto", 0.7, "kg", 0.5),
  B("cafe", /\bcafe\b(?! con leche lista)/, "adulto", 0.1, "kg", 0.25, { est: true }),
  B("te", /^te\b|\bte (negro|verde|en saquitos|de )|\bsaquitos|\bmate cocido/, "adulto", 20, "saq", 25, { paq: 25, est: true }),
  B("gaseosa", /\bgaseosa|\bcoca ?cola|\bpepsi|\bsprite|\bfanta|\b7 ?up|\bsoda\b|\bjugo\b|\bagua saborizada/, "ae", 3.45, "L", 2.25),
  B("cerveza", /\bcerveza/, "adulto", 0.7, "L", 1),
  B("vino", /\bvino\b/, "adulto", 0.4, "L", 0.75),
  B("cacao", /\bcacao|\bnesquik|\bchocolatada en polvo|\btoddy/, "ae", 0.12, "kg", 0.36, { est: true }),
  // higiene (estimaciones salvo papel higiénico: Kantar, 98 rollos por hogar por año / 2,8 personas por hogar)
  B("papel_higienico", /\bpapel higienico/, "persona", 2.9, "rollo", 1, { paq: 4 }),
  B("pasta_dental", /\bpasta dental|\bcrema dental|\bdentifrico/, "persona", 0.075, "kg", 0.09, { est: true }),
  B("jabon_tocador", /\bjabon\b(?!.*(ropa|polvo|liquido para ropa|lavarropas|en polvo))|\bjabon de tocador/, "persona", 1, "u", 1, { paq: 3, est: true }),
  B("shampoo", /\bshampoo|\bchampu/, "pelo", 0.2, "L", 0.4, { est: true }),
  B("acondicionador", /\bacondicionador|\bcrema de enjuague/, "pelo", 0.15, "L", 0.4, { est: true }),
  B("desodorante", /\bdesodorante|\bantitranspirante/, "pelo", 0.8, "u", 1, { est: true }),
  B("panales", /\bpa[nñ]ales/, "bebe", 150, "u", 1, { paq: 50, est: true }),
  B("toallitas", /\btoallitas humedas|\btoallitas para bebe/, "bebe", 90, "u", 1, { paq: 50, est: true }),
  // limpieza (estimación: fijo por casa + un poco por persona)
  B("detergente", /\bdetergente|\blavavajillas?/, "casa", 0.3, "L", 0.5, { mas: 0.1, est: true }),
  B("lavandina", /\blavandina|\bagua jane/, "casa", 0.5, "L", 1, { mas: 0.25, est: true }),
  B("jabon_ropa", /\bjabon (para (la )?)?ropa|\bjabon en polvo|\bjabon liquido|\blavarropas|\bskip\b|\bala\b|\bace\b/, "casa", 0.5, "L", 3, { mas: 0.5, est: true }),
  B("suavizante", /\bsuavizante/, "casa", 0.3, "L", 1, { mas: 0.3, est: true }),
  B("rollo_cocina", /\brollo de cocina|\bpapel de cocina|\brollo cocina/, "casa", 1, "rollo", 1, { mas: 0.5, paq: 3, est: true }),
  B("bolsas_residuos", /\bbolsas? (de )?(residuos|basura|consorcio)/, "casa", 15, "u", 1, { mas: 8, paq: 10, est: true }),
  B("servilletas", /\bservilletas/, "casa", 20, "u", 1, { mas: 15, paq: 50, est: true }),
];

const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 .,]/g, " ").replace(/\s+/g, " ").trim();
export const baseDe = nombre => { const n = norm(nombre); return BASE.find(b => b.rx.test(n)) || null; };

const MASA = { kg: 1, kilo: 1, kilos: 1, g: 0.001, gr: 0.001, grs: 0.001, gramos: 0.001 };
const VOL = { l: 1, lt: 1, lts: 1, litro: 1, litros: 1, ml: 0.001, cc: 0.001, cm3: 0.001 };
// tamaño escrito en el nombre: "Yerba Playadito 1 kg", "Leche 1,5 L", "Galletitas x 300 g"
function tamanio(nombre) {
  const m = norm(nombre).match(/(\d+(?:[.,]\d+)?)\s*(kg|kilos?|g|gr|grs|gramos|l|lt|lts|litros?|ml|cc|cm3)\b/);
  if (!m) return null;
  const v = parseFloat(m[1].replace(",", ".")), u = m[2];
  return MASA[u] ? { v: v * MASA[u], t: "kg" } : { v: v * VOL[u], t: "L" };
}

// consumo de la casa por día, en la unidad del producto (0 si no hay dato)
export function tasaBase(it, h) {
  if (!h || !it) return 0;
  const b = baseDe(it.nombre); if (!b) return 0;
  const f = { ae: adultoEq(h), adulto: adultosQueToman(h), persona: personas(h), pelo: conPelo(h), bebe: h.bebes || 0, casa: 1 }[b.por];
  let mes = b.mes * f + (b.por === "casa" ? (b.mas || 0) * personas(h) : 0);
  if (!mes) return 0;
  mes *= 0.85;   // un poco por debajo: mejor avisar un día tarde que vaciar la despensa en los cálculos
  const u = norm(it.unidad), fis = b.base === "kg" || b.base === "L";
  let enUnidad;
  if (MASA[u] && fis) enUnidad = mes / MASA[u];                 // kg o g (volumen y peso, 1 a 1)
  else if (VOL[u] && fis) enUnidad = mes / VOL[u];
  else if (fis) { const t = tamanio(it.nombre); enUnidad = mes / (t?.v || b.env); }   // por envase
  else if (/^(u|un|unidad|unidades|rollo|rollos|saquito|saquitos|saq)$/.test(u) || (u === "" && !b.paq)) enUnidad = mes;
  else enUnidad = mes / (b.paq || 1);                             // paquete, caja, maple, docena
  if (/^docenas?$/.test(u)) enUnidad = mes / 12;
  return enUnidad / 30;
}
