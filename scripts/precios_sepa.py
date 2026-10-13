#!/usr/bin/env python3
"""
Precios de referencia para Despensa de Casa.

Baja la base diaria SEPA (Precios Claros, datos abiertos del Estado argentino, licencia CC BY 4.0),
se queda con Coto, Jumbo, Día y Vea, y calcula el precio típico por kilo, litro o unidad de unos
45 productos de todos los días. Guarda el resultado en precios.json (con historial) para que la app
lo lea. Lo corre una GitHub Action una vez por día.

Uso:  python scripts/precios_sepa.py [--zip archivo.zip] [--salida precios.json]
Solo usa la biblioteca estándar de Python.
"""
import argparse, csv, io, json, os, re, statistics, sys, time, unicodedata, urllib.request, zipfile
from datetime import date, datetime, timedelta

CKAN = "https://datos.produccion.gob.ar/api/3/action/package_show?id=sepa-precios"
UA = {"User-Agent": "DespensaDeCasa/1.0 (precios de referencia; datos abiertos SEPA)"}

# Cadenas que mostramos. Se reconocen por el nombre de la bandera, la razón social o la web.
CADENAS = {
    "Coto": r"\bcoto\b",
    "Jumbo": r"\bjumbo\b",
    "Vea": r"\bvea\b",
    "Día": r"\bdia\b|supermercados dia|diaonline|dia argentina",
}

