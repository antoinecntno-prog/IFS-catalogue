# Pub vidéo « Le dessin », Contino Sport

Vidéo verticale HyperFrames, 1080 × 1920 px à 30 i/s, 22,5 s (48 temps à 128 BPM, 675 images), lisible sans le son, en boucle, avec musique et bruitages.

## Fichiers

- `index.html` : la composition. Une seule timeline GSAP en pause, enregistrée sous `le-dessin`, avec les labels `b01_hook` à `fin` tirés de `TEMPS` et `OFFSET`. Caméra, ballon, feutre, sets du vestiaire et pliage de la page se calculent en fonctions pures du temps à partir d'une horloge ; cartons, bouton, adresse et envol du set sont des tweens éditoriaux.
- `rendu.mp4` : le rendu livré.
- `assets/` : images préparées et données du dessin (`donnees.js`).
- `sources/` : les photos d'origine, gardées pour refaire les détourages.
- `outils/preparer_set.py` : détoure le set (photo réelle sans sponsors), le coupe en maillot et short, vectorise le contour du maillot, celui du short, le bord de la flamme et les deux bandes.
- `outils/preparer_decors.py` : feuille de match (dos vierge et recto), feutre, cintre, table de buvette, gobelets, vestiaire en calques (mur prolongé, barre, patère, banc).
- `outils/exporter_donnees.py` : écrit `assets/donnees.js`.
- `outils/mesure_mouvement.py` et `outils/planche.py` : contrôles c) et b).
- `controles/` : sorties des quatre contrôles.

## Son

- `assets/audio/mix.wav` : le mix lu par la composition (`<audio id="son-mix">`, volume 1,1 pour compenser la baisse d'environ 1 dB du rendu). Dans le MP4 : −14,8 LUFS intégrés, crête vraie −1,5 dBFS, décalage nul avec l'image.
- Musique : composée et synthétisée par `../son/musique.py` sur la grille de poses (128 BPM, 12 mesures en la majeur). L'intro griffonnée tient sur les mesures 1 et 2 ; le groove part au contact du ballon (3,75 s) ; la pause tombe sous la signature du logo (11,25 s) ; une cymbale inversée annonce le match cut (15,94 s) ; la mesure 12 retombe pour reboucler. Le tampon est circulaire : la boucle Meta reste sans couture. Elle appartient au projet, libre de droits pour la publicité.
- Bruitages : synthétisés par `../son/moteur.py` et calés sur le mouvement réel. Le frottement du feutre suit la vitesse de sa pointe, échantillonnée à 120 Hz par `outils/reperes.js`. Les rebonds sur le papier font des « bop », les patères tintent sur une gamme qui monte, les cintres claquent sur chaque temps, la page se soulève puis tourne. S'y ajoutent sept bruitages Pixabay livrés avec HyperFrames (sparkle, pop, clics, whoosh, impact), sous licence Pixabay : usage commercial sans attribution.
- `assets/audio/stem-musique.m4a` et `stem-bruitages.m4a` : les deux pistes séparées, pour retoucher le mix.
- Refaire le son : `NODE_PATH=$(npm root -g) node outils/reperes.js . /tmp/reperes.json` puis `python3 outils/sound_design.py /tmp/reperes.json`.

## Refaire le rendu

```
python3 outils/preparer_set.py
python3 outils/preparer_decors.py
python3 outils/exporter_donnees.py
npx hyperframes check
npx hyperframes render --output rendu.mp4
```

## Remplacer la musique

Avec une autre piste : mesurer son tempo et son premier temps fort, changer `TEMPS` et `OFFSET` en tête du script de `index.html`, puis refaire le son avec la nouvelle piste à la place de `compose()`. Les durées en temps restent les mêmes.

## Éléments [à fournir] restés vides

- Logo HD (SVG ou PNG de 1200 px de large) : le logo du site (264 × 112 px) s'affiche à sa taille native, sans agrandissement, soit 240 × 102 px dans la scène. L'emplacement prévoit 520 px de large : remplacer `assets/logo-contino-sport.webp` et la ligne `LOGO_W` suffit.
- Set en haute définition : la photo du site (640 × 800 px) reste affichée sous 640 px de haut à l'écran.
- Avis et nombre de clubs équipés : aucun à l'écran.
- Clip optionnel de poussière dans la lumière : non généré, aucune balise `<video>`.

## Photos fournies le 12/10/2026

Feuille de match (2000 px de haut, sous les 2400 px demandés), table de buvette, vestiaire, cintre, feutre. La feuille porte l'impression de la feuille de match : le dos utilisé dans la vidéo efface l'impression et garde le quadrillage en transparence à 2,8 %, sans le titre. Le recto apparaît au tour de page final.
