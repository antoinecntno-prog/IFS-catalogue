"""Assemble des images relevées (320 x 180) en planche agrandie avec une grille tous les 240 px du repère 1920.
Usage : python3 mosaique.py dossier sortie.png colonnes t1 t2 ..."""
import sys, os
from PIL import Image, ImageDraw

dossier, sortie, colonnes = sys.argv[1], sys.argv[2], int(sys.argv[3])
temps = sys.argv[4:]
L, H = 480, 270
lignes = (len(temps) + colonnes - 1) // colonnes
planche = Image.new("RGB", (colonnes * (L + 6), lignes * (H + 6)), (60, 0, 60))
for i, t in enumerate(temps):
    im = Image.open(os.path.join(dossier, f"{float(t):06.3f}.png")).resize((L, H), Image.LANCZOS)
    d = ImageDraw.Draw(im)
    for k in range(1, 8):
        x = k * L // 8
        d.line([(x, 0), (x, H)], fill=(0, 160, 255), width=1)
    for k in range(1, 4):
        y = k * H // 4 + (0 if k != 2 else 0)
        d.line([(0, k * H / 4.5), (L, k * H / 4.5)], fill=(0, 160, 255), width=1)
    d.text((4, 4), t, fill=(255, 255, 0))
    planche.paste(im, ((i % colonnes) * (L + 6), (i // colonnes) * (H + 6)))
planche.save(sortie)
