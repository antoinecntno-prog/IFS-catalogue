# Contrôles avant livraison, pub « Le dessin »

Rendu contrôlé : `rendu.mp4`, H.264, 1080 × 1920 px, 30 i/s, 675 images, 22,500 s, son AAC 48 kHz stéréo.

## a) `npx hyperframes check`

Zéro erreur. Sortie complète (hyperframes 0.8.149) :

```
◆  Checking 2026-10-12_pub-le-dessin
[hyperframes] browserGpuMode probe → software (WebGL unavailable)

Lint
  ⚠ composition_file_too_large: This HTML composition file has 1058 lines. Smaller sub-compositions are easier to read, iterate on, and diff.
    /home/user/IFS-catalogue/videos/2026-10-12_pub-le-dessin/index.html [data-composition-id] t=0s
    Fix: Split coherent scenes or layers into separate .html files under compositions/, then mount them from the parent with data-composition-src so each file stays small enough to inspect, revise, and validate independently.
  0 error(s), 1 warning(s), 0 info(s)

Runtime
  ◇ 0 errors, 0 warnings

Layout
  ℹ t=1.25, 3.75, 6.25, 18.75, 21.25s container_overflow #s1-cam inside #s1 overflowed left 53.3px, right 53.3px, top 92.98px, bottom 92.98px — Element extends outside a clipping layout container.
        Fix: Resize/reposition the child or container, or mark intentional overflow with data-layout-allow-overflow.
  ℹ t=11.25, 13.75s container_overflow #s2-cam inside #s2 overflowed left 21.6px, right 21.6px, top 38.4px, bottom 38.4px — Element extends outside a clipping layout container.
        Fix: Resize/reposition the child or container, or mark intentional overflow with data-layout-allow-overflow.
  0 error(s), 0 warning(s), 2 info(s)

Motion
  ◇ 0 errors, 0 warnings

Contrast
  ◇ 1/1 text checks pass WCAG AA

Snapshots
  ◇ disabled

◇  Check passed
```

L'avertissement porte sur la taille du fichier unique. Les deux infos viennent de la caméra, plus grande que le cadre par construction. L'audit de contraste du CLI n'a mesuré qu'un texte. Calculés selon WCAG, les ratios donnent 18,14 pour l'encre sur blanc et 14,25 pour l'encre sur le surlignage jaune ; le blanc sur le bouton magenta atteint 6,63.

## b) Snapshots

Commande du brief, 24 instants : `controles/2026-10-12_planche-snapshots.jpg`. Chaque vignette porte son instant, son numéro d'image et son beat. L'outil ajoute de lui-même une image de fin à 21,825 s ; elle n'est pas sur la planche.

## c) Mouvement, boucle, images noires

| Mesure | Résultat | Objectif |
|---|---|---|
| Images quasi figées (YAVG < 0,3) | 12,3 % | moins de 25 % |
| Plus longue suite figée | 2,53 s, de 19,00 à 21,53 s (tenue du bouton) | dans la tenue du CTA |
| Secondes figées hors CTA | la seconde 19, figée à partir de 19,00 s | aucune |
| Raccord de boucle, images 674 et 0 | YAVG 0,933 | sous 1,5 |
| Lignes `black_start` | 0 | 0 |
| Son : loudness intégrée, crête vraie | −14,6 LUFS, −1,7 dBFS | autour de −14 LUFS, crête sous −1 dBFS |
| Son : décalage avec l'image | 0 ms (corrélation avec la source) | 0 |

La seconde 19 reste figée sur ses 30 images : la suite figée couvre les images 570 à 646 (19,00 à 21,53 s) et commence une image et demie avant le début de la tenue du bouton (19,05 s). L'écart entre les images 570 et 571 vient surtout de la fin de l'entrée du bouton : il valait 0,331 dans le rendu précédent, juste au-dessus du seuil de 0,3, et vaut 0,299 aujourd'hui. La nappe y ajoutait environ 0,03.

Sorties brutes : `controles/mesures.txt`.

## d) Grille d'audit du skill animations

`controles/2026-10-12_audit-animations.md` : les onze questions et la finalité pour chaque scène (feuille de match, vestiaire, maquette, CTA), chaque réponse avec son instant.

## Écarts au brief

- Rebonds sur le papier : demi-paraboles de 0,43 s (le brief en prévoyait 0,28 s), pour que les contacts tombent sur les temps 2 et 4 (0,469 et 1,406 s).
- Push-in de b01 : power2.out précédé d'une prise de vitesse de 0,22 s. La caméra arrive immobile au raccord ; avec le power2.out seul, le raccord mesurait 2,43.
- Ballon du vestiaire en parallaxe 0,7, celle des patères, pour rester posé dessus.
- Étiquette de prix fixée à l'écran : son texte reste immobile pendant le zoom arrière, le fil suit le set 8.
- Les dernières hachures finissent à 2,92 s, 0,11 s après le début de l'anticipation du ballon ; le lever entre les deux bandes dure 0,06 s.
- Dix sets : huit sur les temps 14 à 21, puis deux à 14,60 et 14,83 s quand la file s'allonge, en six tailles.
- La photo de feuille fournie montre le recto imprimé : le dos est obtenu en effaçant l'impression, et le recto apparaît sur la page qui tourne.
- Vestiaire sans sac : banc et chaussures de la photo fournie.
- Le short est hachuré à l'encre avec le reste du maillot.

- Fond : surface anthracite mate, calculée par `outils/preparer_fond.py`, sur demande d'Antoine le 12/10. La nappe de la buvette et les gobelets sont retirés.
- Son du feutre : sur la même demande, grain coupé à 3 800 Hz, crépitements réduits au quart et couinement supprimé, à −19 dB pour le croquis et −21 dB pour les passes de couleurs ; l'écriture du logo et le contour de l'étiquette restent muets. La piste des autres bruitages garde son niveau, car son gain se calcule sur le réglage livré la première fois ; dans le mix ramené à −14 LUFS, l'ensemble monte de 0,2 dB.

## Ce qui reste ouvert

- Seconde 19 figée à partir de 19,00 s, une image et demie avant la tenue du bouton : à garder, ou à corriger en décalant de quelques images la fin de l'entrée du bouton.

- Logo HD, set HD, avis et nombre de clubs équipés : [à fournir], laissés vides (détail dans `README.md`).
- Feuille de match fournie en 2000 px de haut, sous les 2400 px demandés.
- Objection traitée (maquette validée, prix par palier) : déduite de `PRODUCT.md`, à confirmer.
- Avertissement lint sur la taille du fichier : découper la composition en sous-compositions si la vidéo doit évoluer.
