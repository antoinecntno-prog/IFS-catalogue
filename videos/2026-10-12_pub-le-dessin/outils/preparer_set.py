"""Détoure le set football (photo réelle sans sponsors), le découpe en maillot et short,
et vectorise le contour du maillot, celui du short, le bord de la flamme et les deux bandes pour le dessin au feutre.

Entrée : sources/src-set.webp (640 x 800)
Sorties : assets/set-maillot.png, assets/set-short.png, assets/set-complet.png, assets/dessin.json
Coordonnées du JSON : pixels de la photo source (640 x 800).
"""
import json
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ICI = Path(__file__).resolve().parent.parent
SRC = ICI / "sources" / "src-set.webp"
OUT = ICI / "assets"


def masque_connexe(binaire, graine):
    """Composante connexe (4-voisinage) de `binaire` contenant `graine`, par remplissage PIL."""
    im = Image.fromarray(np.where(binaire, 255, 0).astype(np.uint8)).copy()
    ImageDraw.floodfill(im, graine, 128)
    return np.array(im) == 128


def dilate(m, r):
    im = Image.fromarray(m.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(2 * r + 1))
    return np.array(im) > 127


def contour_moore(m):
    """Bord extérieur d'un masque binaire (traçage de Moore), liste de (x, y) dans le sens horaire."""
    h, w = m.shape
    p = np.zeros((h + 2, w + 2), bool)
    p[1:-1, 1:-1] = m
    ys, xs = np.nonzero(p)
    i = np.lexsort((xs, ys))[0]
    start = (xs[i], ys[i])
    voisins = [(-1, 0), (-1, -1), (0, -1), (1, -1), (1, 0), (1, 1), (0, 1), (-1, 1)]
    pts = [start]
    cur = start
    back = 0  # on arrive par la gauche
    for _ in range(200000):
        found = False
        for k in range(8):
            d = (back + 1 + k) % 8
            nx, ny = cur[0] + voisins[d][0], cur[1] + voisins[d][1]
            if p[ny, nx]:
                # la prochaine recherche part du voisin précédant celui trouvé
                back = (d + 4) % 8
                cur = (nx, ny)
                found = True
                break
        if not found or cur == start:
            break
        pts.append(cur)
    return [(x - 1, y - 1) for x, y in pts]


def lisse(pts, n=2, ferme=True):
    a = np.array(pts, float)
    for _ in range(n):
        if ferme:
            a = (np.roll(a, 1, 0) + 2 * a + np.roll(a, -1, 0)) / 4
        else:
            b = a.copy()
            b[1:-1] = (a[:-2] + 2 * a[1:-1] + a[2:]) / 4
            a = b
    return a


def rdp(a, eps):
    if len(a) < 3:
        return a
    d = a[-1] - a[0]
    n = math.hypot(*d) or 1.0
    v = a[1:-1] - a[0]
    dist = np.abs(d[0] * v[:, 1] - d[1] * v[:, 0]) / n
    i = int(np.argmax(dist)) + 1
    if dist[i - 1] > eps:
        return np.vstack([rdp(a[: i + 1], eps)[:-1], rdp(a[i:], eps)])
    return np.vstack([a[0], a[-1]])


def rdp_ferme(a, eps):
    # coupe le contour fermé au point le plus éloigné du premier pour garder deux arcs
    j = int(np.argmax(np.hypot(*(a - a[0]).T)))
    b = np.vstack([rdp(a[: j + 1], eps)[:-1], rdp(np.vstack([a[j:], a[:1]]), eps)[:-1]])
    return b


def chemin(a, ferme):
    """Chemin SVG lissé (Catmull-Rom vers Bézier cubique)."""
    a = np.asarray(a, float)
    n = len(a)
    f = lambda p: f"{p[0]:.1f},{p[1]:.1f}"
    s = [f"M{f(a[0])}"]
    last = n if ferme else n - 1
    for i in range(last):
        p0 = a[(i - 1) % n] if (ferme or i > 0) else a[i]
        p1 = a[i]
        p2 = a[(i + 1) % n]
        p3 = a[(i + 2) % n] if (ferme or i + 2 < n) else a[(i + 1) % n]
        c1 = p1 + (p2 - p0) / 6
        c2 = p2 - (p3 - p1) / 6
        s.append(f"C{f(c1)} {f(c2)} {f(p2)}")
    if ferme:
        s.append("Z")
    return "".join(s)


def longueur(a, ferme):
    b = np.vstack([a, a[:1]]) if ferme else a
    return float(np.sum(np.hypot(*np.diff(b, axis=0).T)))


