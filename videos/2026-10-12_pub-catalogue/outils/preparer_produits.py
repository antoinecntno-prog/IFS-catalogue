"""Prépare les 30 photos produits du catalogue pour la pub : copie de la photo retenue, détourage des photos de studio,
contour vectorisé de chaque produit détouré. Sources : site/donnees.js et site/img (640 x 800 px).

Photos retenues : vues sans nom de club pour les deux maillots de basket (accord des clubs à confirmer), set football sans sponsors.
Détourage : fond de studio modélisé par une surface polynomiale (le gris des photos fait un dégradé), ombres neutres retirées,
masque du modèle u2net de `hyperframes remove-background` ajouté pour les blancs des maillots de basket, trop proches du fond.
Sortie : assets/produits/<id>.webp, assets/produits/<id>-detoure.png, assets/produits.json.

Usage : python3 outils/preparer_produits.py [chemin de la commande hyperframes]
"""
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

ICI = Path(__file__).resolve().parent.parent
REPO = ICI.parent.parent
sys.path.insert(0, str(REPO / "videos" / "2026-10-12_pub-le-dessin" / "outils"))
from preparer_set import chemin, contour_moore, lisse, rdp_ferme  # noqa: E402

PHOTO = {"set-football": "set-football-v3-68435e45", "basket-double": "basket-double-v2-3533a464", "basket-simple": "basket-simple-v2-ef825ce7"}
# photos de studio : le produit seul sur fond gris
DETOURES = ["set-football", "basket-double", "basket-simple", "hoodie", "serviette-petanque", "sac-cordon", "tote-sublime", "tote-jute",
            "bandana-carre", "bracelet", "boxer"]
# fond visible à travers le produit (anses, boucles des bracelets)
TROUS = {"tote-sublime", "tote-jute", "bracelet"}
# seuil du masque u2net : l'ourlet blanc du basket simple sort à faible confiance
U2NET = {"basket-double": 0.5, "basket-simple": 0.12}
SORTIE = ICI / "assets" / "produits"


def termes(h, w, deg=3):
    yy, xx = np.mgrid[0:h, 0:w]
    xx, yy = xx / w * 2 - 1, yy / h * 2 - 1
    return np.stack([xx ** i * yy ** j for i in range(deg + 1) for j in range(deg + 1 - i)], -1)


def fond(rgb, masque, T):
    """Surface polynomiale de degré 3 ajustée sur les pixels de fond, par canal."""
    ys, xs = np.nonzero(masque)
    sel = np.random.default_rng(0).choice(len(ys), min(len(ys), 20000), replace=False)
    A = T[ys[sel], xs[sel]]
    m = np.zeros(rgb.shape)
    for c in range(3):
        co, *_ = np.linalg.lstsq(A, rgb[ys[sel], xs[sel], c], rcond=None)
        m[..., c] = T @ co
    return m


def detoure(rgb, coupe=None, trous_ok=False, seuil=16):
    h, w, _ = rgb.shape
    T = termes(h, w)
    bord = np.zeros((h, w), bool)
    bord[:10] = bord[-10:] = True
    bord[:, :10] = bord[:, -10:] = True
    if coupe is not None:
        bord &= coupe
    m = fond(rgb, bord, T)
    grands = np.zeros((h, w), bool)
    for _ in range(3):
        d = np.abs(rgb - m).max(2)
        # ombre neutre : le pixel vaut k fois le fond, avec k entre 0,55 et 1
        k = (rgb * m).sum(2) / np.maximum((m * m).sum(2), 1)
        ombre = (k > 0.55) & (k < 1.02) & (np.abs(rgb - k[..., None] * m).max(2) < 9)
        cand = (d < seuil) | ombre
        if coupe is not None:
            cand &= coupe
        lab, _ = ndi.label(cand)
        touche = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
        bg = np.isin(lab, touche[touche > 0])
        if trous_ok:
            lab2, n2 = ndi.label((d < seuil * 0.75) & ~bg)
            tailles = ndi.sum(np.ones_like(d), lab2, range(1, n2 + 1))
            grands = np.isin(lab2, 1 + np.nonzero(tailles > 600)[0])
            bg |= grands
        m = fond(rgb, bg & (d < seuil), T)
    plein = ~bg if coupe is None else ~bg & coupe
    plein = ndi.binary_opening(plein, iterations=2)
    lab, n = ndi.label(plein)
    if n:
        tailles = ndi.sum(plein, lab, range(1, n + 1))
        plein = np.isin(lab, 1 + np.nonzero(tailles > 0.01 * h * w)[0])
    plein = ndi.binary_fill_holes(plein) & ~grands
    return plein, np.abs(rgb - m).max(2), m