# Productos de referencia: id, nombre, unidad, qué buscar en la descripción SEPA, qué excluir,
# y con qué palabras se reconocen en la despensa de cada casa.
P = lambda id, nombre, unidad, incluye, excluye="", claves=None: dict(id=id, nombre=nombre, unidad=unidad, incluye=incluye, excluye=excluye, claves=claves or [id])
PRODUCTOS = [
    P("leche", "Leche", "L", r"^leche .*\b(entera|descremada|parcialmente|semidescremada)\b|^leche (fluida|larga vida)", r"polvo|chocolat|condensada|dulce|cabra|almendra|soja|coco|avena|deslactos", ["leche"]),
    P("yerba", "Yerba mate", "kg", r"^yerba", r"saquito|\bte\b|compuesta con|hierbas serranas", ["yerba"]),
    P("cafe", "Café", "kg", r"^cafe ", r"capsula|saquito|filtro de|cafetera|leche|bebida|cappuccino|frio", ["cafe"]),
    P("te", "Té en saquitos", "u", r"^te (en saquitos|negro|verde|de )|^te .*saquitos", r"helado|frio|bebida", ["te"]),
    P("azucar", "Azúcar", "kg", r"^azucar ", r"impalpable|light|edulcorante|mascabo|organica|organico", ["azucar"]),
    P("harina", "Harina", "kg", r"^harina (de trigo )?(000|0000|leudante|comun)", r"maiz|integral|arroz|almendra|garbanzo|mandioca", ["harina"]),
    P("arroz", "Arroz", "kg", r"^arroz ", r"con leche|galleta|snack|integral yamani|listo|risotto|preparado|harina|salvaje", ["arroz"]),
    P("fideos", "Fideos secos", "kg", r"^fideos? |^spaghetti|^tallarin|^tirabuzon|^mostachol|^monito|^codito", r"huevo al|rellen|lasagna|instant|sopa|arroz", ["fideo", "spaghetti", "tallarin", "mostachol", "tirabuzon"]),
    P("polenta", "Polenta", "kg", r"^polenta|^harina de maiz", r"lista|instantanea con queso", ["polenta"]),
    P("lentejas", "Lentejas", "kg", r"^lentejas?\b", r"sopa|harina", ["lenteja"]),
    P("aceite", "Aceite de girasol", "L", r"^aceite .*girasol|^aceite de girasol", r"spray|aerosol|oliva|mezcla", ["aceite"]),
    P("pure_tomate", "Puré de tomate", "kg", r"^pure de tomate|^tomate triturado|^pulpa de tomate", r"ketchup", ["pure de tomate", "tomate triturado"]),
    P("atun", "Atún", "kg", r"^atun ", r"paté|pate", ["atun"]),
    P("mayonesa", "Mayonesa", "kg", r"^mayonesa", r"light|vegana", ["mayonesa"]),
    P("galletitas_dulces", "Galletitas dulces", "kg", r"^galletit.*(dulce|vainilla|chocolate|rellena|chips)|^galletit.*(oreo|pepitas|melba|toddy)", r"arroz|agua|cracker|salvado", ["galletita", "galletitas dulces"]),
    P("galletitas_agua", "Galletitas de agua", "kg", r"^galletit.*(agua|cracker|crackers)", r"arroz", ["galletitas de agua", "crackers"]),
    P("pan_lactal", "Pan lactal", "kg", r"^pan (lactal|de molde|blanco)", r"rallado|hamburguesa|pancho|sin tacc", ["pan lactal", "pan"]),
    P("dulce_leche", "Dulce de leche", "kg", r"^dulce de leche", r"alfajor|helado|galletit", ["dulce de leche"]),
    P("mermelada", "Mermelada", "kg", r"^mermelada|^dulce de (membrillo|batata)", r"light", ["mermelada"]),
    P("manteca", "Manteca", "kg", r"^manteca ", r"de mani|cacao", ["manteca"]),
    P("queso_cremoso", "Queso cremoso", "kg", r"^queso (cremoso|por salut|mozzarella|muzzarella|tybo|pategras|fresco)", r"rallado|untable|crema", ["queso cremoso", "mozzarella", "muzzarella", "queso"]),
    P("queso_rallado", "Queso rallado", "kg", r"^queso rallado", r"", ["queso rallado"]),
    P("queso_crema", "Queso crema", "kg", r"^queso (crema|blanco|untable)", r"", ["queso crema", "queso blanco"]),
    P("yogur", "Yogur", "kg", r"^yogur", r"helado|griego descremado batido con cereal", ["yogur"]),
    P("crema", "Crema de leche", "L", r"^crema de leche", r"helado", ["crema de leche", "crema"]),
    P("huevos", "Huevos", "u", r"^huevos?\b", r"pascua|chocolate|codorniz|liquido|en polvo", ["huevo"]),
    P("jamon", "Jamón cocido", "kg", r"^jamon cocido", r"", ["jamon"]),
    P("salchichas", "Salchichas", "kg", r"^salchichas?\b", r"", ["salchicha"]),
    P("carne_picada", "Carne picada", "kg", r"^carne picada|^picada (comun|especial|de carne)", r"pollo|cerdo", ["carne picada"]),
    P("pollo", "Pollo", "kg", r"^pollo (entero|fresco)|^pata muslo|^pechuga", r"rebozad|nugget|medallon|hamburguesa|caldo", ["pollo", "pechuga", "pata muslo"]),
    P("milanesas", "Milanesas (rebozadas)", "kg", r"^milanesa", r"soja|vegetal|berenjena", ["milanesa"]),
    P("papa", "Papa", "kg", r"^papas? (negra|blanca|cepillada|lavada|x kg)|^papa$", r"frita|snack|baston|congelad|pure", ["papa"]),
    P("cebolla", "Cebolla", "kg", r"^cebolla", r"verdeo|deshidrat|frita", ["cebolla"]),
    P("tomate", "Tomate", "kg", r"^tomate (redondo|perita|x kg)|^tomate$", r"triturado|pure|pulpa|cherry seco|salsa", ["tomate"]),
    P("banana", "Banana", "kg", r"^banana", r"chips|deshidrat", ["banana"]),
    P("manzana", "Manzana", "kg", r"^manzana", r"jugo|deshidrat|sidra", ["manzana"]),
    P("papel_higienico", "Papel higiénico", "m", r"^papel higienico", r"humedo", ["papel higienico"]),
    P("detergente", "Detergente", "L", r"^detergente", r"lavarropas|ropa|polvo", ["detergente"]),
    P("lavandina", "Lavandina", "L", r"^lavandina|^agua lavandina", r"gel ropa", ["lavandina"]),
    P("jabon_polvo", "Jabón en polvo", "kg", r"^jabon (en polvo|polvo)|^jabon .*lavarropas", r"liquido", ["jabon en polvo"]),
    P("jabon_liquido_ropa", "Jabón líquido para ropa", "L", r"^jabon liquido .*(ropa|lavarropas)|^detergente .*(ropa|lavarropas)", r"", ["jabon liquido"]),
    P("jabon_tocador", "Jabón de tocador", "kg", r"^jabon (de tocador|tocador|en barra)", r"liquido|polvo", ["jabon de tocador", "jabon"]),
    P("shampoo", "Shampoo", "L", r"^shampoo", r"", ["shampoo"]),
    P("pasta_dental", "Pasta dental", "kg", r"^(pasta|crema) dental", r"cepillo", ["pasta dental"]),
    P("gaseosa_cola", "Gaseosa cola", "L", r"^gaseosa .*cola|^coca[ -]?cola", r"", ["gaseosa", "coca"]),
    P("agua", "Agua mineral", "L", r"^agua (mineral|sin gas|con gas)", r"saborizada|lavandina", ["agua"]),
]

