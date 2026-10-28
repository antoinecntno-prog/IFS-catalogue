"""Planche Apple / Contino Sport côte à côte, plus une superposition à 50 %, pour caler formes et positions."""
import sys
from PIL import Image, ImageDraw

sortie, *paires = sys.argv[1:]
lignes = [paires[i:i + 3] for i in range(0, len(paires), 3)]  # étiquette, image Apple, image Contino
W, H = 480, 270
planche = Image.new("RGB", (W * 3, H * len(lignes)), (30, 30, 30))
d = ImageDraw.Draw(planche)
for r, (etiquette, apple, contino) in enumerate(lignes):
    a = Image.open(apple).convert("RGB").resize((W, H))
    c = Image.open(contino).convert("RGB").resize((W, H))
    planche.paste(a, (0, r * H)); planche.paste(c, (W, r * H)); planche.paste(Image.blend(a, c, 0.5), (2 * W, r * H))
    d.text((6, r * H + 4), f"Apple {etiquette}", fill=(255, 255, 0)); d.text((W + 6, r * H + 4), "Contino", fill=(255, 255, 0))
planche.save(sortie, quality=88)
