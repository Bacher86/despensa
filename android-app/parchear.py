"""Ajusta el proyecto de Android que genera `npx cap add android`: AdMob, login de Google, firma y versión."""
import json, os, re
A = "android"
ad = json.load(open("admob.json"))["appId"]

man = f"{A}/app/src/main/AndroidManifest.xml"; s = open(man).read()
if "APPLICATION_ID" not in s:
    s = s.replace("</application>", f'    <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="{ad}"/>\n'
                  '        <meta-data android:name="com.google.firebase.messaging.default_notification_channel_id" android:value="avisos"/>\n'
                  '        <meta-data android:name="com.google.firebase.messaging.default_notification_icon" android:resource="@mipmap/ic_launcher"/>\n    </application>', 1)
if "POST_NOTIFICATIONS" not in s:
    s = s.replace("</manifest>", '    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />\n</manifest>')
open(man, "w").write(s)

v = f"{A}/variables.gradle"; s = open(v).read()
if "rgcfaIncludeGoogle" not in s: s = s.replace("ext {", "ext {\n    rgcfaIncludeGoogle = true", 1)
open(v, "w").write(s)

g = f"{A}/app/build.gradle"; s = open(g).read()
code, nombre = os.environ.get("KAI_VCODE", "1"), os.environ.get("KAI_VNAME", "1.0")
s = re.sub(r"versionCode \d+", f"versionCode {code}", s)
s = re.sub(r'versionName "[^"]*"', f'versionName "{nombre}"', s)
if "signingConfigs" not in s:
    s = s.replace("    buildTypes {", """    signingConfigs {
        release {
            storeFile file(System.getenv("KAI_KS"))
            storePassword System.getenv("KAI_CLAVE")
            keyAlias System.getenv("KAI_ALIAS")
            keyPassword System.getenv("KAI_CLAVE")
        }
    }
    buildTypes {""", 1)
    s = re.sub(r"(release \{\n\s*minifyEnabled false)", r"\1\n            signingConfig signingConfigs.release", s, 1)
open(g, "w").write(s)
assert "signingConfig signingConfigs.release" in s, "no se pudo poner la firma"
print("Proyecto ajustado. versionCode", code)
