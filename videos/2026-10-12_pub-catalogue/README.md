# Pub vidéo « Le carnet », Contino Sport : tout le catalogue

Vidéo verticale HyperFrames, 1080 × 1920 px à 30 i/s, 30 s (64 temps à 128 BPM, 900 images), lisible sans le son, en boucle, avec musique et bruitages. Elle prolonge la pub foot « Le dessin » (`../2026-10-12_pub-le-dessin`) : au dos de la même feuille de match, 30 cases dessinent le nombre 30, le feutre esquisse chaque produit et le ballon dessiné fait naître les photos. Brief complet : `BRIEF.md`.

## Fichiers

- `index.html` : la composition. Une seule timeline GSAP en pause, enregistrée sous `le-carnet`, avec les labels `b01_hook` à `fin` tirés de `TEMPS` et `OFFSET`. Caméra, feutre, ballon, révélations, compteur, étiquette et tour de page se calculent en fonctions pures du temps à partir d'une horloge ; cartons, bon et bouton sont des tweens éditoriaux.
- `rendu.mp4` : le rendu livré, avec le son.
- `2026-10-12_miniature-meta.jpg` : l'image 618 (20,6 s), le « 30 » entier avec sa ligne, pour la miniature Meta.
- `assets/produits/` : les 30 photos du site (copies exactes) et les 11 détourés ; `assets/produits.json` : boîtes et contours des détourés.
- `assets/tailles/` : chaque photo en 480 × 600 (vue rapprochée) et 192 × 240 (vue large) ; inscription des dossards floutée.
- `assets/donnees.js` : liste PRODUITS du film, pictogrammes du site, dessin du set (repris de la pub foot), décors et prix d'étiquette.
- `outils/preparer_produits.py` : copie et détourage (fond modélisé par une surface polynomiale, ombres neutres retirées, masque u2net de `hyperframes remove-background` ajouté pour les blancs des maillots de basket).
- `outils/preparer_tailles.py`, `outils/exporter_donnees.py` (s'arrête en erreur si un prix de la composition diffère du site), `outils/reperes.js`, `outils/sound_design.py`, `outils/planche.py`, `outils/mesure_mouvement.py`, `outils/raccord.sh`.
- `controles/` : sorties des quatre contrôles et rapport.

## Ordre des produits

Les 30 produits passent dans l'ordre de la section 6 du brief : le « 3 » (maillots, sacs, vestes, bonnet polaire), puis le « 0 » (écharpe, bob, accessoires, drapeau, événementiel, objets), et le boxer ferme le nombre à 16,875 s. 29 photos et un croquis : le bob reste dessiné, car sa seule photo vient d'une banque d'images.

## Son

- `assets/audio/mix.wav` : le mix lu par la composition (`<audio id="son-mix">`, volume 1). Dans le MP4 : −14,1 LUFS intégrés, crête vraie −1,8 dBFS, décalage nul avec l'image.
- Musique : composée et synthétisée par `../son/musique.py`, mêmes tempo et accords que la pub foot, sur 16 mesures. Intro légère pendant les héros, groove plein au temps 8 quand le feutre passe à un produit par temps, pause sous le 30/30 et le recul, retour du groove sur « produits, prix en ligne », groove de base sous le bouton, filtre qui se ferme pendant la plongée finale. Deux motifs de marimba ajoutés (« e » et « f »), une note par révélation. Tampon circulaire : la boucle reste sans couture. La musique appartient au projet, libre de droits pour la publicité.
- Bruitages : synthétisés par `../son/moteur.py` et calés sur les repères réels. Le frottement du feutre suit la vitesse de sa pointe par rapport au papier ; chaque détouré naît sur un froissement et un pop ; chaque photo en cadre sonne une note pincée de la gamme pentatonique de la majeur, qui monte case après case et repart au début du « 0 » ; la rafale monte d'un ton à chaque rebond. S'y ajoutent des bruitages Pixabay livrés avec HyperFrames (sparkle, pop, clics, whoosh, impact), sous licence Pixabay : usage commercial sans attribution.
- `assets/audio/stem-musique.m4a` et `stem-bruitages.m4a` : les deux pistes séparées.
- Refaire le son : `NODE_PATH=$(npm root -g) node outils/reperes.js . controles/reperes.json` puis `python3 outils/sound_design.py controles/reperes.json`.

## Refaire le rendu

```
python3 outils/preparer_produits.py
python3 outils/preparer_tailles.py
python3 outils/exporter_donnees.py
npx hyperframes check
npx hyperframes render --output rendu.mp4
```

## Texte Meta (écrit avec /alex, mécanisme Ad 6 Direct Benefit)

Titre : Comment habiller votre club ou votre équipe

Texte principal : La réponse : 30 produits à vos couleurs, du maillot au tote bag. Chaque fiche affiche son prix selon la quantité. Maillot + short de foot : 25,99 € hors taxes dès 30 pièces. Tote bag tout imprimé : 5,59 € hors taxes dès 100 pièces. Ces deux prix comprennent le transport. Vous validez la maquette avant production. Le devis est gratuit.

Bouton : « Obtenir un devis », vers continosport.fr (libellé à vérifier dans le gestionnaire de publicités).

Si l'aperçu Reels masque le titre, le texte principal commence par « Comment habiller votre club ou votre équipe ? La réponse : … ».

## Éléments [à fournir] restés vides

- Logo HD (SVG ou PNG de 1 200 px de large) : le logo du site s'affiche à 240 × 102 px dans le bon.
- Confirmation que « Foulées des Sapins », sur la photo des dossards, est une course inventée : l'inscription reste floutée en attendant.
- Accord sur la mention du bon : « Photos non contractuelles » (pied de page du site) ou « Photos d'exemple ».
- Libellé exact du bouton Meta.
- Accord des clubs d'Eschau et de Schirmeck, utile pour une version avec les vues principales des maillots de basket (le film montre les vues sans nom de club).
- Objection traitée (fournisseurs « sur devis ») : déduite de `PRODUCT.md`, à confirmer.