UNIDADES = {  # a la unidad base de cada producto
    "kg": {"kg": 1, "kilo": 1, "kgs": 1, "k": 1, "gr": 0.001, "grm": 0.001, "grs": 0.001, "g": 0.001},
    "L": {"lt": 1, "l": 1, "litro": 1, "lts": 1, "ml": 0.001, "cc": 0.001, "cm3": 0.001, "cmq": 0.001},
    "u": {"un": 1, "u": 1, "unidad": 1, "uni": 1, "unid": 1, "docena": 12, "doc": 12},
    "m": {"mt": 1, "m": 1, "mts": 1, "metro": 1, "metros": 1},
}


def normal(s):
    s = unicodedata.normalize("NFD", str(s or "")).encode("ascii", "ignore").decode().lower()
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 .,]", " ", s)).strip()


def log(*a):
    print(time.strftime("%H:%M:%S"), *a, flush=True)


def bajar(url, destino=None, intentos=4):
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
            log(f"  intento {i + 1} falló: {e}")
            time.sleep(10 * (i + 1))
    raise SystemExit(f"No se pudo bajar {url}")


def ultimo_zip():
    datos = json.loads(bajar(CKAN))
    recursos = [r for r in datos["result"]["resources"] if (r.get("format") or "").lower() == "zip" or str(r.get("url", "")).lower().endswith(".zip")]
    if not recursos:
        raise SystemExit("El portal no tiene archivos zip en el dataset sepa-precios")
    clave = lambda r: r.get("last_modified") or r.get("metadata_modified") or r.get("created") or ""
    recursos.sort(key=clave, reverse=True)
    r = recursos[0]
    log(f"Archivo más reciente: {r.get('name')} ({clave(r)})")
    return r["url"]


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


RE_TAM = re.compile(r"(\d+(?:[.,]\d+)?)\s*(kg|kgs|k|grs|grm|gr|g|lts|lt|l|ml|cc|cm3|un|u|mts|mt|m)\b")


def precio_base(prod, fila, ix):
    """Precio por unidad base (kg, L, u o m). Usa el precio de referencia si viene; si no, lo calcula."""
    base = prod["unidad"]
    conv = UNIDADES[base]
    pr = num(fila[ix["pref"]]) if ix["pref"] is not None else 0
    ur = normal(fila[ix["uref"]]) if ix["uref"] is not None else ""
    cr = num(fila[ix["cref"]]) if ix["cref"] is not None else 1
    if pr > 0 and ur in conv:
        return pr / ((cr or 1) * conv[ur])
    pl = num(fila[ix["plista"]]) if ix["plista"] is not None else 0
    if pl <= 0:
        return 0
    cp = num(fila[ix["cpres"]]) if ix["cpres"] is not None else 0
    up = normal(fila[ix["upres"]]) if ix["upres"] is not None else ""
    if cp > 0 and up in conv:
        return pl / (cp * conv[up])
    m = RE_TAM.search(normal(fila[ix["desc"]]))
    if m and m.group(2) in conv:
        return pl / (num(m.group(1)) * conv[m.group(2)])
    return pl if base == "u" else 0


def cadena_de(*textos):
    t = " ".join(normal(x) for x in textos if x)
    for nombre, rx in CADENAS.items():
        if re.search(rx, t):
            return nombre
    return None


