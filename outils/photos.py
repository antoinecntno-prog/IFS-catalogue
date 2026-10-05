#!/usr/bin/env python3
"""Photos du catalogue : conversion, nom unique et branchement sur la fiche.

Chaque photo est enregistrée sous un nom qui contient une empreinte de son contenu
(set-football-3f9a1c2e.webp). Une photo remplacée change donc de nom : aucun navigateur
ne peut resservir l'ancienne version gardée en cache.

Ajouter ou remplacer une photo :
    python3 outils/photos.py ajouter image.png set-football          photo principale
    python3 outils/photos.py ajouter dos.png set-football --vue 2    deuxième vue de la galerie
    python3 outils/photos.py ajouter image.png bob --illustration    photo de banque ou d'IA,
                                                                     garde la mention « Photo d'illustration »

Sans --illustration, la photo est une photo réelle de Contino Sport : la fiche n'affiche plus
la mention « Photo d'illustration ».

L'image source est recadrée au centre en 4:5, puis enregistrée en WebP 640 × 800 et 360 × 450.
Après un ajout, régénérer le fichier unique : python3 outils/fichier-unique.py
"""
import argparse
import hashlib
import io
import json
import re
import sys
from pathlib import Path

from PIL import Image, ImageFilter

RACINE = Path(__file__).resolve().parent.parent
SITE = RACINE / "site"
IMG = SITE / "img"
DONNEES = SITE / "donnees.js"
TAILLES = [(640, 800, "", 84), (360, 450, "-360", 80)]


def lire():
    texte = DONNEES.read_text(encoding="utf-8")
    m = re.search(r"const DATA = (\{.*\});\s*$", texte, re.S)
    if not m:
        sys.exit("site/donnees.js : « const DATA = {...}; » introuvable")
    return texte[: m.start()], json.loads(m.group(1))


def ecrire(entete, data):
    DONNEES.write_text(entete + "const DATA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")


def webp(im, w, h, q):
    buf = io.BytesIO()
    im.resize((w, h), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=0.6, percent=35, threshold=2)).save(buf, "WEBP", quality=q, method=6)
    return buf.getvalue()


def recadrer_45(im):
    im = im.convert("RGB")
    w, h = im.size
    if w * 5 > h * 4:
        nw = h * 4 // 5
        x = (w - nw) // 2
        return im.crop((x, 0, x + nw, h))
    nh = w * 5 // 4
    y = (h - nh) // 2
    return im.crop((0, y, w, y + nh))


def enregistrer(fichiers, base):
    """fichiers : {suffixe: octets}. Le nom porte l'empreinte de la version 640 px."""
    empreinte = hashlib.sha1(fichiers[""]).hexdigest()[:8]
    nom = f"{base}-{empreinte}"
    for suf, octets in fichiers.items():
        (IMG / f"{nom}{suf}.webp").write_bytes(octets)
    return nom


def supprimer(nom):
    if not nom:
        return
    for suf in ("", "-360"):
        f = IMG / f"{nom}{suf}.webp"
        if f.exists():
            f.unlink()


def utilisees(data):
    noms = set()
    for p in data["products"]:
        if p.get("photo"):
            noms.add(p["photo"])
        noms.update(p.get("more", []))
    return noms


def ajouter(args):
    entete, data = lire()
    p = next((x for x in data["products"] if x["id"] == args.produit), None)
    if not p:
        sys.exit(f"produit inconnu : {args.produit}. Identifiants : " + ", ".join(x["id"] for x in data["products"]))
    im = recadrer_45(Image.open(args.image))
    if im.width < 640:
        print(f"Attention : l'image fait {im.width} px de large après recadrage, moins que les 640 px affichés.")
    base = args.produit if args.vue == 1 else f"{args.produit}-v{args.vue}"
    nom = enregistrer({suf: webp(im, w, h, q) for w, h, suf, q in TAILLES}, base)
    if args.vue == 1:
        ancien = p.get("photo")
        p["photo"] = nom
    else:
        plus = p.setdefault("more", [])
        i = args.vue - 2
        if i > len(plus):
            sys.exit(f"vue {args.vue} : ajouter d'abord la vue {len(plus) + 2}")
        ancien = plus[i] if i < len(plus) else None
        if i < len(plus):
            plus[i] = nom
        else:
            plus.append(nom)
    if args.illustration:
        p.pop("reel", None)
    else:
        p["reel"] = True
    ecrire(entete, data)
    if ancien and ancien != nom and ancien not in utilisees(data):
        supprimer(ancien)
    print(f"{args.produit}, vue {args.vue} : img/{nom}.webp" + ("" if args.illustration else " (photo réelle, sans mention d'illustration)"))


def migrer(args):
    """Donne un nom à empreinte aux photos existantes, sans les réencoder."""
    entete, data = lire()
    renommes = {}
    for nom in sorted(utilisees(data)):
        if re.search(r"-[0-9a-f]{8}$", nom):
            continue
        fichiers = {suf: (IMG / f"{nom}{suf}.webp").read_bytes() for _, _, suf, _ in TAILLES}
        base = re.sub(r"-(\d)$", r"-v\1", nom)
        renommes[nom] = enregistrer(fichiers, base)
        supprimer(nom)
    for p in data["products"]:
        if p.get("photo") in renommes:
            p["photo"] = renommes[p["photo"]]
        if p.get("more"):
            p["more"] = [renommes.get(n, n) for n in p["more"]]
    ecrire(entete, data)
    for ancien, nouveau in renommes.items():
        print(f"{ancien} -> {nouveau}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("ajouter", help="ajoute ou remplace une photo d'un produit")
    a.add_argument("image")
    a.add_argument("produit")
    a.add_argument("--vue", type=int, default=1, help="1 = photo principale, 2 et plus = vues de la galerie")
    a.add_argument("--illustration", action="store_true", help="photo de banque ou d'IA : garde la mention « Photo d'illustration »")
    a.set_defaults(fn=ajouter)
    m = sub.add_parser("migrer", help="donne un nom à empreinte aux photos existantes")
    m.set_defaults(fn=migrer)
    args = ap.parse_args()
    args.fn(args)


if __name__ == "__main__":
    main()
