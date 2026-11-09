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



# cadenas cuya descripción en SEPA es la misma, corta, que imprimen en el ticket (máx. ~20 a 26 letras)
CORTAS = re.compile(r"supermercados dia|cooperativa obrera|unicoop|changomas|toledo|deheza|estacion lima|axion|california|mariano max", re.I)
# cadenas con descripción completa y prolija: de ahí sale el nombre lindo (en este orden de preferencia)
LARGAS = ["carrefour", "market", "maxi", "express", "coto", "la anonima", "jumbo", "disco", "vea", "comodin"]
MINUS = {"de", "del", "con", "sin", "y", "en", "a", "al", "para", "por", "o"}
SIGLAS = {"tacc", "uat", "ddl", "ipa", "apa", "uhd", "led", "usb", "tv", "bc", "dp"}

def prioridad(ban):
    b = normal(ban)
    for i, k in enumerate(LARGAS):
        if k in b: return i
    return 50

def nombre_lindo(desc):
    d = str(desc or "").strip().lstrip(".*-· ")
    d = re.sub(r"\s+[A-Z/]{2,4}-[\d.,]+-\w+\.?$", "", d)            # Coto / Jumbo: "CJA-100-gr."
    d = re.sub(r"(\d)([a-zA-Z]+)\.(?=[A-Za-z])", r"\1\2 ", d)
    d = re.sub(r",\s*", " ", d)                                        # La Anónima: "ITEM, MARCA, 20 gr"
    d = re.sub(r"\b[xX]\s*(?=\d)", "", d)                               # "X 500 GRS" -> "500 GRS"
    d = re.sub(r"\s+", " ", d).strip()
    out = []
    for i, w in enumerate(d.split(" ")):
        lw = w.lower()
        if re.fullmatch(r"[\d.,/]+[a-z]*\.?", lw):
            m = re.fullmatch(r"([\d.,/]+)\s*([a-z]*)\.?", lw); n, u = m.group(1), m.group(2)
            u = {"gr": "g", "grs": "g", "grm": "g", "g": "g", "kg": "kg", "kgs": "kg", "k": "kg", "lt": "L", "lts": "L", "l": "L", "ltr": "L", "ml": "ml", "cc": "ml", "cm3": "ml", "un": "u", "u": "u", "uni": "u", "unid": "u", "mts": "m", "mt": "m", "m": "m"}.get(u, u)
            out.append(n + (" " + u if u else "")); continue
        if lw in {"gr", "grs", "grm", "g"}: out.append("g"); continue
        if lw in {"cc", "cm3"}: out.append("ml"); continue
        if lw in {"lt", "lts", "ltr"}: out.append("L"); continue
        if lw in {"kg", "kgs"}: out.append("kg"); continue
        if lw in {"un", "uni", "unid"}: out.append("u"); continue
        if lw in SIGLAS: out.append(w.upper()); continue
        out.append(lw if (i and lw in MINUS) else lw[:1].upper() + lw[1:])
    return re.sub(r"(\d) (g|kg|L|ml|u|m)\b(?= ?\d)", r"\1 \2", " ".join(out))[:60]

