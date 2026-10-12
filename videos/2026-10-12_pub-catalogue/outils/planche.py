"""Planche des snapshots du contrôle b) : chaque image porte son instant et son beat."""
import glob, re, sys
from PIL import Image, ImageDraw, ImageFont

BEATS = [("b01_hook", 0), ("b02_entreprise", 4), ("b03_sweat", 8), ("b04_dos", 10), ("b05_saut", 14), ("b06_zero", 20), ("b07_cote", 24),
         ("b08_rafale", 30), ("b09_trente", 36), ("b10_prix", 40), ("b11_cta", 46), ("b12_clic", 56), ("b13_page", 60)]
TEMPS = 60 / 128

def beat(t):
    nom = BEATS[0][0]
    for n, k in BEATS:
        if t + 1e-6 >= k * TEMPS:
            nom = n
    return nom

dossier, sortie = sys.argv[1], sys.argv[2]
garde = [float(x) for x in sys.argv[3].split(",")] if len(sys.argv) > 3 else None
imgs = []
for f in glob.glob(dossier + "/frame-*-at-*.png"):
    t = float(re.search(r"-at-([0-9.]+)s\.png", f).group(1))
    if garde is None or any(abs(t - g) < 1e-3 for g in garde):
        imgs.append((t, f))
imgs.sort()
W, H, COL = 270, 480, 6
lignes = (len(imgs) + COL - 1) // COL
planche = Image.new("RGB", (COL * W, lignes * (H + 52)), (26, 19, 32))
d = ImageDraw.Draw(planche)
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
except OSError:
    font = ImageFont.load_default()
for i, (t, f) in enumerate(imgs):
    x, y = (i % COL) * W, (i // COL) * (H + 52)
    planche.paste(Image.open(f).convert("RGB").resize((W, H), Image.LANCZOS), (x, y + 52))
    n = round(t * 30)
    d.text((x + 8, y + 6), f"t = {t:.3f} s · image {n}", fill=(255, 255, 255), font=font)
    d.text((x + 8, y + 27), beat(t), fill=(255, 228, 92), font=font)
planche.save(sortie, quality=90)
print(sortie, planche.size, len(imgs), "images")
