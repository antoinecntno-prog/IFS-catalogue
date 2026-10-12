"""Deux tailles par photo pour la composition : 480 x 600 (vue rapprochée) et 192 x 240 (vue large, évite le moiré).
Photos en cadre en webp, détourés en webp avec transparence. Le bob reste hors du film : sa photo vient d'une banque d'images.
Dossards : flou gaussien de 14 px sur le bandeau de l'inscription « FOULÉES DES SAPINS », tant que la course n'est pas confirmée.
Sortie : assets/tailles/<id>-480.webp, <id>-192.webp, <id>-detoure-480.webp, <id>-detoure-192.webp.
"""
import json
from pathlib import Path

from PIL import Image, ImageFilter

ICI = Path(__file__).resolve().parent.parent
SRC = ICI / "assets" / "produits"
OUT = ICI / "assets" / "tailles"
FLOU_DOSSARDS = (205, 395, 485, 505)
TAILLES = {480: (480, 600), 192: (192, 240)}


def floute(im, boite, rayon=14):
    zone = im.crop(boite).filter(ImageFilter.GaussianBlur(rayon))
    im = im.copy()
    im.paste(zone, boite[:2])
    return im


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    fiches = json.loads((ICI / "assets" / "produits.json").read_text())
    n = 0
    for pid, f in fiches.items():
        if pid == "bob":
            continue
        im = Image.open(SRC / f"{pid}.webp").convert("RGB")
        if pid == "dossards":
            # la bande déborde de 20 px autour du bandeau pour que le flou ne laisse aucune lettre lisible
            im = floute(im, FLOU_DOSSARDS)
        for k, wh in TAILLES.items():
            im.resize(wh, Image.LANCZOS).save(OUT / f"{pid}-{k}.webp", quality=90, method=6)
            n += 1
        if f["detoure"]:
            d = Image.open(SRC / f"{pid}-detoure.png").convert("RGBA")
            for k, wh in TAILLES.items():
                d.resize(wh, Image.LANCZOS).save(OUT / f"{pid}-detoure-{k}.webp", quality=92, method=6)
                n += 1
    print(n, "fichiers dans", OUT)


if __name__ == "__main__":
    main()
