# Contrôles avant livraison, pub « Le carnet »

Rendu contrôlé : `rendu.mp4`, H.264, 1080 × 1920 px, 30 i/s, 900 images, 30,000 s, son AAC 48 kHz stéréo.

## a) `npx hyperframes check`

Zéro erreur. Sortie complète dans `check.txt` (hyperframes 0.8.149) :

```
Lint
  ⚠ composition_file_too_large: This HTML composition file has 979 lines. Smaller sub-compositions are easier to read, iterate on, and diff.
    /home/user/IFS-catalogue/videos/2026-10-12_pub-catalogue/index.html [data-composition-id] t=0s
    Fix: Split coherent scenes or layers into separate .html files under compositions/, then mount them from the parent with data-composition-src so each file stays small enough to inspect, revise, and validate independently.
  0 error(s), 1 warning(s), 0 info(s)

Runtime
  ◇ 0 errors, 0 warnings

Layout
  ◇ 0 issues across 9 sample(s)

Motion
  ◇ 0 errors, 0 warnings

Contrast
  ◇ 0/0 text checks pass WCAG AA

Snapshots
  ◇ disabled

◇  Check passed
```

L'avertissement porte sur la taille du fichier unique. L'audit de contraste du CLI n'a mesuré aucun texte aux instants qu'il échantillonne. Calculés selon WCAG, les ratios donnent 18,14 pour l'encre sur blanc, 6,63 pour le magenta sur blanc et pour le blanc sur le bouton magenta, 14,25 pour l'encre sur le surlignage jaune.

Un second avertissement, `gsap_callback_dom_measurement`, est levé : la règle lit le corps d'une fonction fléchée écrite sur une ligne jusqu'à la fin du script, et atteignait ainsi les mesures de texte faites à la construction. Les 25 fonctions concernées sont réécrites en déclarations ; le rendu est identique (repères du feutre, du ballon et de la caméra comparés : écart nul).

## b) Snapshots

- `2026-10-12_planche-poses.jpg` : les 40 instants de la première commande du brief, chacun avec son instant, son numéro d'image et son beat. L'outil ajoute de lui-même une image de fin ; elle n'est pas sur la planche.
- `2026-10-12_planche-revelations.jpg` : une image par révélation, 0,35 s après chacune (survêtement et bonnet polaire au départ de leur fouetté, bob après ses passes).

Vérifié sur les deux planches :
- plus grande photo : 371 px de haut à l'échelle 2,9, 386 px au sommet du rebond de révélation ;
- textes dans x 65 à 1015 et y 285 à 1248 ;
- inscription des dossards floutée ;
- cercle posé sur le manchon droit ;
- « 30 » lisible sur les vignettes de la planche (270 × 480) ;
- de 0 à 2,813 s, le ballon passe sous l'accroche ;
- à 9,844 et 10,313 s, le bob reste dégagé.

## c) Mouvement, boucle, images noires, son

| Mesure | Résultat | Objectif |
|---|---|---|
| Images quasi figées (YAVG < 0,3) | 20,8 % | moins de 25 % |
| Plus longue suite figée | 1,60 s, de 22,57 à 24,17 s (tenue du bouton, commencée une image et un tiers avant la fenêtre) | dans la tenue du CTA (22,61 à 27,89 s) |
| Secondes figées hors CTA | aucune | aucune |
| Raccord de boucle, images 899 et 0 | YAVG 2,41 | sous 1,5 |
| Lignes `black_start` | 0 | 0 |
| Son : loudness intégrée, crête vraie | −14,1 LUFS, −1,7 dBFS | autour de −14 LUFS, crête sous −1 dBFS |
| Son : décalage avec l'image | 0 ms (corrélation avec `mix.wav`) | 0 |

