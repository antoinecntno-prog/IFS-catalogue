# Relevé Apple et poses du film complet

Règle : chaque mouvement reprend celui du film Apple « The new 14” MacBook Pro with M6 », mesuré image par image (24 images par seconde, de 0 à 2,75 s et de 4,3 à 6,3 s). Seul le contenu change : marque sur le capot, textes, plaques filmées. Registre éditorial : aucun mouvement ajouté.

## Plan continu `ouverture` (0 à 4,42 s)

| t (s) | Apple, mesuré | Contino Sport |
|---|---|---|
| 0 à 0,46 | MacBook fermé vu du dessus, recul très lent (échelle 0,97) | ordinateur fermé vu du dessus, monogramme Contino Sport sur le capot, même recul |
| 0,46 à 0,96 | bascule en accélérant, pose nette à 0,96 s : rotation 47° dans le plan (qui démarre plus tard que le recul), inclinaison 57 à 60°, échelle 0,34, centre décalé de (+10, +26) px, luminance de 130 à 61 | mêmes courbes (14 mesures pour le recul, 10 pour la rotation), mêmes valeurs finales, même baisse de lumière |
| 0,96 à 1,72 | produit immobile en isométrique au centre | identique |
| 1,72 à 2,20 | le titre sort du noir, éclairé depuis le faisceau vers l'extérieur | même éclairage radial (masque animé) |
| 1,73 à 2,40 | le capot se lève vers la caméra (environ 15° à 1,84 s, 35° à 1,92 s, 55° à 2,0 s), le clavier se découvre en bas à droite, puis c'est le portable filmé | même ouverture ; la plaque V1 prend le relais avec un portable ouvert au même endroit |
| 1,85 à 2,30 | le faisceau naît à droite du portable et s'étend jusqu'au coin haut droit | même polygone final mesuré, même croissance |
| 2,30 à 4,42 | tout est fixe, seule la plaque vit | identique |

Géométrie du titre : ligne de base à 30°, haut des lettres orienté vers le haut à droite, même sol que le produit. Points de départ mesurés (1920 × 1080) : NEW (370, 267), MACBOOK PRO (132, 382), WITH (1317, 522), M6 (1020, 678). NOUVEAU, CATALOGUE, ÉDITION et 2026 partent des mêmes points ; 2026 est réduit pour tenir dans la longueur de M6.

## Plan `ecran` (4,42 à 5,34 s)

Apple : capture native de l'application, recadrée dans le coin haut gauche, fixe, sans zoom. Contino Sport : capture du Studio sur un écran de 2880 × 1620 à l'échelle 1, recadrée de la même façon.

## Plan `preuve` (5,34 à 7,60 s)

| t après la coupe (s) | Apple | Contino Sport |
|---|---|---|
| 0 à 0,17 | « 11X » balayé de gauche à droite, bord oblique | « 0 € », même balayage |
| 0,08 à 0,21 | « UP TO » | pas d'équivalent dans le texte retenu |
| 0,21 à 0,31 | « FASTER » | « DE PLUS » |
| 0,28 à 0,42 | « GRAPHICS » | « PAR COULEUR » |
| 0,42 à la coupe | texte immobile, seule la caméra à l'épaule bouge | texte immobile, la plaque Veo apportera le mouvement |

## Suite du film (7,6 à 53,4 s)

Relevé à 4 images par seconde sur planches contact (outils-calage/planche.py), masques extraits automatiquement : enveloppe de la zone filmée, rééchantillonnée en 96 points (outils-calage/formes.py) ou bords de biseau ajustés par droites (outils-calage/biseau.py). Les clés s'interpolent image par image dans assets/calque.js.

