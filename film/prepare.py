"""Détoure la photo réelle du set football (fond gris clair uni) pour le packshot sur fond #101010."""
import sys
from PIL import Image, ImageDraw, ImageFilter

src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
w, h = im.size
marque = im.copy()
for x, y in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]:
    ImageDraw.floodfill(marque, (x, y), (255, 0, 255), thresh=34)
alpha = Image.new("L", (w, h), 255)
pa, pm = alpha.load(), marque.load()
for y in range(h):
    for x in range(w):
        if pm[x, y] == (255, 0, 255):
            pa[x, y] = 0
alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
out = im.convert("RGBA")
out.putalpha(alpha)
out.crop(alpha.getbbox()).save(dst)
