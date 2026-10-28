"""Trajectoires de masques pour HyperFrames : enveloppe convexe de la plus grande zone non noire de chaque
image relevée, collée aux bords du cadre, puis rééchantillonnée en N points par angle depuis son centre.
Les clés de chaque plan s'interpolent point par point (interpolation monotone côté composition).
Usage : python3 formes.py dossier sortie.json"""
import sys, os, json, math
import numpy as np
from PIL import Image
from scipy import ndimage
from planche import enveloppe, composantes

N = 96
PLANS = {
    "cuisine": [11.25, 11.5, 11.75, 12.0, 12.25, 12.5, 12.75, 13.0],
    "preuve2": [18.25, 18.5, 18.75, 19.0, 19.25, 19.5, 19.75, 20.0, 20.25, 20.5],
    "nuit": [30.25, 30.5, 30.75, 31.0, 31.25, 31.5, 31.75, 32.0, 32.25, 32.5, 32.75, 33.0, 33.25],
    "fermeture": [33.5, 33.75, 34.0, 34.25, 34.5, 34.75, 35.0, 35.25, 35.5, 35.75, 36.0, 36.25],
}
# Clés posées à la main quand l'image Apple mêle un objet de premier plan (capot qui passe à 11,0 s).
MAIN = {"cuisine": {11.0: [[0, 0], [942, 0], [1450, 270], [1500, 790], [984, 1080], [0, 1080]]}}


def coller(p):
    x, y = p
    x = -30 if x <= 12 else (1950 if x >= 1902 else x)
    y = -30 if y <= 12 else (1110 if y >= 1066 else y)
    return [x, y]


def masque(chemin, haut_seul=None):
    a = np.asarray(Image.open(chemin)).astype(int)
    m = a.max(axis=2) > 26
    m[150:180, 0:90] = False
    m = ndimage.binary_opening(m, iterations=1)
    zones = composantes(m)
    pts = max(zones, key=len)
    env = [[x * 6, y * 6] for x, y in enveloppe(pts)]
    # étiquette de la planche : coin bas gauche entaillé, on le restitue
    a546 = any(abs(x - 546) < 30 and y > 1060 for x, y in env)
    a894 = any(x < 20 and abs(y - 891) < 20 for x, y in env)
    if a546 and a894:
        env = [p for p in env if not ((abs(p[0] - 546) < 30 and p[1] > 1060) or (p[0] < 20 and abs(p[1] - 891) < 20))] + [[0, 1080]]
        env = [[x, y] for x, y in enveloppe([(x, y) for x, y in env])]
    return [coller(p) for p in env]


def radial(poly):
    P = np.array(poly, float)
    c = P.mean(axis=0)
    out = []
    for k in range(N):
        th = 2 * math.pi * k / N
        d = np.array([math.cos(th), math.sin(th)])
        best = None
        for i in range(len(P)):
            a, b = P[i], P[(i + 1) % len(P)]
            e = b - a
            M = np.array([d, -e]).T
            if abs(np.linalg.det(M)) < 1e-9:
                continue
            s, u = np.linalg.solve(M, a - c)
            if s > 0 and -1e-6 <= u <= 1 + 1e-6 and (best is None or s < best):
                best = s
        q = c + best * d
        out += [round(q[0]), round(q[1])]
    return out


if __name__ == "__main__":
    dossier, sortie = sys.argv[1], sys.argv[2]
    res = {}
    for plan, temps in PLANS.items():
        cles = {}
        for t, poly in MAIN.get(plan, {}).items():
            cles[t] = radial([coller(p) for p in poly])
        for t in temps:
            cles[t] = radial(masque(os.path.join(dossier, f"{t:06.3f}.png")))
        ts = sorted(cles)
        res[plan] = {"T": ts, "P": [cles[t] for t in ts]}
    json.dump(res, open(sortie, "w"))
    print({k: len(v["T"]) for k, v in res.items()})
