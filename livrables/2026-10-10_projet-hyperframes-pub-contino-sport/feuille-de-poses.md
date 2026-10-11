# Feuille de poses : pub Meta Contino Sport, set football, 9:16

Minutage provisoire, calé sur une estimation de la voix off. Il sera recalé sur l'horodatage de la voix générée : toutes les heures du code viennent de l'objet `T` de `index.html`, écrit par `outils/minutage.py` depuis `minutage.json`. Les heures du plan 6 sont données relativement à `T6`, début du plan 6.

## Registres

- **Registre personnage** : le ballon de foot générique dessiné en SVG (`#b1` à l'accroche, `#b2` au dernier plan). Les onze principes s'appliquent en entier : squash & stretch à volume constant (`scaleX = 1 / scaleY`), arcs, anticipation, follow-through, dépassement.
- **Registre éditorial** : textes, prix, grille, photos, captures du studio, logo, bouton. Glissés et fondus en `power2` ou `power3`, stagger d'entrée de 0,08 à 0,12 s, stagger de sortie de 0,03 à 0,05 s (sorties rapides), aucun squash sur le texte. Trois pastilles reçoivent une pression d'échelle entre 0,97 et 1,03 : le bloc prix (enfoncement de 7 px au contact), la ligne « 500 pcs » de la grille (pulsation à 1,03 quand la voix dit son prix) et le bouton de devis (0,98 et 8 px au contact).

## Canaux par élément imbriqué

| Élément | Canal |
| --- | --- |
| `#b1`, `#b2` (enveloppe) | position `x`, `y` |
| `#b1-body`, `#b2-body` | déformation `scaleX`, `scaleY` (origine 50 % 100 %), inclinaison `rotation` |
| `#b1-spin`, `#b2-spin` | rotation propre du ballon (roulement, vrille) |
| `#b1-hit-a/b`, `#b2-hit-a/b` | impacts au contact (action secondaire) |
| `#b2-shadow`, `#b2-shadow-top` | ombre au sol, puis ombre sur le bouton (action secondaire) |
| `#s1-price`, `#s6-btn` | enfoncement du support (`y`, `scale`), suivi par l'enveloppe du ballon |

## Plan 1, accroche : chute, écrasement au contact du prix, rebond hors champ

Diamètre 150 px. Repos du ballon posé sur le haut de l'étiquette jaune (centre x 700, bas y 292). Première image : la vraie pièce, l'étiquette jaune avec « Chaque joueur en maillot + short » et « Dès 30 pièces » sont déjà à l'écran ; seul le prix se révèle, au contact du ballon.

| Label | t (s) | Pose clé | Intention |
| --- | --- | --- | --- |
| `b1-chute` | 0,00 | au-dessus du cadre (y −460), rond, vrille −60° ; s'étire jusqu'à 1,2 dans l'axe de la chute à 0,30 s | entrer avec du poids |
| `b1-contact` | 0,42 | écrasé 0,62 sur l'étiquette ; l'étiquette et le ballon s'enfoncent de 7 px ; le prix se révèle | faire sentir le poids, poser le prix |
| `b1-decollage` | 0,49 | étiré 1,22, incliné +12° vers la droite | donner l'élan |
| `b1-apex` | 0,82 | rond, haut de l'arc (y −130, haut du ballon à 12 px du bord) | suspendre |
| `b1-sortie` | 1,24 | sort du champ à droite (x +560, y +300), étiré 1,15 en descente | libérer la scène |

Arc : `x` en `ease: none` sur tout le vol, `y` en `power2.out` à la montée puis `power2.in` à la descente. « 25,99 € HT » entièrement révélé à 0,58 s.

## Plan 6, fin : arrivée en roulant, arrêt avec dépassement, pose, saut sur le bouton

Diamètre 120 px. Repos au sol à droite du bouton (centre x 870, bas y 1010). Atterrissage sur le haut du bouton (centre x 640, bas y 880). Les textes du plan entrent entre T6 et T6 + 0,42, avant l'action du ballon.

| Label | t (s) | Pose clé | Intention |
| --- | --- | --- | --- |
| `b2-entree` | T6 + 0,50 | hors champ à droite, roule vers la gauche (roulement sans glissement), penché −6° | arriver |
| `b2-arret` | T6 + 1,05 | dépasse le repos de 25 px, corps penché −10° par l'inertie | arrêt avec dépassement |
| `b2-retour` | T6 + 1,25 | revient au repos, le corps oscille (+5°, −2°) en s'amortissant | follow-through |
| `b2-pose` | T6 + 1,41 à 1,70 | rond, droit, immobile (0,29 s) | pose tenue, le ballon « décide » |
| `b2-anticipation` | T6 + 1,70 | écrasé 0,72, penché +10° (sens inverse du saut), recule de 12 px | annoncer le saut |
| `b2-decollage` | T6 + 2,10 | étiré 1,25, penché −12° vers le bouton | donner l'élan |
| `b2-apex` | T6 + 2,38 | rond, haut de l'arc (bas à y 810) | suspendre |
| `b2-contact` | T6 + 2,55 | écrasé 0,80 sur le bouton ; le bouton et le ballon s'enfoncent de 8 px, le bouton fonce | réception amortie |
| `b2-stabilisation` | T6 + 2,63 à 3,00 | 1,06 puis 0,98 puis rond | revenir au repos |
| `pose-finale` | fin de la voix et du ballon, jusqu'à la fin | tout est immobile, fond compris, sans voix, 1,25 s au moins | laisser lire l'appel |

Saut : `x` en `ease: none` sur 0,45 s ; `y` monte de 200 px en 0,28 s (`power2.out`) puis descend de 70 px en 0,17 s (`power2.in`), soit une gravité apparente d'environ 5 100 et 4 850 px/s², homogène avec l'accroche.

## Bruitages

- `sfx-ballon-contact` à `b1-contact`.
- `sfx-ballon-reception` à `b2-contact`.
- `sfx-bouton` à `b2-contact` + 0,02 s (réaction du bouton).

## Grille d'audit (section 7 de /animations), plan par plan

Remplie dans le rapport final après vérification par `snapshot` et `keyframes --shot`.
