"""Prepara lo que la app de Android necesita de Firebase, usando la cuenta de servicio (secreto FIREBASE_SA):
1) la llave de firma (se crea una sola vez y se guarda en Firestore, en privado/android, que nadie puede leer desde la app);
2) la app de Android registrada en Firebase, con la huella de esa llave (para el login de Google);
3) google-services.json.
Escribe kai.jks, google-services.json y firma.env en la carpeta actual."""
import base64, json, os, re, secrets, subprocess, sys, time
import requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request

PROY, DB, PAQ = "casa-48f64", "default", "ar.kai.despensa"
sa = json.loads(os.environ["FIREBASE_SA"])
cred = service_account.Credentials.from_service_account_info(sa, scopes=["https://www.googleapis.com/auth/cloud-platform", "https://www.googleapis.com/auth/firebase"])
cred.refresh(Request())
H = {"Authorization": f"Bearer {cred.token}", "Content-Type": "application/json"}

def pedir(metodo, url, **kw):
    r = requests.request(metodo, url, headers=H, timeout=60, **kw)
    if r.status_code >= 400 and r.status_code != 404:
        print(f"ERROR {r.status_code} en {metodo} {url}\n{r.text[:1500]}"); sys.exit(1)
    return r

# 1) llave de firma
DOC = f"https://firestore.googleapis.com/v1/projects/{PROY}/databases/{DB}/documents/privado/android"
r = pedir("GET", DOC)
if r.status_code == 404:
    clave = secrets.token_urlsafe(24)
    subprocess.run(["keytool", "-genkeypair", "-keystore", "kai.jks", "-alias", "kai", "-keyalg", "RSA", "-keysize", "2048", "-validity", "10000",
                    "-storepass", clave, "-keypass", clave, "-dname", "CN=Kai, O=Kai, C=AR"], check=True, capture_output=True)
    ks = base64.b64encode(open("kai.jks", "rb").read()).decode()
    pedir("PATCH", DOC, json={"fields": {"ks": {"stringValue": ks}, "clave": {"stringValue": clave}, "alias": {"stringValue": "kai"}, "creada": {"timestampValue": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}}})
    print("Llave de firma nueva creada y guardada.")
else:
    f = r.json()["fields"]; clave = f["clave"]["stringValue"]
    open("kai.jks", "wb").write(base64.b64decode(f["ks"]["stringValue"]))
    print("Llave de firma recuperada.")
open("firma.env", "w").write(f"KAI_KS={os.path.abspath('kai.jks')}\nKAI_CLAVE={clave}\nKAI_ALIAS=kai\n")
print(f"::add-mask::{clave}")
lista = subprocess.run(["keytool", "-list", "-v", "-keystore", "kai.jks", "-storepass", clave], check=True, capture_output=True, text=True).stdout
sha1 = re.search(r"SHA1:\s*([0-9A-F:]+)", lista).group(1).replace(":", "").lower()
sha256 = re.search(r"SHA256:\s*([0-9A-F:]+)", lista).group(1).replace(":", "").lower()
print("SHA-1:", sha1)

# 2) app de Android en Firebase
FB = f"https://firebase.googleapis.com/v1beta1/projects/{PROY}"
apps = pedir("GET", f"{FB}/androidApps").json().get("apps", [])
app = next((a for a in apps if a.get("packageName") == PAQ), None)
if not app:
    op = pedir("POST", f"{FB}/androidApps", json={"packageName": PAQ, "displayName": "Kai Android"}).json()
    for _ in range(30):
        if op.get("done"): break
        time.sleep(3); op = pedir("GET", f"https://firebase.googleapis.com/v1beta1/{op['name']}").json()
    if "error" in op: print("ERROR creando la app:", op["error"]); sys.exit(1)
    app = op["response"]; print("App de Android registrada en Firebase:", app["appId"])
else:
    print("App de Android ya registrada:", app["appId"])
APP = f"{FB}/androidApps/{app['appId']}"
tiene = {s["shaHash"].lower() for s in pedir("GET", f"{APP}/sha").json().get("certificates", [])}
nuevas = False
for h, tipo in ((sha1, "SHA_1"), (sha256, "SHA_256")):
    if h not in tiene:
        pedir("POST", f"{APP}/sha", json={"shaHash": h, "certType": tipo}); nuevas = True; print("Huella agregada:", tipo)

# 3) google-services.json (con el cliente de Google para el login, que Firebase crea al agregar la huella)
for i in range(12):
    cfg = json.loads(base64.b64decode(pedir("GET", f"{APP}/config").json()["configFileContents"]))
    cli = cfg["client"][0]
    if any(c.get("client_type") == 1 for c in cli.get("oauth_client", [])) or i == 11: break
    time.sleep(10)
json.dump(cfg, open("google-services.json", "w"), indent=2)
print("google-services.json listo. Clientes OAuth:", [c.get("client_type") for c in cli.get("oauth_client", [])])
