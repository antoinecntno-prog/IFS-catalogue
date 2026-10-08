"""Génère une version fichier unique du catalogue, photos et polices incluses.

Le site en ligne reste le dossier site/ (photos chargées au défilement, plus léger).
Cette version sert à ouvrir la page seule : aperçu, pièce jointe, clé USB.
Le studio de personnalisation (personnaliser.html) n'y figure pas : il demande le site en ligne ou le dossier site/.

Usage : python3 outils/fichier-unique.py
"""
import base64
import pathlib
import re

RACINE = pathlib.Path(__file__).resolve().parent.parent
SITE = RACINE / "site"
SORTIE = RACINE / "2026-10-05_catalogue-sublimation-contino-sport.html"


def data_uri(chemin: pathlib.Path, mime: str) -> str:
    return f"data:{mime};base64," + base64.b64encode(chemin.read_bytes()).decode()


html = (SITE / "index.html").read_text(encoding="utf-8")

# Feuille commune et scripts partagés : inclus dans la page
def inline(tag, contenu, balise):
    assert tag in html, f"balise introuvable : {tag}"
    assert f"</{balise}" not in contenu.lower(), f"{tag} contient une balise de fin"
    return html.replace(tag, f"<{balise}>\n{contenu}\n</{balise}>", 1)

# Pixel Meta et bandeau cookies : inutiles hors ligne, le lien « Cookies » reste masqué
html = html.replace('<script src="consentement.js"></script>\n', "")
html = inline('<link rel="stylesheet" href="base.css">', (SITE / "base.css").read_text(encoding="utf-8"), "style")
html = inline('<script src="donnees.js"></script>', (SITE / "donnees.js").read_text(encoding="utf-8"), "script")
html = inline('<script src="stockage.js"></script>', (SITE / "stockage.js").read_text(encoding="utf-8") + "\n/* Fichier unique : pas de studio (page à part), le lien Personnaliser est masqué */\nwindow.IFS_FICHIER_UNIQUE = true;", "script")

# Polices : incluses en base64, les préchargements n'ont plus d'objet
html = re.sub(r'\s*<link rel="preload" href="fonts/[^"]+"[^>]*>', "", html)
html, n_polices = re.subn(r"url\(fonts/([^)]+\.woff2)\)", lambda m: f'url("{data_uri(SITE / "fonts" / m.group(1), "font/woff2")}")', html)

# Marque Contino Sport : icônes d'onglet et logo de l'en-tête (version claire et version sombre)
for png in ("c-sport-32.png", "c-sport-192.png", "c-sport-180.png"):
    html = html.replace(f'href="{png}"', f'href="{data_uri(SITE / png, "image/png")}"', 1)
html = html.replace('src="logo-contino-sport.webp"', f'src="{data_uri(SITE / "logo-contino-sport.webp", "image/webp")}"', 1)
html = html.replace('srcset="logo-contino-sport-blanc.webp"', f'srcset="{data_uri(SITE / "logo-contino-sport-blanc.webp", "image/webp")}"', 1)

# Photos : une table nom -> image 640 px, sans variante 360 px
photos = {p.stem: data_uri(p, "image/webp") for p in sorted((SITE / "img").glob("*.webp")) if not p.stem.endswith("-360")}
table = "const IMG = {" + ", ".join(f'"{k}": "{v}"' for k, v in photos.items()) + "};\n"
ancien_src = "const imgSrc = name => `img/${name}.webp`;\n"
ancien_set = "const imgSet = name => `img/${name}-360.webp 360w, img/${name}.webp 640w`;\n"
assert ancien_src in html and ancien_set in html, "les fonctions imgSrc et imgSet ont changé dans site/index.html"
html = html.replace(ancien_src, table + "const imgSrc = name => IMG[name];\n").replace(ancien_set, 'const imgSet = () => "";\n')

html = html.replace("<!doctype html>", "<!doctype html>\n<!-- Version fichier unique générée par outils/fichier-unique.py depuis site/. Ne pas modifier ici. -->", 1)
SORTIE.write_text(html, encoding="utf-8")
print(f"{SORTIE.name} : {SORTIE.stat().st_size / 1024:.0f} Ko, {len(photos)} photos, {n_polices} polices")
