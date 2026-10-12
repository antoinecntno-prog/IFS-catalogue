"""Écrit assets/donnees.js pour la pub « Le carnet » : la liste PRODUITS du film (case, temps, traitement, pictogramme),
les pictogrammes du site, le dessin du set (repris de la pub foot), les décors et les deux prix d'étiquette.
Source unique des chiffres : site/donnees.js. Le script s'arrête en erreur si un prix écrit dans index.html diffère du site.
"""
import json
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ICI = Path(__file__).resolve().parent.parent
REPO = ICI.parent.parent
sys.path.insert(0, str(REPO / "videos" / "2026-10-12_pub-le-dessin" / "outils"))
from preparer_set import contour_moore, lisse, rdp_ferme  # noqa: E402

# ordre du film (BRIEF.md, section 6) : n°, temps, rangée, colonne, id, traitement, pictogramme, ballon
# traitement : detoure, cadre, contact (photo née du seul contact du ballon), croquis (le bob)
FILM = [
    (1, 2, 5, 0, "set-football", "detoure", None, "contact"),
    (2, 6, 5, 1, "tote-sublime", "detoure", None, "contact"),
    (3, 8, 5, 2, "hoodie", "detoure", None, "contact"),
    (4, 9, 5, 3, "chasuble", "cadre", "bib", None),
    (5, 10, 4, 3, "basket-double", "detoure", "tank", None),
    (6, 11, 3, 3, "maillot-cyclisme", "cadre", "tshirt", None),
    (7, 12, 2, 3, "basket-simple", "detoure", "tank", None),
    (8, 13, 2, 2, "running-ml", "cadre", "tshirt", None),
    (9, 14, 2, 1, "survetement", "cadre", "jacket", None),
    (10, 15, 0, 0, "softshell", "contact", None, "contact"),
    (11, 16, 0, 1, "sac-cordon", "detoure", "drawstring", None),
    (12, 17, 0, 2, "veste-matelassee", "cadre", "jacket", None),
    (13, 18, 0, 3, "tote-jute", "detoure", "tote", None),
    (14, 19, 1, 3, "bonnet-polaire", "cadre", "beanie", None),
    (15, 20, 1, 5, "echarpe", "contact", None, "contact"),
    (16, 21, 0, 5, "bob", "croquis", "bob", None),
    (17, 23, 0, 6, "bandana-carre", "detoure", "bandana", None),
    (18, 24, 0, 7, "tour-de-cou", "cadre", "tube", None),
    (19, 25, 0, 8, "bracelet", "detoure", "bracelet", None),
    (20, 26, 1, 8, "bandeau", "cadre", "headband", "contact"),
    (21, 27, 2, 8, "serviette-petanque", "detoure", "towel", None),
    (22, 28, 3, 8, "dossards", "cadre", "racebib", None),
    (23, 29, 4, 8, "manchons-bras", "cadre", "sleeve", None),
    (24, 30, 5, 8, "bandana-triangle", "contact", None, "contact"),
    (25, 31, 5, 7, "bonnet-bain", "cadre", "swimcap", None),
    (26, 32, 5, 6, "drapeau-supporter", "cadre", "flag", None),
    (27, 33, 5, 5, "coussin-stade", "cadre", "stadium", "contact"),
    (28, 34, 4, 5, "manchons-genoux", "cadre", "sleeve", "contact"),
    (29, 35, 3, 5, "tapis-yoga", "cadre", "yoga", "contact"),
    (30, 36, 2, 5, "boxer", "detoure", "boxer", "contact"),
]
# héros tracés au contour exact, simplifié à 20 points au plus
HEROS = {"tote-sublime", "hoodie"}
# cercle au feutre autour du manchon droit, en pixels de la photo 640 x 800
CERCLES = {"manchons-bras": {"c": [432, 344], "r": [86, 74]}}
# prix d'étiquette : (id, ligne du tableau de prix, colonne)
ETIQUETTES = {"set": ("set-football", "Set maillot + short", "30 pcs"), "tote": ("tote-sublime", "Tissu 60 g/m²", "100 pcs")}


