# Pub vidéo « Le dessin », Contino Sport

Vidéo verticale HyperFrames, 1080 × 1920 px à 30 i/s, 22,5 s (48 temps à 128 BPM, 675 images), lisible sans le son, en boucle.

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

## Refaire le rendu

```
python3 outils/preparer_set.py
python3 outils/preparer_decors.py
python3 outils/exporter_donnees.py
npx hyperframes check
npx hyperframes render --output rendu.mp4
```

## Arrivée de la musique

Mesurer le tempo et le premier temps fort de la piste, puis changer `TEMPS` et `OFFSET` en tête du script de `index.html`. Les durées en temps restent les mêmes. Ajouter la piste en `<audio id="musique" src="assets/musique.mp3" data-start="0" data-duration="22.5">` à la racine.

## Éléments [à fournir] restés vides

- Logo HD (SVG ou PNG de 1200 px de large) : le logo du site (264 × 112 px) s'affiche à sa taille native, sans agrandissement, soit 240 × 102 px dans la scène. L'emplacement prévoit 520 px de large : remplacer `assets/logo-contino-sport.webp` et la ligne `LOGO_W` suffit.
- Set en haute définition : la photo du site (640 × 800 px) reste affichée sous 640 px de haut à l'écran.
- Musique libre pour la publicité, vers 128 BPM : la vidéo est muette.
- Avis et nombre de clubs équipés : aucun à l'écran.
- Clip optionnel de poussière dans la lumière : non généré, aucune balise `<video>`.

## Photos fournies le 12/10/2026

Feuille de match (2000 px de haut, sous les 2400 px demandés), table de buvette, vestiaire, cintre, feutre. La feuille porte l'impression de la feuille de match : le dos utilisé dans la vidéo efface l'impression et garde le quadrillage en transparence à 2,8 %, sans le titre. Le recto apparaît au tour de page final.