| TC (s) | Composition | Apple, mesuré | Contino Sport |
|---|---|---|---|
| 7,60 à 8,42 | pivot | trapèze fixe (78, 0), (1841, 0), (1502, 1080), (421, 1080) | même trapèze, plaque V2 |
| 8,42 à 10,98 | loft | V vu d'en haut qui pivote en biseau de 8,5 à 9,0 s puis s'élargit, approche de la caméra | même biseau (10 clés), plaque V1 qui grossit de 1 à 1,7 |
| 10,55 à 13,10 | cuisine | capot qui passe tout près de l'objectif (180 à 1420 px à 10,75 s), puis bande oblique figée dès 12,25 s | capot de synthèse avec le monogramme, même trajectoire, bande relevée (9 clés), plaque V3 |
| 13,10 à 14,72 | macro | écran en biais, état qui change à 13,6 s ; macro de l'image, état qui change à 14,17 s | Studio réel en biais, logo déposé à 13,6 s ; macro de la poitrine, logo sélectionné puis posé |
| 14,72 à 15,45 | clavier | macro clavier, mains | clavier de synthèse, mains à fournir en plaque |
| 15,45 à 16,62 | devis | ligne de code qui se tape | champ Précisions du devis, 23 caractères tapés sur une ligne commencée |
| 16,62 à 18,12 | fiche | écran en biais et téléphone (1014 à 1824 px), cartes qui défilent selon le profil écrit dans le code : 36 cartes/s, montée 0,2 s, freinage 0,5 s, exposant 3 | fiche réelle du set football sur ordinateur et téléphone, galerie qui défile avec ce même profil, 13 cartes |
| 18,12 à 21,00 | preuve2 | V de face, capot devant, texte qui entre par la droite (bord gauche 436, 160, 68 px), recul, bascule verticale à 20,62 s | même V (10 clés), capot de synthèse, « 30 RÉFÉRENCES PERSONNALISABLES », même entrée, même bascule |
| 20,62 à 25,90 | mosaique | trois ordinateurs fermés en ligne (186 × 144 px, pas de 516 px), trapèzes à 60° qui se déplient, panoramique qui accélère, le quatrième devient le rectangle haut droit (954 à 1920 × 0 à 558 px) | trois ordinateurs de synthèse, mêmes trapèzes, même panoramique, plaques I1 à I4 puis V4 |
| 25,90 à 30,12 | batterie | quatre quarts de cadre autour du centre (960, 540), texte épinglé au coin qui tourne : -60°, 0°, 90° puis -45°, 0°, 90° | mêmes masques, « PRIX AFFICHÉS » puis « PALIER PAR PALIER », mêmes rotations |
| 30,12 à 33,40 | nuit | petite forme de nuit, de dos puis de trois quarts | mêmes formes (13 clés), plaque V1 de nuit |
| 33,40 à 37,62 | fermeture | V de face, le capot se rabat pendant que la caméra monte au zénith, produit seul (606 à 1308 × 288 à 798 px) | même V (12 clés), ordinateur de l'ouverture qui se ferme, même pose finale |
| 37,62 à 39,90 | titre | titre à plat aligné à 600 px, mot par mot puis caractère par caractère, léger recul | NOUVEAU / CATALOGUE / ÉDITION / 2026, même construction |
| 39,90 à 48,25 | logo | logo centré dans un halo qui s'éteint, mentions en bas | monogramme Contino Sport, mentions du dossier |
| 48,25 à 53,40 | noir | noir | noir |

## Écarts qui restent

- Tant que la plaque V1 n'existe pas, l'ordinateur de synthèse reste ouvert dans le faisceau.
- Texte des preuves : Apple a un petit mot en tête (UP TO, OF), les textes retenus n'en ont pas.
- Plaques filmées : V1 à V4, I1 à I4, L et les mains du clavier sont des aplats étiquetés en attendant les clips Veo.
- Mosaïque : le dossier prévoyait trois maillots à plat ; le film garde les trois ordinateurs d'Apple, cohérents avec l'ouverture.
- Les formes des plans de nuit suivent la partie éclairée de l'image Apple : leurs bords sont un peu arrondis là où la scène se perd dans le noir.
