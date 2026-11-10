// Kai dentro de la app de Android (Capacitor). En el navegador / PWA no hace nada.
// Anuncios (AdMob): pantalla completa al abrir, banner fijo abajo y recompensados opcionales.
// También: login de Google nativo (Google no deja loguearse dentro de una app web) y avisos nativos.
const Cap = window.Capacitor;
export const esApp = !!Cap?.isNativePlatform?.();
const P = n => Cap?.Plugins?.[n];

// Bloques de anuncios. Ahora son los de PRUEBA de Google: cuando esté la cuenta de AdMob, poner los reales y prueba:false.
export const ADS = {
  prueba: true,
  banner: "ca-app-pub-3940256099942544/9214589741",
  apertura: "ca-app-pub-3940256099942544/9257395921",
  premio: "ca-app-pub-3940256099942544/5224354917",
};
const CADA = 4 * 3600e3;          // anuncio al abrir: como mucho cada 4 horas
const DIAS_SIN = 2;               // los primeros 2 días de uso, sin anuncio al abrir
const FONDO_MIN = 30 * 60e3;      // al volver a la app después de 30 min, cuenta como "abrir"

const lsG = (k, d = "") => { try { return localStorage.getItem("app:" + k) ?? d; } catch { return d; } };
const lsS = (k, v) => { try { localStorage.setItem("app:" + k, String(v)); } catch {} };

let listo = null, chico = null, bannerOn = false, tapado = false, deAviso = false, abriendo = false, alAvisoCb = null, enFondoDesde = 0;
const q = new URLSearchParams(location.search);
if (q.get("accion") || q.get("tab") || q.get("voz") || q.get("compartido")) deAviso = true;
if (esApp) {
  document.documentElement.classList.add("es-app");
  if (!lsG("primer")) lsS("primer", Date.now());
}

async function iniciar() {
  if (!esApp) return false;
  if (listo) return listo;
  listo = (async () => {
    const A = P("AdMob"); if (!A) return false;
    try { await A.initialize({ initializeForTesting: ADS.prueba }); } catch (e) { console.warn("AdMob:", e?.message || e); return false; }
    try {
      const c = await A.requestConsentInfo();
      if (c?.isConsentFormAvailable && c.status === "REQUIRED") await A.showConsentForm();
    } catch {}
    A.addListener("bannerAdSizeChanged", s => {
      const h = Math.round(s?.height || 0);
      if (tapado && !h) return;   // lo tapó un anuncio de un local: el lugar queda reservado
      document.documentElement.style.setProperty("--ad-h", h ? h + 4 + "px" : "0px");
      document.documentElement.classList.toggle("con-banner", h > 0);
    });
    A.addListener("appOpenAdClosed", () => { abriendo = false; });
    A.addListener("appOpenAdFailedToShow", () => { abriendo = false; });
    // volver a la app = "abrir" (si estuvo un rato afuera)
    P("App")?.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) { enFondoDesde = Date.now(); return; }
      if (enFondoDesde && Date.now() - enFondoDesde > FONDO_MIN) { deAviso = false; setTimeout(anuncioAlAbrir, 900); }
      enFondoDesde = 0;
    });
    return true;
  })();
  return listo;
}

// Lo llama la app cuando ya sabe si el usuario está en modo chico (al cargar los miembros y cada vez que cambia).
export async function setChico(c) {
  if (!esApp) return;
  const primera = chico === null; chico = !!c;
  if (!(await iniciar())) return;
  if (chico) { quitarBanner(); return; }
  mostrarBanner();
  if (primera) setTimeout(anuncioAlAbrir, 1200);
}

async function mostrarBanner() {
  if (bannerOn || chico) return; bannerOn = true;
  try { await P("AdMob").showBanner({ adId: ADS.banner, adSize: "ADAPTIVE_BANNER", position: "BOTTOM_CENTER", margin: 0, isTesting: ADS.prueba }); }
  catch (e) { bannerOn = false; console.warn("Banner:", e?.message || e); }
}
async function quitarBanner() {
  if (!bannerOn) return; bannerOn = false; tapado = false;
  try { await P("AdMob").removeBanner(); } catch {}
  document.documentElement.style.setProperty("--ad-h", "0px"); document.documentElement.classList.remove("con-banner");
}