def masque_u2net(hf, src):
    with tempfile.TemporaryDirectory() as tmp:
        sortie = Path(tmp) / "m.png"
        subprocess.run(hf + ["remove-background", str(src), "-o", str(sortie)], check=True, capture_output=True)
        return np.asarray(Image.open(sortie).convert("RGBA"))[..., 3] / 255.0


def detoure_produit(pid, src, hf):
    rgb = np.asarray(Image.open(src).convert("RGB")).astype(float)
    h, w, _ = rgb.shape
    coupe = None
    if pid == "tote-jute":
        # le sac est posé sur une étagère en bois de la même couleur : on garde le mur et la base du sac
        im = Image.new("L", (w, h), 0)
        dr = ImageDraw.Draw(im)
        dr.rectangle([0, 0, w, 578], fill=255)
        dr.polygon([(124, 575), (513, 575), (511, 613), (172, 640), (131, 625)], fill=255)
        coupe = np.array(im) > 0
    plein, d, m = detoure(rgb, coupe, pid in TROUS)
    if pid in U2NET:
        sur = (masque_u2net(hf, src) > U2NET[pid]) | (plein & (d > 38))
        sur = ndi.binary_closing(sur, iterations=5, border_value=0)
        plein = ndi.binary_opening(ndi.binary_fill_holes(sur), iterations=2)
    if pid == "tote-sublime":
        # crochet et ombre portée sur le mur : pixels neutres, le sac est bleu et rose
        garde = ndi.binary_opening(plein & ((rgb.max(2) - rgb.min(2)) >= 14), iterations=1)
        lab, n = ndi.label(garde)
        plein = ndi.binary_fill_holes(lab == 1 + np.argmax(ndi.sum(garde, lab, range(1, n + 1)))) & plein
    if pid == "basket-double":
        # trait noir en diagonale dans le coin haut gauche de la photo
        yy, xx = np.mgrid[0:h, 0:w]
        plein &= xx + yy >= 150
    a = ndi.gaussian_filter(plein.astype(float), 0.8)
    a3 = a[..., None]
    fg = np.clip(np.where(a3 > 0.05, (rgb - (1 - a3) * m) / np.maximum(a3, 0.05), rgb), 0, 255)
    Image.fromarray(np.dstack([fg, a * 255]).astype(np.uint8), "RGBA").save(SORTIE / f"{pid}-detoure.png", optimize=True)
    ys, xs = np.nonzero(plein)
    # un contour par pièce (maillot et short, bracelets) : le feutre les trace l'un après l'autre
    lab, n = ndi.label(plein)
    pieces = []
    for i in range(1, n + 1):
        p = lab == i
        if p.sum() > 0.01 * h * w:
            pts = np.array(contour_moore(p), float)
            pieces.append((int(np.nonzero(p)[1].min()), chemin(rdp_ferme(lisse(pts, 3), 1.4), True)))
    pieces.sort()
    return {"bbox": [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1], "contours": [c for _, c in pieces]}


def main():
    hf = sys.argv[1:] or ["npx", "hyperframes"]
    s = (REPO / "site" / "donnees.js").read_text()
    data = json.loads(s[s.index("{"): s.rindex("}") + 1])
    SORTIE.mkdir(parents=True, exist_ok=True)
    out = {}
    for p in data["products"]:
        photo = PHOTO.get(p["id"], p["photo"])
        src = REPO / "site" / "img" / f"{photo}.webp"
        shutil.copy(src, SORTIE / f"{p['id']}.webp")
        fiche = {"photo": photo, "illustration": not p.get("reel"), "detoure": p["id"] in DETOURES}
        if fiche["detoure"]:
            fiche.update(detoure_produit(p["id"], src, hf))
        out[p["id"]] = fiche
        print(p["id"], photo, "détouré" if fiche["detoure"] else "cadre", "illustration" if fiche["illustration"] else "")
    (ICI / "assets" / "produits.json").write_text(json.dumps(out, indent=1))


if __name__ == "__main__":
    main()
