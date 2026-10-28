"""Extrait le monogramme blanc « C SPORT » du favicon et le passe en encre sombre, pour le capot de l'ordinateur."""
import sys
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGBA")
w, h = im.size
out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
pi, po = im.load(), out.load()
for y in range(h):
    for x in range(w):
        r, g, b, a = pi[x, y]
        lum = (r + g + b) / 3
        if a > 0 and lum > 60:
            po[x, y] = (18, 18, 18, int(min(255, (lum - 60) / 195 * 255) * a / 255))
out = out.crop(out.getbbox())
out = out.resize((out.width * 2, out.height * 2), Image.LANCZOS)
out.save(dst)