def main():
    zp = sys.argv[1] if len(sys.argv) > 1 else None
    if not zp:
        url = ultimo_zip()
        if not url: fallar("No encontré la base SEPA")
        log(f"Bajando {url}")
        zp = bajar(url, "/tmp/sepa.zip")
        log(f"Bajado: {os.path.getsize(zp) / 1e6:.0f} MB")
    palabras = collections.Counter(); marcas = collections.Counter()
    largo = {}            # ean -> (prioridad, descripción completa)
    cortos = collections.defaultdict(collections.Counter)   # ean -> descripciones cortas (de ticket)
    sin_ean_cortos = collections.Counter()
    ean_com = collections.defaultdict(set)
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
                desc = re.sub(r"\s+", " ", f[ix["desc"]]).strip(); ean = re.sub(r"\D", "", f[ix["ean"]]) if ix["ean"] is not None else ""
                ean = ean.lstrip("0").zfill(13) if len(ean) >= 8 else ean
                k = (ban, ean or desc)
                if k in vistos: continue
                vistos.add(k); st["productos"] += 1
                marca = f[ix["marca"]].strip() if ix["marca"] is not None and ix["marca"] < len(f) else ""
                for w in set(re.findall(r"[a-z]{2,}", normal(desc))): palabras[w] += 1
                if marca: marcas[normal(marca)] += 1
                ms = muestras[ban]
                if len(ms) < 120: ms.append(desc)
                elif random.random() < 0.002: ms[random.randrange(120)] = desc
                valido = len(ean) == 13 and not ean.startswith("2") and not ean.startswith("00000")
                if CORTAS.search(ban) and len(desc) <= 32:
                    if valido: cortos[ean][desc.upper()] += 1
                    else: sin_ean_cortos[desc.upper()] += 1
                if valido:
                    ean_com[ean].add(ban)
                    pr = prioridad(ban)
                    if pr < 50 and (ean not in largo or pr < largo[ean][0]): largo[ean] = (pr, desc)
        for n in nombres:
            if n.lower().endswith(".zip"):
                try:
                    with zipfile.ZipFile(io.BytesIO(z.read(n))) as z2: zip_interno(z2, n)
                except Exception as e: log(f"  salteo {n}: {e}")

    with zipfile.ZipFile(zp) as z: zip_interno(z, zp)
    log(f"Zips: {st['zips']} · filas: {st['filas']:,} · productos distintos por cadena: {st['productos']:,} · con nombre completo: {len(largo):,} · con nombre de ticket: {len(cortos):,} · cadenas: {len(muestras)}")
    os.makedirs("datos", exist_ok=True)

    # 1) abreviaturas: el mismo código de barras con nombre de ticket y con nombre completo
    pares = collections.defaultdict(collections.Counter)
    for ean, cs in cortos.items():
        if ean not in largo: continue
        full = re.findall(r"[a-z]{2,}", normal(largo[ean][1]))
        fs = set(full)
        for c in cs:
            for t in re.findall(r"[a-z]{2,}", normal(c)):
                if t in fs or len(t) < 2: continue
                cand = [w for w in full if len(w) > len(t) and w[0] == t[0] and (w.startswith(t) or re.fullmatch(".*".join(map(re.escape, t)) + ".*", w))]
                if cand: pares[t][min(cand, key=len) if all(w.startswith(t) for w in cand) else cand[0]] += 1
    abrev = {}
    UNID = {"gr", "grs", "grm", "ml", "cc", "lt", "lts", "kg", "kgs", "un", "uni", "unid", "mt", "mts", "cm", "mm", "pack", "x"}
    for t, c in pares.items():
        w, n = c.most_common(1)[0]
        # no "abreviamos" palabras que ya existen solas (pan, gato, moto) ni unidades
        if len(t) < 2 or t in UNID or (palabras[t] >= 25 and len(t) >= 3) or (len(t) == 2 and n < 30): continue
        if n >= 3 and n / sum(c.values()) >= 0.55: abrev[t] = w
    log(f"Abreviaturas aprendidas: {len(abrev):,}. Ejemplos: " + ", ".join(f"{k}→{v}" for k, v in list(sorted(abrev.items(), key=lambda kv: -sum(pares[kv[0]].values())))[:60]))

    # 2) nombre de ticket -> nombre lindo, y código de barras -> nombre lindo
    nombres, idx = [], {}
    def nid(n):
        if n not in idx: idx[n] = len(nombres); nombres.append(n)
        return idx[n]
    corto_nom = {}
    for ean, cs in cortos.items():
        if ean not in largo: continue
        n = nid(nombre_lindo(largo[ean][1]))
        for c in cs:
            k = re.sub(r"\s+", " ", normal(c))
            if len(k) >= 6 and k not in corto_nom: corto_nom[k] = n
    fuente = {"fuente": "SEPA / Precios Claros (datos abiertos, CC BY 4.0)", "fecha": date.today().isoformat()}
    json.dump({**fuente, "nombres": nombres, "cortos": corto_nom, "abrev": abrev},
              open("datos/tickets.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    # códigos de barras: archivo aparte, Kai lo baja solo si el ticket trae códigos
    nombres, idx = [], {}
    comunes = sorted(largo, key=lambda e: -len(ean_com[e]))[:60000]
    ean_nom = {e: nid(nombre_lindo(largo[e][1])) for e in comunes}
    json.dump({**fuente, "nombres": nombres, "ean": ean_nom}, open("datos/ean.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    pal = [[w, c] for w, c in palabras.most_common(9000) if c >= 3]
    mar = [[m, c] for m, c in marcas.most_common(3000) if c >= 3 and len(m) >= 2]
    json.dump({"fuente": "SEPA / Precios Claros (CC BY 4.0)", "fecha": date.today().isoformat(), "productos": st["productos"], "palabras": pal, "marcas": mar},
              open("datos/vocab.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    with open("datos/muestras_cadenas.txt", "w", encoding="utf-8") as f:
        for b, ms in sorted(muestras.items(), key=lambda x: x[0]):
            f.write(f"\n=== {b}\n" + "\n".join(ms) + "\n")
        f.write("\n=== EJEMPLOS ticket -> nombre\n" + "\n".join(f"{k} -> {nombres[v]}" for k, v in list(corto_nom.items())[:400]))
        f.write("\n=== ABREVIATURAS\n" + "\n".join(f"{k} -> {v} ({sum(pares[k].values())})" for k, v in sorted(abrev.items())))
    log(f"ean.json {os.path.getsize('datos/ean.json') / 1e3:.0f} KB · tickets.json {os.path.getsize('datos/tickets.json') / 1e3:.0f} KB ({len(corto_nom):,} nombres de ticket, {len(ean_nom):,} códigos, {len(nombres):,} nombres) · vocab.json {os.path.getsize('datos/vocab.json') / 1e3:.0f} KB")

if __name__ == "__main__":
    main()
