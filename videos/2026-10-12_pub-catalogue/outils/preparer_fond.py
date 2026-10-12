"""Surface anthracite mate posée sous la feuille de match (assets/fond-anthracite.jpg, 920 x 1600 px).

Texture calculée : teinte encre assombrie, bruit fractal léger, grain fin et vignettage doux. La composition la floute
et l'agrandit sous la feuille. Graines fixes : le fichier sort identique à chaque exécution.
Usage : python3 outils/preparer_fond.py
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ICI = Path(__file__).resolve().parent.parent
W, H = 920, 1600


def fbm(w, h, octaves=5, base=8, seed=0):
    r = np.random.default_rng(seed)
    out = np.zeros((h, w))
    amp = 1.0
    for o in range(octaves):
        n = base * 2 ** o
        g = r.standard_normal((n * h // w + 2, n + 2))
        z = ndi.zoom(g, (h / (g.shape[0] - 1), w / (g.shape[1] - 1)), order=3)[:h, :w]
        out += amp * z
        amp *= 0.5
    return (out - out.mean()) / out.std()


def main():
    rng = np.random.default_rng(7)
    yy, xx = np.mgrid[0:H, 0:W]
    vign = 1 - 0.35 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H * 0.45) / (H / 2)) ** 2)
    base = np.array([31, 27, 36], float)
    n = fbm(W, H, 6, 6, 1) * 4 + rng.standard_normal((H, W)) * 3
    a = base[None, None, :] * vign[..., None] + n[..., None]
    sortie = ICI / "assets" / "fond-anthracite.jpg"
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(sortie, quality=92)
    print(sortie)


if __name__ == "__main__":
    main()
