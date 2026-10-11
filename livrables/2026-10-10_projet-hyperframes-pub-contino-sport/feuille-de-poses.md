# Feuille de poses : pub Meta Contino Sport, set football, 9:16

Minutage provisoire, calé sur une estimation de la voix off. Il sera recalé sur l'horodatage de la voix générée : toutes les heures du code viennent de l'objet `T` de `index.html`, et les heures ci-dessous se décalent avec lui.

## Registres

- **Registre personnage** : le ballon de foot générique dessiné en SVG (`#b1` à l'accroche, `#b2` au dernier plan). Les onze principes s'appliquent en entier : squash & stretch à volume constant, arcs, anticipation, follow-through, dépassement.
- **Registre éditorial** : textes, prix, grille, photos, captures du studio, logo, bouton. Glissés et fondus en `power2/power3.out`, stagger de 0,06 à 0,1 s, aucun squash sur le texte. Le bouton et le bloc prix reçoivent au plus une pression de 0,97 à 1 (pastilles et boutons uniquement).

## Canaux par élément imbriqué

| Élément | Canal |
| --- | --- |
| `#b1`, `#b2` (enveloppe) | position `x`, `y` |
| `#b1-body`, `#b2-body` | déformation `scaleX`, `scaleY` (origine 50 % 100 %), inclinaison `rotation` |
| `#b1-spin`, `#b2-spin` | rotation propre du ballon (roulement, vrille) |
| `#b1-hit-a/b`, `#b2-hit-a/b` | impacts au contact (action secondaire) |
| `#b2-shadow`, `#b2-shadow-top` | ombre au sol, puis ombre sur le bouton (action secondaire) |
| `#s6-btn` | pression du bouton (`y`, `scale`, couleur de fond) |

## Plan 1, accroche : chute, écrasement au contact du prix, rebond hors champ

Diamètre 150 px. Repos du ballon posé sur le haut du bloc prix (centre x 700, bas y 360).

| Label | t (s) | Pose clé | Intention |
| --- | --- | --- | --- |
| `b1-chute` | 0,00 | au-dessus du cadre (y −460), étiré 1,2 dans l'axe de la chute, vrille −60° | entrer avec du poids |
| `b1-contact` | 0,42 | écrasé 0,62 sur le bloc prix, le prix apparaît, le bloc s'enfonce de 6 px | faire sentir le poids, poser le prix |
| `b1-decollage` | 0,49 | étiré 1,22, incliné +12° vers la droite | donner l'élan |
| `b1-apex` | 0,82 | rond, haut de l'arc (y −200) | suspendre |
| `b1-sortie` | 1,24 | sort du champ à droite (x +560, y +300), étiré 1,15 en descente | libérer la scène |

Arc : `x` en `ease: none` sur tout le vol, `y` en `power2.out` à la montée puis `power2.in` à la descente. « 25,99 € HT » posé à 0,58 s, « Dès 30 pièces » posé à 0,58 s.

## Plan 6, fin : arrivée en roulant, arrêt avec dépassement, saut sur le bouton

Diamètre 120 px. Repos au sol à droite du bouton (centre x 870, bas y 1010). Atterrissage sur le haut du bouton (centre x 640, bas y 880). `T6` = début du plan 6.

| Label | t (s) | Pose clé | Intention |
| --- | --- | --- | --- |
| `b2-entree` | T6 + 0,50 | hors champ à droite, roule vers la gauche, penché −6° | arriver |
| `b2-arret` | T6 + 1,05 | dépasse le repos de 25 px, corps penché −10° par l'inertie | arrêt avec dépassement |
| `b2-retour` | T6 + 1,25 | revient au repos, corps qui oscille puis se redresse | follow-through |
| `b2-pose` | T6 + 1,25 à 1,55 | rond, immobile | pose tenue, lisible |
| `b2-anticipation` | T6 + 1,55 | écrasé 0,72, penché +10° (sens inverse du saut), recule de 12 px | annoncer le saut |
| `b2-decollage` | T6 + 1,95 | étiré 1,25, penché −12° vers le bouton | donner l'élan |
| `b2-apex` | T6 + 2,17 | rond, haut de l'arc (bas à y 800) | suspendre |
| `b2-contact` | T6 + 2,40 | écrasé 0,80 sur le bouton, le bouton s'enfonce et s'éclaire | réception amortie |
| `b2-stabilisation` | T6 + 2,48 à 2,85 | 1,06 puis 0,98 puis rond | revenir au repos |
| pose finale | fin de la voix jusqu'à la fin | tout est immobile, sans voix, 1,2 s au moins | laisser lire l'appel |

## Bruitages

- `sfx-ballon-contact` à `b1-contact`.
- `sfx-ballon-reception` à `b2-contact`.
- `sfx-bouton` à `b2-contact` + 0,02 s (réaction du bouton).

## Grille d'audit (section 7 de /animations), plan par plan

Remplie dans le rapport final après vérification par `snapshot` et `keyframes --shot`.
