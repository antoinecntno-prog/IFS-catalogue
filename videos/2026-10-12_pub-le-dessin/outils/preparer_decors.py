"""Prépare les décors photo de la pub « Le dessin » à partir des photos fournies (sources/).

- feuille-dos.png / feuille-recto.png : la feuille de match détourée de la table, papier étalonné en blanc.
  Le dos efface l'impression et ne garde qu'une trace inversée à 5 % (transparence du recto).
- feutre.png : le feutre sans capuchon, détouré, pointe en haut à gauche.
- cintre.png : le cintre en bois détouré.
- table.jpg, gobelets.png : la buvette (fond) et les gobelets (premier plan flou).
- vestiaire-mur.jpg, vestiaire-barre.png, patere.png, vestiaire-banc.png : le vestiaire en calques.
Les positions utiles (pointe du feutre, crochet du cintre, patères, banc) partent dans assets/decors.json.
"""
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

ICI = Path(__file__).resolve().parent.parent
SRC = ICI / "sources"
OUT = ICI / "assets"
INFO = {}


def arr(im):
    return np.asarray(im).astype(float)


def img(a, mode=None):
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), mode).copy()


def connexe(binaire, graine):
    im = img(np.where(binaire, 255, 0))
    ImageDraw.floodfill(im, graine, 128)
    return np.array(im) == 128


def maxf(a, r):
    return arr(img(a).filter(ImageFilter.MaxFilter(2 * r + 1)))


def minf(a, r):
    return arr(img(a).filter(ImageFilter.MinFilter(2 * r + 1)))


def flou(a, r):
    return arr(img(a).filter(ImageFilter.GaussianBlur(r)))


