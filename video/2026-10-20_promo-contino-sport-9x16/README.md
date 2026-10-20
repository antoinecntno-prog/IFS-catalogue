# Film vertical Contino Sport (9:16)

Film promotionnel de 60 s en 1080 × 1920, 30 images par seconde, pour Reels, Stories et TikTok. Il reprend le langage des promos d'applis : écrans de téléphone inclinés en perspective, gros plans sur l'interface, fonds de couleur pleine, mots géants en fond, taps jaunes, formes géométriques, coupes calées sur le tempo. Le contenu suit le parcours d'un client sur continosport.fr : la promesse, le catalogue, un sport par mesure, la fiche et sa grille de prix, le studio, le devis, l'envoi, le suivi, les engagements, le carton final.

Le rendu final est `../2026-10-20_film-contino-sport-9x16.mp4`.

## Contenu

- `STORYBOARD.md` : le découpage scène par scène, avec les temps, les textes et les règles de contenu.
- `index.html` : l'hôte HyperFrames. Il place les douze scènes, les flashs blancs, les bandes d'encre entre scènes et les deux pistes audio.
- `compositions/s01-mur.html` à `s12-fin.html` : une sous-composition par scène, chacune avec sa propre timeline.
- `assets/kit.css` : polices, couleurs, écran de téléphone et interface du site recomposée en HTML, partagés par toutes les scènes.
- `outils/son.py` : la bande-son, un morceau hip-hop/pop à 105 BPM en sol mineur écrit pour ce film, et les bruitages calés sur les taps et les coupes. Sortie dans `assets/audio/`.
- `outils/mur.js` : génère le mur de fiches produits de la première scène à partir de `site/donnees.js`.
- `reference/` : captures du site à 390 px de large, qui ont servi de modèle aux écrans.

## Refaire le rendu

```
node outils/mur.js                      # si les produits ou les prix changent
python3 outils/son.py                   # si un repère sonore change
npx hyperframes check .
npx hyperframes render . -o renders/film.mp4 -f 30 -q delivery --crf 20
```

Puis réglage du son à -14 LUFS, image recopiée sans réencodage : mesure avec `ffmpeg -i film.mp4 -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null -`, puis second passage `loudnorm` avec les valeurs mesurées et `-c:v copy`.

Les repères sonores sont en tête de `outils/son.py` (listes `TAPS`, `WHOOSH`, `MONTANTS`, `PUNCH`, `MOTS`, `FRAPPE`, `ETAPES`). Un tap déplacé dans une scène se recopie dans la liste correspondante.