def prix_fr(v):
    return f"{v:.2f}".replace(".", ",")


def contour_simple(pid, nmax=20):
    a = np.asarray(Image.open(ICI / "assets" / "produits" / f"{pid}-detoure.png"))[..., 3] > 127
    pts = np.array(contour_moore(a), float)
    pts = lisse(pts, 3)
    eps = 2.0
    while True:
        q = rdp_ferme(pts, eps)
        if len(q) <= nmax:
            return [[round(x, 1), round(y, 1)] for x, y in q]
        eps *= 1.25


def main():
    s = (REPO / "site" / "donnees.js").read_text()
    site = {p["id"]: p for p in json.loads(s[s.index("{"): s.rindex("}") + 1])["products"]}
    fiches = json.loads((ICI / "assets" / "produits.json").read_text())
    sprite = (ICI / "assets" / "icones-site.svg").read_text()
    icones = {m.group(1): m.group(2) for m in re.finditer(r'<symbol id="i-([a-z-]+)" viewBox="0 0 48 48">(.*?)</symbol>', sprite, re.S)}

    produits = []
    for n, temps, r, c, pid, mode, picto, ballon in FILM:
        f = fiches[pid]
        e = {"n": n, "temps": temps, "r": r, "c": c, "id": pid, "nom": site[pid]["name"], "mode": mode, "picto": picto, "ballon": ballon,
             "detoure": f["detoure"], "photo": None if pid == "bob" else pid}
        if pid in HEROS:
            e["contour"] = contour_simple(pid)
        if pid in CERCLES:
            e["cercle"] = CERCLES[pid]
        if picto and picto not in icones:
            raise SystemExit(f"pictogramme absent du sprite : {picto}")
        produits.append(e)
    assert len(produits) == 30 and len({p["id"] for p in produits}) == 30

    prix = {}
    for cle, (pid, ligne, col) in ETIQUETTES.items():
        t = site[pid]["tables"][0]
        row = next(r for r in t["rows"] if r["label"] == ligne)
        v = row["cells"][t["heads"].index(col)]
        prix[cle] = {"valeur": v, "texte": prix_fr(v), "qte": int(col.split()[0]), "transport": site[pid]["transport"]}
    # contrôle : les prix écrits dans la composition sont ceux du site
    html = (ICI / "index.html").read_text() if (ICI / "index.html").exists() else ""
    for cle, p in prix.items():
        if html and f"{p['texte']}&nbsp;€" not in html:
            raise SystemExit(f"prix {cle} {p['texte']} € absent de index.html : la composition diffère du site")
        if p["transport"] != "inclus":
            raise SystemExit(f"transport du prix {cle} : {p['transport']}")

    dessin = json.loads((REPO / "videos" / "2026-10-12_pub-le-dessin" / "assets" / "dessin.json").read_text())
    (ICI / "assets" / "dessin.json").write_text(json.dumps(dessin))
    decors = json.loads((ICI / "assets" / "decors.json").read_text())
    out = {"produits": produits, "icones": {k: icones[k] for k in sorted({p["picto"] for p in produits if p["picto"]})}, "prix": prix}
    js = ("window.CATALOGUE = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n"
          + "window.DESSIN = " + json.dumps(dessin, separators=(",", ":")) + ";\n"
          + "window.DECORS = " + json.dumps(decors, separators=(",", ":")) + ";\n")
    (ICI / "assets" / "donnees.js").write_text(js)
    print(len(produits), "produits,", len(out["icones"]), "pictogrammes, prix", {k: v["texte"] for k, v in prix.items()}, len(js), "octets")
    for p in produits:
        if "contour" in p:
            print(p["id"], len(p["contour"]), "points")


if __name__ == "__main__":
    main()
