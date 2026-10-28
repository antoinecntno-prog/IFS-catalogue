"""Découpe une planche contact de l'extracteur (4 x 4 cases de 320 x 180) en images,
puis relève les masques : zones non noires, composantes, enveloppe convexe simplifiée.
Coordonnées rendues dans le repère 1920 x 1080 (case x 6).
Usage : python3 planche.py planche.jpg t0 pas dossier_sortie"""
import sys, os, json
import numpy as np
from PIL import Image

X0 = [8, 336, 664, 992]
Y0 = [40, 227, 415, 604]
W, H = 320, 180
ECHELLE = 6


def cases(chemin):
    im = Image.open(chemin).convert("RGB")
    for r in range(4):
        for c in range(4):
            yield im.crop((X0[c], Y0[r], X0[c] + W, Y0[r] + H))


def enveloppe(points):
    pts = sorted(set(map(tuple, points)))
    if len(pts) < 3:
        return pts
    def croix(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    bas, haut = [], []
    for p in pts:
        while len(bas) >= 2 and croix(bas[-2], bas[-1], p) <= 0:
            bas.pop()
        bas.append(p)
    for p in reversed(pts):
        while len(haut) >= 2 and croix(haut[-2], haut[-1], p) <= 0:
            haut.pop()
        haut.append(p)
    return bas[:-1] + haut[:-1]


def aire(poly):
    x = np.array([p[0] for p in poly], float); y = np.array([p[1] for p in poly], float)
    return 0.5 * abs(np.dot(x, np.roll(y, 1)) - np.dot(y, np.roll(x, 1)))


def simplifier(poly, seuil):
    poly = list(poly)
    while len(poly) > 3:
        pertes = []
        for i in range(len(poly)):
            a, b, c = poly[i - 1], poly[i], poly[(i + 1) % len(poly)]
            pertes.append(aire([a, b, c]))
        i = int(np.argmin(pertes))
        if pertes[i] > seuil:
            break
        poly.pop(i)
    return poly


def composantes(masque):
    from scipy import ndimage
    lab, n = ndimage.label(masque)
    out = []
    for k in range(1, n + 1):
        ys, xs = np.where(lab == k)
        if len(xs) < 60:
            continue
        out.append(np.stack([xs, ys], 1))
    return out


def relever(case, seuil_noir=26):
    a = np.asarray(case).astype(int)
    masque = a.max(axis=2) > seuil_noir
    masque[150:180, 0:90] = False  # étiquette de temps de la planche
    from scipy import ndimage
    masque = ndimage.binary_opening(masque, iterations=1)
    formes = []
    for pts in composantes(masque):
        env = enveloppe(pts)
        env = simplifier(env, 18)
        formes.append({"aire": int(len(pts)) * ECHELLE * ECHELLE,
                       "poly": [[int(x * ECHELLE), int(y * ECHELLE)] for x, y in env]})
    formes.sort(key=lambda f: -f["aire"])
    return formes


if __name__ == "__main__":
    chemin, t0, pas, sortie = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
    os.makedirs(sortie, exist_ok=True)
    for i, case in enumerate(cases(chemin)):
        t = round(t0 + i * pas, 3)
        case.save(os.path.join(sortie, f"{t:06.3f}.png"))
        formes = relever(case)
        print(f"{t:6.2f}", json.dumps([f["poly"] for f in formes[:4]]))