def main():
    im = Image.open(SRC).convert("RGB")
    rgb = np.asarray(im).astype(float)
    h, w, _ = rgb.shape

    # Fond gris clair : estimé sur les bords de l'image, avec un léger dégradé vertical
    bord = np.concatenate([rgb[:8].reshape(-1, 3), rgb[-8:].reshape(-1, 3), rgb[:, :8].reshape(-1, 3), rgb[:, -8:].reshape(-1, 3)])
    fond = np.median(bord, axis=0)
    lignes = np.array([np.median(np.concatenate([rgb[y, :12], rgb[y, -12:]]), axis=0) for y in range(h)])
    fond_img = np.repeat(lignes[:, None, :], w, axis=1)
    dist = np.max(np.abs(rgb - fond_img), axis=2)

    # Fond connecté aux bords (l'intérieur gris du col reste du tissu)
    fond_bin = dist < 26
    connexe = np.zeros_like(fond_bin)
    for g in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 2), (w // 2, h - 3), (2, h // 2), (w - 3, h // 2)]:
        if fond_bin[g[1], g[0]] and not connexe[g[1], g[0]]:
            connexe |= masque_connexe(fond_bin, g)
    plein = ~connexe
    # Alpha doux sur une bande de 2 px autour du bord
    doux = np.clip((dist - 10) / (34 - 10), 0, 1)
    bande = dilate(connexe, 2) & dilate(plein, 2)
    alpha = np.where(bande, np.maximum(doux, plein * 0.0), plein.astype(float))
    alpha = np.where(plein & ~bande, 1.0, alpha)
    # Décontamination du fond sur les bords
    a3 = alpha[..., None]
    fg = np.where(a3 > 0.04, (rgb - (1 - a3) * fond_img) / np.maximum(a3, 0.04), rgb)
    fg = np.clip(fg, 0, 255)

    solide = alpha > 0.5
    maillot = masque_connexe(solide, (300, 200))
    short = masque_connexe(solide, (320, 600))
    assert not (maillot & short).any(), "maillot et short se touchent"
    # pièces : alpha limité à un voisinage de chaque composante
    zone_m = dilate(maillot, 3)
    zone_s = dilate(short, 3)

    def ecrire(nom, zone):
        a = np.where(zone, alpha, 0)
        rgba = np.dstack([fg, a * 255]).astype(np.uint8)
        Image.fromarray(rgba, "RGBA").save(OUT / nom, optimize=True)

    ecrire("set-maillot.png", zone_m & ~zone_s | (zone_m & maillot))
    ecrire("set-short.png", zone_s & ~maillot)
    ecrire("set-complet.png", zone_m | zone_s)

    # Contours vectoriels
    c_m = np.array(contour_moore(maillot), float)
    c_s = np.array(contour_moore(short), float)
    c_m = rdp_ferme(lisse(c_m, 3), 1.1)
    c_s = rdp_ferme(lisse(c_s, 3), 1.1)

    # Flamme : rouge sur la moitié droite du maillot
    R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    rouge = (R > 110) & (R > 2.0 * G) & (R > 2.0 * B) & maillot
    rouge_lisse = np.array(Image.fromarray(rouge.astype(np.uint8) * 255).filter(ImageFilter.MedianFilter(5))) > 127
    ys_r, xs_r = np.nonzero(rouge_lisse[300:420, 380:460])
    flamme = masque_connexe(rouge_lisse, (int(xs_r[0]) + 380, int(ys_r[0]) + 300))
    c_f_brut = np.array(contour_moore(flamme), float)
    # Bord de la flamme : points du contour rouge qui ne longent pas le bord du maillot
    interieur = ~dilate(~maillot, 5)
    ok = np.array([interieur[int(y), int(x)] for x, y in c_f_brut])
    # plus longue suite circulaire de points intérieurs
    n = len(ok)
    meilleur, deb, run, run_deb = 0, 0, 0, 0
    for i in range(2 * n):
        if ok[i % n]:
            if run == 0:
                run_deb = i
            run += 1
            if run > meilleur and run <= n:
                meilleur, deb = run, run_deb
        else:
            run = 0
    idx = [(deb + k) % n for k in range(meilleur)]
    bord_f = c_f_brut[idx]
    # sens : du col vers l'ourlet (y croissant)
    if bord_f[0][1] > bord_f[-1][1]:
        bord_f = bord_f[::-1]
    bord_f = rdp(lisse(bord_f, 2, ferme=False), 0.9)
    poly_f = rdp_ferme(lisse(c_f_brut, 2), 1.0)

    # Bandes verticales : colonnes rouges à gauche de la flamme
    rows = slice(140, 400)
    frac = rouge[rows, :].mean(axis=0)
    cols = np.nonzero((frac > 0.55) & (np.arange(w) < 320))[0]
    groupes = np.split(cols, np.nonzero(np.diff(cols) > 2)[0] + 1)
    bandes = []
    for g in groupes:
        if len(g) < 5:
            continue
        x0, x1 = int(g[0]), int(g[-1])
        xc = (x0 + x1) / 2
        col = rouge[:, int(round(xc))]
        ys = np.nonzero(col)[0]
        ys = ys[(ys > 20) & (ys < 470)]
        bandes.append({"x0": x0, "x1": x1, "xc": xc, "y0": int(ys.min()), "y1": int(ys.max())})

    def bbox(m):
        ys, xs = np.nonzero(m)
        return [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1]

    data = {
        "taille": [w, h],
        "maillot": {"d": chemin(c_m, True), "pts": c_m.round(1).tolist(), "longueur": longueur(c_m, True), "bbox": bbox(maillot)},
        "short": {"d": chemin(c_s, True), "pts": c_s.round(1).tolist(), "longueur": longueur(c_s, True), "bbox": bbox(short)},
        "flamme_bord": {"d": chemin(bord_f, False), "pts": bord_f.round(1).tolist(), "longueur": longueur(bord_f, False)},
        "flamme_poly": {"d": chemin(poly_f, True)},
        "bandes": bandes,
        "centre_maillot": [float(np.mean(np.nonzero(maillot)[1])), float(np.mean(np.nonzero(maillot)[0]))],
    }
    (OUT / "dessin.json").write_text(json.dumps(data))
    print("maillot", data["maillot"]["bbox"], len(c_m), "pts", round(data["maillot"]["longueur"]))
    print("short", data["short"]["bbox"], len(c_s), "pts", round(data["short"]["longueur"]))
    print("flamme bord", len(bord_f), "pts", round(data["flamme_bord"]["longueur"]), bord_f[0], bord_f[-1])
    print("bandes", bandes)
    print("centre", data["centre_maillot"])


if __name__ == "__main__":
    sys.exit(main())