// Intercalar con los anuncios de los locales: mientras se ve uno, el banner de Google se esconde y el local ocupa su lugar.
export const hayBanner = () => esApp && bannerOn && document.documentElement.classList.contains("con-banner");
export async function tapaBanner(on) {
  if (!bannerOn || tapado === !!on) return; tapado = !!on;
  try { await (on ? P("AdMob").hideBanner() : P("AdMob").resumeBanner()); } catch {}
}

function puedeAbrir() {
  if (chico !== false || deAviso || abriendo || document.hidden) return false;
  if (Date.now() - Number(lsG("primer", Date.now())) < DIAS_SIN * 864e5) return false;
  return Date.now() - Number(lsG("ultApertura", 0)) >= CADA;
}
async function anuncioAlAbrir() {
  if (!puedeAbrir() || !(await iniciar())) return;
  const A = P("AdMob"); abriendo = true;
  try {
    await A.loadAppOpen({ adId: ADS.apertura });
    if (!puedeAbrirSinBloqueo()) { abriendo = false; return; }
    lsS("ultApertura", Date.now());
    await A.showAppOpen();
  } catch (e) { abriendo = false; console.warn("Anuncio al abrir:", e?.message || e); }
}
const puedeAbrirSinBloqueo = () => chico === false && !deAviso && !document.hidden;

// Recompensado: "mirá un video corto y ...". Devuelve true si lo vio (o si no hay anuncio: nunca bloquea al usuario).
export async function verConPremio() {
  if (!esApp || chico || !(await iniciar())) return true;
  const A = P("AdMob");
  try {
    await A.prepareRewardVideoAd({ adId: ADS.premio, isTesting: ADS.prueba });
    const r = await A.showRewardVideoAd();
    return !!r;
  } catch (e) { console.warn("Recompensado:", e?.message || e); return true; }
}

// ---------- login de Google nativo ----------
export async function googleNativo() {
  const F = P("FirebaseAuthentication"); if (!F) throw new Error("Falta el login nativo");
  const r = await F.signInWithGoogle({ skipNativeAuth: true });
  const id = r?.credential?.idToken; if (!id) throw Object.assign(new Error("Cancelado"), { code: "auth/popup-closed-by-user" });
  return id;
}
export async function salirNativo() { try { await P("FirebaseAuthentication")?.signOut(); } catch {} }

// ---------- avisos nativos ----------
export async function permisoAvisos() {
  const M = P("FirebaseMessaging"); if (!M) return "denied";
  try { const r = await M.requestPermissions(); return r?.receive === "granted" ? "granted" : "denied"; } catch { return "denied"; }
}
export async function estadoAvisos() {
  const M = P("FirebaseMessaging"); if (!M) return "denied";
  try { const r = await M.checkPermissions(); return r?.receive === "granted" ? "granted" : r?.receive === "denied" ? "denied" : "default"; } catch { return "default"; }
}
export async function tokenAvisos() {
  const M = P("FirebaseMessaging"); if (!M) return null;
  try {
    await M.createChannel({ id: "avisos", name: "Avisos de Kai", description: "Lo que se termina, la pregunta del día y el resumen", importance: 4, visibility: 1 }).catch(() => {});
    const { token } = await M.getToken(); return token || null;
  } catch (e) { console.warn("Token de avisos:", e?.message || e); return null; }
}
// tocar un aviso con la app cerrada o abierta: no mostrar anuncio y llevar a lo que corresponde
export function alAviso(cb) {
  alAvisoCb = cb;
  if (!esApp) return;
  P("FirebaseMessaging")?.addListener("notificationActionPerformed", ev => {
    deAviso = true;
    const d = ev?.notification?.data || {};
    alAvisoCb?.(d);
  });
}
