# Feuille de poses, plans 1 à 4

Registre : **éditorial** sur tout le film (produit, titres, interface, chiffres). Les principes de Lasseter s'appliquent en version douce : staging, slow in et slow out, chevauchement par décalage, anticipation discrète. Aucun écrasement ni rebond sur le texte. Les personnes filmées (plaques Veo) apportent seules le jeu d'acteur.

Cadence : 24 i/s, comme le film Apple (23,976 i/s). Temps locaux à chaque scène.

## Scène `packshot` (0,0 à 2,0 s du film)

| Label | t (s) | Pose clé | Intention |
|---|---|---|---|
| `approche` | 0,00 | set à plat, vu du dessus, échelle 1 | poser le produit seul |
| `anticipation` | 0,90 | échelle 1,025, remonté de 8 px | rapprochement lent, sens inverse du recul qui suit |
| `bascule` | 0,95 | début de l'inclinaison | quitter la vue du dessus |
| `iso` | 1,85 | rotX 56°, rotZ −38°, échelle 0,3, opacité 0,75 | produit petit au centre, là où le faisceau va s'ouvrir |

## Scène `titre` (2,0 à 4,4 s)

| Label | t (s) | Pose clé | Intention |
|---|---|---|---|
| `ouverture` | 0,00 | faisceau fermé au point où le produit s'est posé | le produit devient le décor (transition causée) |
| `faisceau` | 0,55 | faisceau ouvert sur la plaque Veo | révéler la présidente |
| `mots` | 0,18 | mots allumés un par un, 0,07 s d'écart, flou 6 px vers 0 | chevauchement : les mots démarrent quand le faisceau est à un tiers |
| `tenue` | 0,95 | titre posé, immobile | la caméra seule glisse, le titre ne bouge plus |

## Scène `studio` (4,4 à 5,4 s)

| Label | t (s) | Pose clé | Intention |
|---|---|---|---|
| `uni` | 0,00 | Studio, maillot blanc, cadre serré | montrer l'outil réel |
| `eclats` | 0,30 | design Éclats, entre à 103 % et se pose en 0,25 s | changement d'écran lu comme un clic |
| `magenta` | 0,58 | couleur magenta, même entrée | la couleur arrive sur le produit |

## Scène `preuve` (5,4 à 7,6 s)

| Label | t (s) | Pose clé | Intention |
|---|---|---|---|
| `pov` | 0,00 | POV écran et clavier | raccord avec l'écran du plan précédent |
| `chiffre` | 0,05 | « 0 € » balayé de gauche à droite en 0,45 s | le chiffre arrive d'abord |
| `mots` | 0,20 | « DE PLUS PAR COULEUR » balayé en 0,5 s | chevauchement avec le chiffre |
| `tenue` | 0,75 | texte posé, immobile jusqu'à la coupe | le décor derrière glisse, le texte tient |

## Écarts volontaires

- Pas de squash ni de follow-through : aucun personnage dessiné, uniquement du registre éditorial.
- Les mouvements de caméra (glissés de 2,4 s et 2,2 s) sont en `power2.inOut` et latéraux, sans zoom lent sur le titre.
