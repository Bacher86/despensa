// Publica firestore.rules en Firebase (base "default") con la cuenta de servicio del secreto FIREBASE_SA.
// Lo corre .github/workflows/reglas.yml cada vez que cambia firestore.rules.
import { readFileSync } from "fs";
import { cert } from "firebase-admin/app";
const sa = JSON.parse(process.env.FIREBASE_SA || "null");
if (!sa) { console.log("::error::Falta el secreto FIREBASE_SA"); process.exit(1); }
const P = sa.project_id, API = `https://firebaserules.googleapis.com/v1/projects/${P}`;
const { access_token } = await cert(sa).getAccessToken();
const h = { Authorization: "Bearer " + access_token, "Content-Type": "application/json" };
const pedir = async (url, method, body) => { const r = await fetch(url, { method, headers: h, body: JSON.stringify(body) }); const j = await r.json().catch(() => ({})); return { ok: r.ok, status: r.status, j }; };
const rs = await pedir(`${API}/rulesets`, "POST", { source: { files: [{ name: "firestore.rules", content: readFileSync(new URL("../firestore.rules", import.meta.url), "utf8") }] } });
if (!rs.ok) { console.log("::error::Firebase rechazó las reglas: " + JSON.stringify(rs.j.error || rs.j)); process.exit(1); }
const release = `projects/${P}/releases/cloud.firestore/default`;
let r = await pedir(`https://firebaserules.googleapis.com/v1/${release}`, "PATCH", { release: { name: release, rulesetName: rs.j.name } });
if (r.status === 404) r = await pedir(`${API}/releases`, "POST", { name: release, rulesetName: rs.j.name });
if (!r.ok) { console.log("::error::No se pudieron publicar: " + JSON.stringify(r.j.error || r.j)); process.exit(1); }
console.log("Reglas publicadas:", rs.j.name);
