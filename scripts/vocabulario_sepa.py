#!/usr/bin/env python3
"""
Vocabulario de productos para leer tickets.

Baja la base SEPA (Precios Claros: todos los productos que cada supermercado del país informa, con su
descripción, marca y código de barras) y arma:
  datos/vocab.json  palabras y marcas más frecuentes (para corregir lo que la cámara lee mal y
                    completar abreviaturas del ticket: "GALLET" -> "galletitas")
  datos/ean.json    código de barras -> nombre del producto (algunos tickets imprimen el código)
  /tmp/muestras.txt ejemplos de descripciones por cadena (para estudiar cómo abrevia cada una)
Lo corre a mano .github/workflows/vocabulario.yml. Solo usa la biblioteca estándar.
"""
import collections, csv, io, json, os, random, re, shutil, subprocess, sys, time, unicodedata, urllib.request, zipfile
from datetime import date

CKAN = "https://datos.produccion.gob.ar/api/3/action/package_show?id=sepa-precios"
# El portal rechaza (403) los pedidos que no parecen de un navegador, así que nos presentamos como uno.
UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Accept": "text/html,application/json,application/zip,application/xhtml+xml,*/*;q=0.8",
    "Accept-Language": "es-AR,es;q=0.9",
    "Referer": "https://datos.produccion.gob.ar/dataset/sepa-precios",
}
CKAN_ALT = "https://datos.produccion.gob.ar/api/action/package_show?id=sepa-precios"

def normal(s):
    s = unicodedata.normalize("NFD", str(s or "")).encode("ascii", "ignore").decode().lower()
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 .,]", " ", s)).strip()


def log(*a):
    print(time.strftime("%H:%M:%S"), *a, flush=True)


def fallar(msg):
    """Muestra el motivo en el resumen de GitHub (Annotations) y corta."""
    print(f"::error::{msg}", flush=True)
    raise SystemExit(1)


def con_curl(url, destino=None):
    """Plan B: algunos portales aceptan curl aunque rechacen a Python."""
    if not shutil.which("curl"):
        return None
    cmd = ["curl", "-sSL", "--fail", "--retry", "3", "--retry-delay", "10", "--max-time", "1800", "-A", UA["User-Agent"],
           "-H", f"Accept: {UA['Accept']}", "-H", f"Accept-Language: {UA['Accept-Language']}", "-e", UA["Referer"], url]
    if destino:
        cmd[1:1] = ["-o", destino]
    r = subprocess.run(cmd, capture_output=True, timeout=1900)
    if r.returncode != 0:
        log(f"  curl tampoco pudo: {r.stderr.decode(errors='replace').strip()[:200]}")
        return None
    return destino if destino else r.stdout


def bajar(url, destino=None, intentos=3, obligatorio=True):
    ultimo = None
    for i in range(intentos):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=120) as r:
                if not destino:
                    return r.read()
                with open(destino, "wb") as f:
                    while True:
                        b = r.read(1 << 20)
                        if not b:
                            break
                        f.write(b)
                return destino
        except Exception as e:
            log(f"  intento {i + 1} de {intentos} falló: {e}")
            ultimo = e
            time.sleep(8 * (i + 1))
    log("  pruebo con curl…")
    r = con_curl(url, destino)
    if r is not None:
        return r
    if not obligatorio:
        return None
    fallar(f"El portal de datos abiertos no deja bajar {url} ({ultimo}). Puede estar bloqueando a GitHub o caído: volvé a correrlo más tarde y, si sigue, avisá.")


DIAS_ES = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]


def ultimo_zip():
    """Busca el zip del día: primero por la API del portal; si falla, en la página del dataset."""
    recursos = []
    for api in (CKAN, CKAN_ALT):
        crudo = bajar(api, intentos=2, obligatorio=False)
        if not crudo:
            continue
        try:
            datos = json.loads(crudo)
            recursos = [dict(nombre=x.get("name") or "", url=x.get("url") or "", fecha=x.get("last_modified") or x.get("metadata_modified") or x.get("created") or "")
                        for x in datos["result"]["resources"]
                        if (x.get("format") or "").lower() == "zip" or str(x.get("url", "")).lower().endswith(".zip")]
            log(f"API del portal: {len(recursos)} archivos zip")
            break
        except Exception as e:
            log(f"Respuesta rara de la API ({e}): {crudo[:150]!r}")
    if not recursos:
        log("Pruebo con la página del dataset")
        crudo = bajar("https://datos.produccion.gob.ar/dataset/sepa-precios", intentos=2, obligatorio=False)
        if not crudo:
            return None
        html = crudo.decode("utf-8", "replace")
        urls = sorted(set(re.findall(r'href="([^"]+\.zip)"', html)))
        recursos = [dict(nombre=os.path.basename(u), url=u if u.startswith("http") else "https://datos.produccion.gob.ar" + u, fecha="") for u in urls]
        log(f"Página del dataset: {len(recursos)} archivos zip")
    if not recursos:
        log("No encontré el archivo de precios en el portal de datos abiertos.")
        return None
    for r in recursos[:10]:
        log(f"  · {r['nombre']} {r['fecha']}")
    hoy = DIAS_ES[date.today().weekday()]
    del_dia = [r for r in recursos if hoy in normal(r["nombre"] + " " + r["url"])]
    elegido = sorted(del_dia or recursos, key=lambda r: r["fecha"], reverse=True)[0]
    log(f"Uso: {elegido['nombre']} ({elegido['fecha'] or 'sin fecha'})")
    return elegido["url"]


def leer_csv(z, nombre):
    """Lee un CSV de SEPA renglón por renglón, sin importar el separador ni la codificación."""
    with z.open(nombre) as f:
        muestra = f.read(1 << 16)
    try:
        muestra.decode("utf-8")
        enc = "utf-8-sig"
    except UnicodeDecodeError as e:
        enc = "utf-8-sig" if e.start > len(muestra) - 4 else "latin-1"
    primera = muestra.split(b"\n", 1)[0].decode(enc, "replace")
    sep = max(["|", ";", ",", "\t"], key=primera.count)
    texto = io.TextIOWrapper(z.open(nombre), encoding=enc, errors="replace", newline="")
    lector = csv.reader(texto, delimiter=sep)
    cab = [normal(c).replace(" ", "_") for c in next(lector, [])]
    return cab, lector


def col(cab, *opciones):
    for o in opciones:
        for i, c in enumerate(cab):
            if c == o:
                return i
    for o in opciones:
        for i, c in enumerate(cab):
            if o in c:
                return i
    return None


def num(s):
    s = str(s or "").strip().replace("$", "")
    if not s:
        return 0.0
    if "," in s and "." in s:
        s = s.replace(".", "").replace(",", ".") if s.rfind(",") > s.rfind(".") else s.replace(",", "")
    elif "," in s:
        s = s.replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return 0.0



UNI = {"kg": "kg", "kgs": "kg", "k": "kg", "gr": "g", "grs": "g", "grm": "g", "g": "g", "lt": "L", "lts": "L", "l": "L", "litro": "L",
       "ml": "ml", "cc": "ml", "cm3": "ml", "un": "u", "u": "u", "uni": "u", "unid": "u", "mt": "m", "mts": "m", "m": "m"}
MINUS = {"de", "del", "la", "el", "los", "las", "con", "sin", "y", "en", "a", "x", "al", "para", "por"}

def nombre_lindo(desc, marca):
    d = re.sub(r"\s+", " ", str(desc or "")).strip()
    if d.isupper() or d.islower():
        d = " ".join(w.lower() if (i and w.lower() in MINUS) else (w.upper() if re.fullmatch(r"\d+\w{0,3}", w) and not w.isdigit() and len(w) <= 4 and False else w.capitalize()) for i, w in enumerate(d.split(" ")))
    d = re.sub(r"\b(\d+(?:[.,]\d+)?)\s*(Gr|Grs|Gr\.|G)\b", r"\1 g", d, flags=re.I)
    d = re.sub(r"\b(\d+(?:[.,]\d+)?)\s*(Kg|Kgs|K)\b", r"\1 kg", d, flags=re.I)
    d = re.sub(r"\b(\d+(?:[.,]\d+)?)\s*(Lt|Lts|L|Ltr)\b", r"\1 L", d, flags=re.I)
    d = re.sub(r"\b(\d+(?:[.,]\d+)?)\s*(Ml|Cc|Cm3)\b", r"\1 ml", d, flags=re.I)
    return d[:60]

def main():
    zp = sys.argv[1] if len(sys.argv) > 1 else None
    if not zp:
        url = ultimo_zip()
        if not url: fallar("No encontré la base SEPA")
        log(f"Bajando {url}")
        zp = bajar(url, "/tmp/sepa.zip")
        log(f"Bajado: {os.path.getsize(zp) / 1e6:.0f} MB")
    palabras = collections.Counter(); marcas = collections.Counter()
    ean_nom = {}; ean_com = collections.defaultdict(set)
    muestras = collections.defaultdict(list); vistos = set()
    st = collections.Counter()

    def zip_interno(z, nombre=""):
        nombres = z.namelist()
        csvs = {os.path.basename(n).lower(): n for n in nombres if n.lower().endswith(".csv")}
        if "productos.csv" in csvs:
            st["zips"] += 1
            bandera = {}
            if "comercio.csv" in csvs:
                try:
                    cab, lec = leer_csv(z, csvs["comercio.csv"])
                    ic, ib, inom = col(cab, "id_comercio"), col(cab, "id_bandera"), col(cab, "comercio_bandera_nombre", "bandera_nombre", "bandera")
                    for f in lec:
                        if f and inom is not None and inom < len(f): bandera[(f[ic] if ic is not None else "", f[ib] if ib is not None else "")] = f[inom].strip()
                except Exception as e: log("  comercio.csv raro:", e)
            cab, lec = leer_csv(z, csvs["productos.csv"])
            ix = dict(com=col(cab, "id_comercio"), ban=col(cab, "id_bandera"), ean=col(cab, "id_producto"),
                      desc=col(cab, "productos_descripcion", "descripcion"), marca=col(cab, "productos_marca", "marca"))
            if ix["desc"] is None: return
            for f in lec:
                st["filas"] += 1
                if len(f) <= ix["desc"]: continue
                com = f[ix["com"]] if ix["com"] is not None else nombre
                ban = bandera.get((com, f[ix["ban"]] if ix["ban"] is not None else ""), "") or com
                desc = f[ix["desc"]].strip(); ean = re.sub(r"\D", "", f[ix["ean"]]) if ix["ean"] is not None else ""
                k = (ban, ean or desc)
                if k in vistos: continue
                vistos.add(k); st["productos"] += 1
                marca = f[ix["marca"]].strip() if ix["marca"] is not None and ix["marca"] < len(f) else ""
                for w in set(re.findall(r"[a-z]{2,}", normal(desc))): palabras[w] += 1
                if marca: marcas[normal(marca)] += 1
                if len(ean) in (8, 12, 13, 14) and not ean.startswith("2"):
                    ean_com[ean].add(ban)
                    if ean not in ean_nom or (desc.lower() != desc.upper() and ean_nom[ean].isupper()): ean_nom[ean] = desc + "\t" + marca
                ms = muestras[ban]
                if len(ms) < 120: ms.append(desc)
                elif random.random() < 0.002: ms[random.randrange(120)] = desc
        for n in nombres:
            if n.lower().endswith(".zip"):
                try:
                    with zipfile.ZipFile(io.BytesIO(z.read(n))) as z2: zip_interno(z2, n)
                except Exception as e: log(f"  salteo {n}: {e}")

    with zipfile.ZipFile(zp) as z: zip_interno(z, zp)
    log(f"Zips: {st['zips']} · filas: {st['filas']:,} · productos distintos por cadena: {st['productos']:,} · códigos: {len(ean_nom):,} · cadenas: {len(muestras)}")
    os.makedirs("datos", exist_ok=True)
    pal = [[w, c] for w, c in palabras.most_common(9000) if c >= 3]
    mar = [[m, c] for m, c in marcas.most_common(3000) if c >= 3 and len(m) >= 2]
    json.dump({"fuente": "SEPA / Precios Claros (CC BY 4.0)", "fecha": date.today().isoformat(), "productos": st["productos"], "palabras": pal, "marcas": mar},
              open("datos/vocab.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    comunes = sorted(ean_com, key=lambda e: -len(ean_com[e]))
    eans = {}
    for e in comunes:
        if len(eans) >= 45000: break
        d, m = ean_nom[e].split("\t")
        eans[e] = nombre_lindo(d, m)
    json.dump(eans, open("datos/ean.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    with open("datos/muestras_cadenas.txt", "w", encoding="utf-8") as f:
        for b, ms in sorted(muestras.items(), key=lambda x: x[0]):
            f.write(f"\n=== {b}\n" + "\n".join(ms) + "\n")
    log(f"vocab.json {os.path.getsize('datos/vocab.json') / 1e3:.0f} KB · ean.json {os.path.getsize('datos/ean.json') / 1e3:.0f} KB ({len(eans):,} productos)")

if __name__ == "__main__":
    main()