Le raccord dépasse l'objectif. L'écart entre les images 899 et 0 (2,41) se range parmi les écarts d'une image à la suivante autour du raccord : 2,10 entre les images 0 et 1, 3,48 entre 898 et 899, et 2,87 en médiane sur tout le film. La boucle n'a aucun saut. L'écart vient du mouvement que la feuille de poses place sur le raccord : le feutre trace le bord de flamme vers 720 px/s et le ballon tombe le long du bord droit. Atteindre 1,5 demande de ralentir ces deux gestes à l'image 0, donc de changer la feuille de poses.

La plus longue suite figée commence à 22,567 s, une image et un tiers avant le début de la fenêtre du CTA (22,61 s) : le bouton finit son entrée à 22,613 s, et ses dernières images bougent sous le seuil de 0,3. Aucune seconde entière n'est figée hors de la tenue.

Sorties brutes : `mesures.txt`.

## d) Grille d'audit du skill animations

`2026-10-12_audit-animations.md` : les onze questions et la finalité pour chaque scène (hook et héros, le 3 et le 0, révélation, CTA et page), chaque réponse avec son instant. Un point reste partiel : dans le hook, les petits sauts du ballon partent sans recul d'anticipation.

## Écarts au brief

- Fond : surface anthracite mate, sur demande d'Antoine le 12/10. La texture vient de `outils/preparer_fond.py` ; elle s'agrandit sous la feuille en parallaxe 0,3 et se floute à 8 px. La nappe de la buvette est retirée.
- Papier : `feuille-dos.png` à toutes les échelles, sans papier de synthèse ni grain ; le dos est presque blanc et son quadrillage ne tient qu'à 2,8 %.
- Tremblé : aucun filtre feTurbulence. Les cases portent un tremblé figé dessiné à graine fixe, et les traits du feutre restent nets.
- Bob : les deux passes se croisent (magenta à 45°, jaune à −45°) ; superposées, la jaune aurait caché la magenta.
- Ballon : après le softshell, il se pose sur la marge au-dessus du haut du « 3 » (case r0c3), pour rester dans le cadre pendant le fouetté horizontal. Dans le « 0 », un petit saut de 27,6 à 28,1 temps le fait descendre avec la caméra. Ses contacts sur le bon (21,94 et 26,72 s) ont leur bruitage.
- Gobelets : retirés avec la nappe de la buvette.
- Fil de l'étiquette : il part du coin bas gauche de la case et passe à gauche du prix ; tiré du centre, il barrait le texte.
- Son du feutre : sur demande d'Antoine le 12/10, il ne s'entend que sur l'accroche et les héros, les passes du bob et le cercle du compteur, à −16 dB : grain coupé à 3 800 Hz, crépitements réduits au quart, couinement supprimé. La piste des autres bruitages garde son niveau, car son gain se calcule sur le réglage livré la première fois. Le mix entier revient ensuite à −14 LUFS : le feutre pesant moins, musique et bruitages y sortent 1,5 dB plus fort que dans la première livraison, avec le même équilibre entre eux.
- Feutre : pendant les passes de hachures du bob, la pointe dépasse 1 800 px/s, comme un griffonnage. Hors hachures, 95 % des échantillons de tracé restent sous 1 974 px/s à l'écran, travellings compris, avec des pointes isolées jusqu'à 3 513 px/s.
- Son : volume 1 sur la piste ; le volume 1,1 de la pub foot montait ici le rendu à −13,3 LUFS et la crête à −1,0 dBFS.
- Tote bag sublimé : les ombres portées sur le mur, accrochées aux anses, sont retirées du détourage.
- Bon à détacher : la mention « Photos non contractuelles » est retirée sur demande d'Antoine le 12/10, et le bon raccourci de 40 px (845 à 1 250 px).

## Ce qui reste ouvert

- Données [à fournir] : liste dans `README.md`.
- Raccord de boucle à 2,41 : à garder ou à corriger par une feuille de poses plus lente à l'image 0.
- Avertissement lint sur la taille du fichier : découper la composition en sous-compositions si la vidéo doit évoluer.