def procesar(zip_path):
    compilados = [(p, re.compile(p["incluye"]), re.compile(p["excluye"]) if p["excluye"] else None) for p in PRODUCTOS]
    filtro = re.compile("|".join(f"(?:{p['incluye']})" for p in PRODUCTOS))
    valores = {p["id"]: {c: [] for c in CADENAS} for p in PRODUCTOS}
    sucursales = {c: set() for c in CADENAS}
    stats = {"zips": 0, "filas": 0, "usadas": 0}

    def zip_interno(z, nombre=""):
        nombres = z.namelist()
        csvs = {os.path.basename(n).lower(): n for n in nombres if n.lower().endswith(".csv")}
        if "productos.csv" in csvs:
            stats["zips"] += 1
            banderas = {}
            if "comercio.csv" in csvs:
                cab, lec = leer_csv(z, csvs["comercio.csv"])
                ic, ib = col(cab, "id_comercio"), col(cab, "id_bandera")
                # primero el nombre de la bandera (Jumbo, Vea y Disco son de la misma empresa);
                # la razón social o la web solo si no hay nombre de bandera
                inom = col(cab, "comercio_bandera_nombre", "bandera_nombre", "bandera")
                iotros = [i for i, c in enumerate(cab) if any(k in c for k in ("bandera_url", "razon_social"))]
                for f in lec:
                    if not f:
                        continue
                    k = (f[ic] if ic is not None else "", f[ib] if ib is not None else "")
                    nom = f[inom].strip() if inom is not None and inom < len(f) else ""
                    banderas[k] = cadena_de(nom) if nom else cadena_de(*[f[i] for i in iotros if i < len(f)])
            if banderas and not any(banderas.values()):
                return
            cab, lec = leer_csv(z, csvs["productos.csv"])
            ix = dict(
                com=col(cab, "id_comercio"), ban=col(cab, "id_bandera"), suc=col(cab, "id_sucursal"),
                desc=col(cab, "productos_descripcion", "descripcion"),
                plista=col(cab, "productos_precio_lista", "precio_lista"),
                pref=col(cab, "productos_precio_referencia", "precio_referencia"),
                cref=col(cab, "productos_cantidad_referencia", "cantidad_referencia"),
                uref=col(cab, "productos_unidad_medida_referencia", "unidad_medida_referencia"),
                cpres=col(cab, "productos_cantidad_presentacion", "cantidad_presentacion"),
                upres=col(cab, "productos_unidad_medida_presentacion", "unidad_medida_presentacion"),
            )
            if ix["desc"] is None or (ix["plista"] is None and ix["pref"] is None):
                log(f"  {nombre}: no reconozco las columnas {cab[:12]}")
                return
            if stats["zips"] == 1:
                log(f"  Columnas detectadas: { {k: cab[v] for k, v in ix.items() if v is not None} }")
            for f in lec:
                stats["filas"] += 1
                if len(f) <= ix["desc"]:
                    continue
                k = (f[ix["com"]] if ix["com"] is not None else "", f[ix["ban"]] if ix["ban"] is not None else "")
                cad = banderas.get(k) if banderas else None
                if cad is None:
                    continue
                d = normal(f[ix["desc"]])
                if not filtro.search(d):
                    continue
                for p, inc, exc in compilados:
                    if inc.search(d) and not (exc and exc.search(d)):
                        v = precio_base(p, f, ix)
                        if v > 0:
                            valores[p["id"]][cad].append(v)
                            stats["usadas"] += 1
                            if ix["suc"] is not None:
                                sucursales[cad].add((k, f[ix["suc"]]))
                        break
        for n in nombres:
            if n.lower().endswith(".zip"):
                with zipfile.ZipFile(io.BytesIO(z.read(n))) as z2:
                    zip_interno(z2, n)

    with zipfile.ZipFile(zip_path) as z:
        zip_interno(z, zip_path)
    log(f"Zips de comercios: {stats['zips']} · filas leídas: {stats['filas']:,} · precios usados: {stats['usadas']:,}")
    log("Sucursales por cadena: " + ", ".join(f"{c} {len(s)}" for c, s in sucursales.items()))
    return valores, {c: len(s) for c, s in sucursales.items()}


