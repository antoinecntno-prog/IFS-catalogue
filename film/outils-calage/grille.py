"""Grille en coordonnées 1920 × 1080 sur une même zone d'une image Apple (640 px) et d'une image Contino (1920 px)."""
import sys
from PIL import Image, ImageDraw, ImageEnhance

apple, contino, sortie, x0, y0, x1, y1 = sys.argv[1], sys.argv[2], sys.argv[3], *map(int, sys.argv[4:8])
W = 600
H = int(W * (y1 - y0) / (x1 - x0))
sc = W / (x1 - x0)

def grille(im):
    d = ImageDraw.Draw(im)
    for X in range(x0 - x0 % 20, x1, 20):
        x = (X - x0) * sc
        d.line([(x, 0), (x, H)], fill=(255, 255, 0) if X % 100 == 0 else (0, 110, 200), width=1)
        if X % 100 == 0: d.text((x + 2, 2), str(X), fill=(255, 255, 0))
    for Y in range(y0 - y0 % 20, y1, 20):
        y = (Y - y0) * sc
        d.line([(0, y), (W, y)], fill=(255, 255, 0) if Y % 100 == 0 else (0, 110, 200), width=1)
        if Y % 100 == 0: d.text((2, y + 2), str(Y), fill=(255, 255, 0))
    return im

a = Image.open(apple).convert("RGB").crop((x0 / 3, y0 / 3, x1 / 3, y1 / 3)).resize((W, H), Image.LANCZOS)
c = Image.open(contino).convert("RGB").crop((x0, y0, x1, y1)).resize((W, H), Image.LANCZOS)
out = Image.new("RGB", (2 * W, H))
out.paste(grille(ImageEnhance.Brightness(a).enhance(1.5)), (0, 0))
out.paste(grille(ImageEnhance.Brightness(c).enhance(1.3)), (W, 0))
out.save(sortie, quality=92)
