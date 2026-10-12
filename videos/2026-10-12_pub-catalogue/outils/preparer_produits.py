"""Prépare les 30 photos produits du catalogue pour la pub : copie de la photo retenue, détourage des photos sur fond uni,
contour vectorisé du produit détouré. Sources : site/donnees.js et site/img (640 x 800 px).

Photos retenues : vues sans nom de club pour les deux maillots de basket (accord des clubs à confirmer), set football sans sponsors.
Sortie : assets/produits/<id>.webp, assets/produits/<id>-detoure.png (fond uni seulement), assets/produits.json.
"""
import json
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ICI = Path(__file__).resolve().parent.parent
REPO = ICI.parent.parent
sys.path.insert(0, str(REPO / "videos" / "2026-10-12_pub-le-dessin" / "outils"))
from preparer_set import chemin, contour_moore, lisse, rdp_ferme  # noqa: E402

PHOTO = {"set-football": "set-football-v3-68435e45", "basket-double": "basket-double-v2-3533a464", "basket-simple": "basket-simple-v2-ef825ce7"}
SORTIE = ICI / "assets" / "produits"


def connexe(binaire, graine):
    im = Image.fromarray(np.where(binaire, 255, 0).astype(np.uint8)).copy()
    ImageDraw.floodfill(im, graine, 128)
    return np.array(im) == 128


def fond_uni(rgb):
    ring = np.concatenate([rgb[:10].reshape(-1, 3), rgb[-10:].reshape(-1, 3), rgb[:, :10].reshape(-1, 3), rgb[:, -10:].reshape(-1, 3)])
    lum, sat = ring.mean(1), ring.max(1) - ring.min(1)
    return lum.std() < 14 and sat.mean() < 18 and lum.mean() > 150


def detoure(rgb):
    h, w, _ = rgb.shape
    lignes = np.array([np.median(np.concatenate([rgb[y, :12], rgb[y, -12:]]), axis=0) for y in range(h)])
    fond = np.repeat(lignes[:, None, :], w, axis=1)
    dist = np.max(np.abs(rgb - fond), axis=2)
    fb = dist < 24
    c = np.zeros_like(fb)
    for g in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 2), (w // 2, h - 3), (2, h // 2), (w - 3, h // 2)]:
        if fb[g[1], g[0]] and not c[g[1], g[0]]:
            c |= connexe(fb, g)
    plein = ~c
    plein = np.array(Image.fromarray(plein.astype(np.uint8) * 255).filter(ImageFilter.MedianFilter(5))) > 127
    doux = np.clip((dist - 9) / 26, 0, 1)
    bord = np.array(Image.fromarray(plein.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(5))) > 127
    bord &= ~(np.array(Image.fromarray(plein.astype(np.uint8) * 255).filter(ImageFilter.MinFilter(5))) > 127)
    a = np.where(bord, doux, plein.astype(float))
    a3 = a[..., None]
    fg = np.clip(np.where(a3 > 0.05, (rgb - (1 - a3) * fond) / np.maximum(a3, 0.05), rgb), 0, 255)
    return fg, a, plein


def main():
    s = (REPO / "site" / "donnees.js").read_text()
    data = json.loads(s[s.index("{"): s.rindex("}") + 1])
    SORTIE.mkdir(parents=True, exist_ok=True)
    out = {}
    for p in data["products"]:
        photo = PHOTO.get(p["id"], p["photo"])
        src = REPO / "site" / "img" / f"{photo}.webp"
        shutil.copy(src, SORTIE / f"{p['id']}.webp")
        rgb = np.asarray(Image.open(src).convert("RGB")).astype(float)
        fiche = {"photo": photo, "illustration": not p.get("reel"), "uni": bool(fond_uni(rgb))}
        if fiche["uni"]:
            fg, a, plein = detoure(rgb)
            Image.fromarray(np.dstack([fg, a * 255]).astype(np.uint8), "RGBA").save(SORTIE / f"{p['id']}-detoure.png", optimize=True)
            ys, xs = np.nonzero(plein)
            fiche["bbox"] = [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1]
            # contour de la plus grande pièce (le plus grand composant)
            pts = np.array(contour_moore(plein), float)
            fiche["contour"] = chemin(rdp_ferme(lisse(pts, 3), 1.4), True)
        out[p["id"]] = fiche
        print(p["id"], photo, "uni" if fiche["uni"] else "cadre", "illustration" if fiche["illustration"] else "")
    (ICI / "assets" / "produits.json").write_text(json.dumps(out, indent=1))


if __name__ == "__main__":
    main()