def recortar(vals):
    """Saca los extremos (errores de carga, envases raros) antes de la mediana."""
    if len(vals) < 5:
        return vals
    v = sorted(vals)
    a, b = int(len(v) * 0.1), int(len(v) * 0.9)
    return v[a:b] or v


def armar_salida(valores, sucursales, anterior):
    hoy = date.today().isoformat()
    productos = {}
    for p in PRODUCTOS:
        precios = {}
        for c in CADENAS:
            v = recortar(valores[p["id"]][c])
            if len(v) >= 3:
                precios[c] = round(statistics.median(v), 2)
        todos = recortar([x for c in CADENAS for x in valores[p["id"]][c]])
        if not precios or len(todos) < 5:
            continue
        productos[p["id"]] = dict(nombre=p["nombre"], unidad=p["unidad"], claves=p["claves"], precios=precios, mediana=round(statistics.median(todos), 2))

    # historial: un punto por día los últimos 60 días, después uno por semana (hasta ~14 meses)
    hist = [h for h in (anterior or {}).get("historial", []) if h.get("f") != hoy]
    hist.append({"f": hoy, "m": {k: v["mediana"] for k, v in productos.items()}})
    hist.sort(key=lambda h: h["f"])
    lim60 = (date.today() - timedelta(days=60)).isoformat()
    lim400 = (date.today() - timedelta(days=430)).isoformat()
    vistos, podado = set(), []
    for h in hist:
        if h["f"] < lim400:
            continue
        if h["f"] < lim60:
            semana = datetime.fromisoformat(h["f"]).isocalendar()[:2]
            if semana in vistos:
                continue
            vistos.add(semana)
        podado.append(h)

    def variacion(dias):
        objetivo = (date.today() - timedelta(days=dias)).isoformat()
        previos = [h for h in podado if h["f"] <= objetivo]
        if not previos:
            return None, {}
        base = previos[-1]
        por = {k: round((v["mediana"] / base["m"][k] - 1) * 100, 1) for k, v in productos.items() if base["m"].get(k)}
        if len(por) < 5:
            return None, por
        canasta = round((statistics.fmean(1 + x / 100 for x in por.values()) - 1) * 100, 1)
        return canasta, por

    can30, por30 = variacion(30)
    for k, v in por30.items():
        productos[k]["var30"] = v
    return {
        "actualizado": hoy,
        "fuente": "Precios Claros - SEPA, Secretaría de Industria y Comercio (datos abiertos, CC BY 4.0)",
        "cadenas": list(CADENAS),
        "sucursales": sucursales,
        "canasta_var30": can30,
        "productos": productos,
        "historial": podado,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--zip", help="usar un zip ya descargado")
    ap.add_argument("--salida", default="precios.json")
    a = ap.parse_args()
    anterior = None
    if os.path.exists(a.salida):
        try:
            anterior = json.load(open(a.salida, encoding="utf-8"))
        except Exception:
            anterior = None
    zp = a.zip
    if not zp:
        url = ultimo_zip()
        zp = "/tmp/sepa.zip"
        log(f"Bajando {url}")
        bajar(url, zp)
        log(f"Bajado: {os.path.getsize(zp) / 1e6:.0f} MB")
    valores, sucursales = procesar(zp)
    salida = armar_salida(valores, sucursales, anterior)
    if len(salida["productos"]) < 10:
        raise SystemExit(f"Solo encontré {len(salida['productos'])} productos: algo cambió en el formato. No guardo nada.")
    with open(a.salida, "w", encoding="utf-8") as f:
        json.dump(salida, f, ensure_ascii=False, separators=(",", ":"))
    log(f"Listo: {len(salida['productos'])} productos guardados en {a.salida} ({os.path.getsize(a.salida) / 1e3:.0f} KB)")
    for k, v in list(salida["productos"].items())[:8]:
        log(f"  {v['nombre']}: " + " · ".join(f"{c} ${p:,.0f}/{v['unidad']}" for c, p in v["precios"].items()))


if __name__ == "__main__":
    main()