# ---------------------------------------------------------------- feuille de match
def feuille():
    im = Image.open(SRC / "src-feuille.jpg").convert("RGB")
    rgb = arr(im)
    lum = rgb.mean(axis=2)
    sat = rgb.max(axis=2) - rgb.min(axis=2)
    papier = (lum > 175) & (sat < 28)
    papier = connexe(papier, (560, 1000)) | connexe(papier, (560, 1600))
    ys, xs = np.nonzero(papier)
    # coins : rectangle presque droit
    x0, x1 = np.percentile(xs, 0.2), np.percentile(xs, 99.8)
    y0, y1 = np.percentile(ys, 0.2), np.percentile(ys, 99.8)
    x0, y0, x1, y1 = int(x0) + 3, int(y0) + 3, int(x1) - 3, int(y1) - 3
    crop = rgb[y0:y1, x0:x1]
    h, w, _ = crop.shape
    g = crop.mean(axis=2)
    # éclairage du papier : fermeture (max puis min) à grande échelle, calculée en quart de taille
    petit = img(g).resize((w // 4, h // 4), Image.BILINEAR)
    p = arr(petit)
    p = arr(img(p).filter(ImageFilter.MaxFilter(13)).filter(ImageFilter.MinFilter(5)))
    p = flou(p, 6)
    fondg = arr(img(p).resize((w, h), Image.BICUBIC))
    fondg = np.maximum(fondg, g)  # jamais plus sombre que le pixel
    encre = np.clip((fondg - g - 10) / 30, 0, 1)
    encre = np.maximum(encre, maxf(encre * 255, 1) / 255 * 0.85)
    # étalonnage blanc : le papier passe à 255, la texture fine reste
    gain = 252.0 / np.maximum(fondg, 1)
    blanc = np.clip(crop * gain[..., None], 0, 255)
    # léger grain du papier conservé, impression retirée
    g_net = np.where(encre > 0.02, fondg, g)
    g_net = np.where(maxf(encre * 255, 2) > 5, flou(g_net, 1.5), g_net)
    grain = (g_net - flou(g_net, 2)) * gain
    dos = np.clip(252 + grain[..., None] * 0.6, 0, 255) * np.ones(3)
    # pli horizontal : ombre douce gardée depuis l'éclairage d'origine
    pli = fondg / np.maximum(flou(fondg, 40), 1)
    dos = dos * np.clip(pli, 0.9, 1.02)[..., None]
    # transparence du recto, inversée de gauche à droite, à 2,8 %
    # seul le quadrillage traverse : titre et en-têtes retirés de la trace
    trace = encre.copy()
    trace[: int(0.236 * h)] = 0
    trace = flou(trace[:, ::-1] * 255, 1.2) / 255
    dos = dos * (1 - 0.028 * trace)[..., None]
    recto = blanc
    # bords : alpha doux de 2 px
    a = np.ones((h, w))
    for k in range(3):
        v = (k + 1) / 4
        a[k, :] = np.minimum(a[k, :], v)
        a[-1 - k, :] = np.minimum(a[-1 - k, :], v)
        a[:, k] = np.minimum(a[:, k], v)
        a[:, -1 - k] = np.minimum(a[:, -1 - k], v)
    img(np.dstack([dos, a * 255]), "RGBA").save(OUT / "feuille-dos.png", optimize=True)
    img(np.dstack([recto, a * 255]), "RGBA").save(OUT / "feuille-recto.png", optimize=True)
    INFO["feuille"] = {"taille": [w, h], "source_bbox": [x0, y0, x1, y1]}
    print("feuille", w, h)


# ---------------------------------------------------------------- objets sur fond blanc
def detoure_blanc(rgb, seuil_bas=18, seuil_haut=48, graines=()):
    fond = np.median(np.concatenate([rgb[:10].reshape(-1, 3), rgb[-10:].reshape(-1, 3)]), axis=0)
    d = np.max(np.abs(rgb - fond), axis=2)
    fb = d < seuil_bas + 6
    h, w = d.shape
    c = connexe(fb, (2, 2)) | connexe(fb, (w - 3, h - 3)) | connexe(fb, (w - 3, 2)) | connexe(fb, (2, h - 3))
    for gr in graines:
        if fb[gr[1], gr[0]]:
            c |= connexe(fb, gr)
    plein = ~c
    doux = np.clip((d - seuil_bas) / (seuil_haut - seuil_bas), 0, 1)
    bande = (maxf(c * 255, 2) > 127) & (maxf(plein * 255, 2) > 127)
    a = np.where(bande, doux, plein.astype(float))
    a3 = a[..., None]
    fg = np.where(a3 > 0.05, (rgb - (1 - a3) * fond) / np.maximum(a3, 0.05), rgb)
    return np.clip(fg, 0, 255), a


def feutre():
    rgb = arr(Image.open(SRC / "src-feutre.jpg").convert("RGB"))
    fg, a = detoure_blanc(rgb, 22, 60)
    # corps du feutre seul : composante qui contient la pointe
    solide = a > 0.5
    corps = connexe(solide, (700, 1050))
    zone = maxf(corps * 255, 3) > 127
    a = np.where(zone, a, 0)
    ys, xs = np.nonzero(a > 0.5)
    # pointe : le point le plus bas à gauche
    k = np.argmin(xs - ys * 0.0 + (2000 - ys) * 0.0 + xs)
    tip = (float(xs[k]), float(ys[k]))
    # extrémité opposée : point le plus à droite
    k2 = np.argmax(xs)
    tail = (float(xs[k2]), float(ys[k2]))
    angle = math.degrees(math.atan2(tail[1] - tip[1], tail[0] - tip[0]))
    x0, y0, x1, y1 = xs.min() - 6, ys.min() - 6, xs.max() + 7, ys.max() + 7
    rgba = img(np.dstack([fg, a * 255]), "RGBA").crop((x0, y0, x1, y1))
    # orientation : corps vers le bas à droite (main droite), angle cible 38°
    rot = angle - 38
    big = rgba.rotate(rot, resample=Image.BICUBIC, expand=True)
    # position de la pointe après rotation
    cx, cy = rgba.width / 2, rgba.height / 2
    tx, ty = tip[0] - x0 - cx, tip[1] - y0 - cy
    r = math.radians(-rot)
    nx = tx * math.cos(r) - ty * math.sin(r) + big.width / 2
    ny = tx * math.sin(r) + ty * math.cos(r) + big.height / 2
    bb = big.getbbox()
    big = big.crop(bb)
    nx, ny = nx - bb[0], ny - bb[1]
    big = big.resize((big.width // 2, big.height // 2), Image.LANCZOS)
    big.save(OUT / "feutre.png", optimize=True)
    INFO["feutre"] = {"taille": [big.width, big.height], "pointe": [round(nx / 2, 1), round(ny / 2, 1)]}
    print("feutre", INFO["feutre"], "angle source", round(angle, 1))


def cintre():
    rgb = arr(Image.open(SRC / "src-cintre.jpg").convert("RGB"))
    fg, a = detoure_blanc(rgb, 14, 40, graines=[(960, 1180), (700, 1240), (1250, 1240)])
    ys, xs = np.nonzero(a > 0.5)
    x0, y0, x1, y1 = xs.min() - 4, ys.min() - 4, xs.max() + 5, ys.max() + 5
    rgba = img(np.dstack([fg, a * 255]), "RGBA").crop((x0, y0, x1, y1))
    rgba = rgba.resize((rgba.width // 2, rgba.height // 2), Image.LANCZOS)
    rgba.save(OUT / "cintre.png", optimize=True)
    # haut du crochet et épaules (pour poser le maillot)
    al = np.asarray(rgba)[..., 3] > 128
    yy, xx = np.nonzero(al)
    top = (float(xx[np.argmin(yy)]), float(yy.min()))
    INFO["cintre"] = {"taille": [rgba.width, rgba.height], "crochet": top}
    print("cintre", INFO["cintre"])


# ---------------------------------------------------------------- buvette
def buvette():
    im = Image.open(SRC / "src-buvette.jpg").convert("RGB")
    im.save(OUT / "table.jpg", quality=88)
    rgb = arr(im)
    # gobelets empilés à gauche de la thermos : découpe à bords doux, flou fort en CSS
    x0, y0, x1, y1 = 40, 1080, 150, 1282
    c = rgb[y0:y1, x0:x1]
    h, w, _ = c.shape
    lum = c.mean(axis=2)
    sat = c.max(axis=2) - c.min(axis=2)
    gob = (lum > 170) & (sat < 40)
    a = flou(gob * 255.0, 3) / 255
    img(np.dstack([c, a * 255]), "RGBA").save(OUT / "gobelets.png", optimize=True)
    INFO["gobelets"] = {"taille": [w, h]}


# ---------------------------------------------------------------- vestiaire
def vestiaire():
    rgb = arr(Image.open(SRC / "src-vestiaire.jpg").convert("RGB"))
    H, W, _ = rgb.shape
    PX, PY = 146, 153  # périodes du carrelage (px source), joints mesurés à x 577/723/869 et y 862/1015
    BAR0, BAR1 = 668, 752  # barre en bois
    HOOK0 = 612  # haut des boucles des patères
    # 1) mur sans barre ni patères : on recopie la rangée de carreaux une période plus bas
    mur = rgb.copy()
    Y0, Y1 = 598, 778  # barre et boucles des patères, avec l'ombre portée sous la barre
    mur[Y0:Y1, 140:] = rgb[Y0 + PY:Y1 + PY, 140:]
    # 2) extension vers la droite : bande propre d'une période de carrelage, répétée (carreaux, plafond, banc et sol)
    bande = mur[:, 577:577 + PX].copy()
    # rampe par ligne : le bord droit de la bande rejoint son bord gauche, les copies se raccordent sans couture
    def lisse_v(v, k=15):
        noyau = np.ones(k) / k
        return np.stack([np.convolve(np.pad(v[:, c], k // 2, mode="edge"), noyau, mode="valid") for c in range(3)], axis=1)
    gauche_c = lisse_v(bande[:, :3].mean(axis=1))
    droite_c = lisse_v(bande[:, -3:].mean(axis=1))
    rampe = np.linspace(0, 1, PX)[None, :, None]
    bande = bande + (gauche_c - droite_c)[:, None, :] * rampe
    n = 10
    ext = np.concatenate([mur[:, :577]] + [bande] * n, axis=1)
    # plafond : on prolonge vers le haut de 140 px par miroir pour le zoom arrière
    haut = ext[:140][::-1]
    ext = np.concatenate([haut, ext], axis=0)
    off_y = 140
    img(ext).save(OUT / "vestiaire-mur.jpg", quality=86)
    # 3) barre : bout gauche d'origine puis tronçons propres, en miroir un sur deux
    gauche = rgb[BAR0:BAR1, 270:380]
    tron = rgb[BAR0:BAR1, 470:770]
    morceaux = [gauche]
    total = ext.shape[1] - 270
    k = 0
    while sum(m.shape[1] for m in morceaux) < total:
        morceaux.append(tron if k % 2 == 0 else tron[:, ::-1])
        k += 1
    barre = np.concatenate(morceaux, axis=1)[:, :total]
    a = np.ones(barre.shape[:2])
    # bout gauche : alpha selon le bois (le carrelage autour du bout reste transparent)
    lum = barre.mean(axis=2)
    sat = barre.max(axis=2) - barre.min(axis=2)
    a[:, :40] = np.clip((sat[:, :40] - 30) / 30, 0, 1)
    a[:2, :] *= 0.5
    a[-2:, :] *= 0.5
    img(np.dstack([barre, a * 255]), "RGBA").save(OUT / "vestiaire-barre.png", optimize=True)
    # 4) patère : matte par différence avec une plaque propre (même zone, une période de carrelage à droite)
    x0, y0, x1, y1 = 378, 612, 462, 750
    c = rgb[y0:y1, x0:x1]
    plaque = rgb[y0:y1, x0 + PX:x1 + PX]
    d = np.sqrt(((c - plaque) ** 2).sum(axis=2))
    a = np.clip((d - 14) / 26, 0, 1)
    # sur la barre, le bois est saturé et le métal gris : matte par saturation
    sat = c.max(axis=2) - c.min(axis=2)
    rb0, rb1 = BAR0 - y0 + 9, BAR1 - y0 + 2
    a[rb0:rb1] = np.clip((52 - sat[rb0:rb1]) / 22, 0, 1)
    a = arr(img(a * 255).filter(ImageFilter.MedianFilter(3))) / 255
    # bord haut de la barre (lignes 58 à 65) : seuls les deux fils de la boucle descendent jusqu'à la platine
    for r in range(58, 66):
        u = (r - 57) / 9
        lx, rx = 22 + 6 * u, 60 - 5 * u
        ligne = np.zeros(a.shape[1])
        cols = np.arange(a.shape[1])
        ligne[(cols >= lx) & (cols <= lx + 4)] = 1
        ligne[(cols >= rx - 4) & (cols <= rx)] = 1
        a[r] = ligne
    m = connexe(a > 0.5, (420 - x0, 700 - y0))
    a = np.where(maxf(m * 255, 2) > 127, a, 0)
    a3 = a[..., None]
    fgp = np.where(a3 > 0.08, (c - (1 - a3) * plaque) / np.maximum(a3, 0.08), c)
    img(np.dstack([np.clip(fgp, 0, 255), a * 255]), "RGBA").save(OUT / "patere.png", optimize=True)
    # 5) banc : bande du bas, bord haut adouci
    B0 = 1548
    banc = ext[off_y + B0:, :]
    ab = np.ones(banc.shape[:2])
    ramp = np.clip(np.arange(banc.shape[0]) / 26, 0, 1)
    ab *= ramp[:, None]
    img(np.dstack([banc, ab * 255]), "RGBA").save(OUT / "vestiaire-banc.png", optimize=True)
    INFO["vestiaire"] = {
        "mur": [ext.shape[1], ext.shape[0]],
        "off_y": off_y,
        "barre": {"x": 270, "y": BAR0 + off_y, "w": barre.shape[1], "h": barre.shape[0]},
        "patere": {"w": x1 - x0, "h": y1 - y0, "crochet_bas": [420 - x0, 735 - y0]},
        "banc": {"y": B0 + off_y, "w": banc.shape[1], "h": banc.shape[0]},
        "patere_x_source": [420, 815],
        "periode": [PX, PY],
    }
    print("vestiaire", INFO["vestiaire"])


if __name__ == "__main__":
    feuille()
    feutre()
    cintre()
    buvette()
    vestiaire()
    (OUT / "decors.json").write_text(json.dumps(INFO, indent=1))
