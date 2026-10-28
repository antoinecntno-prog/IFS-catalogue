"""Pour un masque en biseau (deux rayons depuis un sommet), trouve les deux plus longs côtés de l'enveloppe
convexe, leurs angles et leur intersection. Repère 1920 x 1080, angles en degrés (0 = droite, 90 = haut).
Usage : python3 biseau.py dossier t1 t2 ..."""
import sys, os, math
import numpy as np
from PIL import Image
from planche import enveloppe, simplifier, composantes
from scipy import ndimage

dossier = sys.argv[1]
for t in sys.argv[2:]:
    a = np.asarray(Image.open(os.path.join(dossier, f"{float(t):06.3f}.png"))).astype(int)
    m = a.max(axis=2) > 26
    m[150:180, 0:90] = False
    m = ndimage.binary_opening(m, iterations=1)
    pts = max(composantes(m), key=len)
    env = simplifier(enveloppe(pts), 4)
    cotes = []
    for i in range(len(env)):
        p, q = np.array(env[i], float) * 6, np.array(env[(i + 1) % len(env)], float) * 6
        # on ignore les bords du cadre
        if (abs(p[0] - q[0]) < 8 and (p[0] < 10 or p[0] > 1900)) or (abs(p[1] - q[1]) < 8 and (p[1] < 10 or p[1] > 1070)):
            continue
        cotes.append((np.linalg.norm(q - p), p, q))
    cotes.sort(key=lambda c: -c[0])
    (l1, p1, q1), (l2, p2, q2) = cotes[0], cotes[1]
    d1, d2 = q1 - p1, q2 - p2
    A = np.array([d1, -d2]).T
    s, u = np.linalg.solve(A, p2 - p1)
    x = p1 + s * d1
    ang = lambda d: math.degrees(math.atan2(-d[1], d[0]))
    print(f"{t:>6} sommet ({x[0]:.0f}, {x[1]:.0f})  côté1 {p1.astype(int)}->{q1.astype(int)} {ang(d1):.1f}°  côté2 {p2.astype(int)}->{q2.astype(int)} {ang(d2):.1f}°")
