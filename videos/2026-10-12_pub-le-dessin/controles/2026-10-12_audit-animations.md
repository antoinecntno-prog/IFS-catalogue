# Grille d'audit du skill animations

Instants en secondes, pris dans `index.html` et vérifiables sur la planche `2026-10-12_planche-snapshots.jpg`.

## Scène feuille de match (b01 à b04, 0 à 6,563 s)

1. Squash & stretch : oui. Le corps du ballon s'écrase à vol(0,70) et le tient 0,07 s à chaque contact (0,469 ; 1,406 ; 3,750 ; 5,156), puis s'étire dans l'axe de la vitesse : vol(1,25) en 0,10 s au décollage, 1,18 juste avant un contact. Le wrapper porte la position et le corps la déformation. Le set photo reste rigide.
2. Timing : oui. Sur le papier, le ballon vole 0,87 s et monte à 330 px entre 0,539 et 1,406 ; le feutre accélère sur le bord de flamme, de 125 px/s à l'image 0 jusqu'à 1 290 px/s à 0,75, puis trace les contours vers 2 400 px/s.
3. Anticipation : oui. Le ballon recule de 18 px et s'écrase à vol(0,68) avant ses deux grands départs, de 2,81 à 3,23 vers le maillot et de 5,73 à 6,21 vers l'objectif. Le feutre se lève de 12 px avant chaque nouveau trait (0,75 ; 1,30 ; 1,76 ; 2,08). Ses levers durent 0,12 s, sauf entre les deux bandes (0,06 s).
4. Staging : oui, avec un écart de 0,11 s. Le ballon reste immobile de 1,80 à 2,81 pendant que le feutre ferme le contour et pose les bandes. Les dernières hachures finissent à 2,92, quand l'anticipation du ballon a commencé à 2,81. Ensuite la photo naît du point de contact à 3,75 et le set décolle seul à 4,688, avant le rebond du ballon à 5,156.
5. Follow-through : oui. Deux traits de vitesse suivent le ballon avec 0,06 et 0,12 s de retard, et le corps oscille en s'amortissant après chaque atterrissage (1,80 et 4,40). L'ombre du set s'élargit et pâlit pendant le décollage, de 4,688 à 5,29. Le contour du croquis disparaît après la photo, de 4,00 à 4,35.
6. Straight ahead / pose to pose : oui. Les labels `b01_hook` à `fin` sont posés par `tl.addLabel` depuis `TEMPS` et `OFFSET`, et rebonds, tracé, caméra et feutre sont des fonctions pures du temps lues par une horloge.
7. Slow in & slow out : oui. Le push-in suit power2.out après une prise de vitesse de 0,22 s, et le set décolle en power2.out avant de sortir en power2.in (5,29 à 6,04). Le ease none sert aux travellings, dont celui de b02, et à la composante horizontale des sauts. Le tracé du feutre reste en ease none pendant chaque trait, comme le veut le registre.
8. Arcs : oui. Chaque saut combine un sol en ease none et une hauteur en deux demi-paraboles (power2.out puis power2.in), par exemple de 3,23 à 3,75 vers le centre du maillot ; le feutre rejoint le départ suivant en arc.
9. Exaggeration : oui. L'anticipation écrase le ballon à 0,68, plus fort qu'un contact (0,70), et le saut vers le maillot monte à 240 px en 0,52 s ; ces valeurs restent les mêmes dans toute la vidéo.
10. Secondary action : oui, plus discrète que l'action principale. Quatre points d'encre placés par un PRNG à graine fixe apparaissent à chaque contact et s'effacent en 0,9 s, et l'ombre du ballon rapetisse et pâlit avec la hauteur.
11. Appeal : oui. Le ballon a un cercle irrégulier à deux harmoniques, un trait ouvert qui dépasse, un motif décentré et des hachures dans son ombre ; le croquis tremble par feTurbulence à graine fixe.

Le sujet semble-t-il vouloir quelque chose ? Oui. Le motif se tourne vers le centre du maillot à 2,78 et tient jusqu'à 3,23, puis le ballon saute et le dessin devient tissu au contact (3,75) ; à 5,76 il se tourne vers l'objectif avant de foncer.

## Scène vestiaire (b05 à b09, 6,563 à 15,938 s)

1. Squash & stretch : oui. Le ballon s'écrase à vol(0,70) sur le haut de chaque patère, de 6,80 à 9,61 tous les 0,469 s, puis sur la frappe de 10,313 ; les sets restent rigides, leur pendule n'a aucune déformation.
2. Timing : oui. Sur les patères, les rebonds sont courts (0,40 s de vol, 75 px) face aux rebonds longs du papier, et les sets tombent en 0,32 s power2.in avant un pendule de 0,9 s.
3. Anticipation : oui. Le ballon s'écrase et recule de 10,48 à 10,66 avant le saut vers le mur, puis de 15,33 à 15,55 avant le saut vers l'objectif ; les sets, en registre éditorial, n'en ont pas.
4. Staging : oui. Le ballon touche la patère vide un demi-temps avant le set et la quitte avant son arrivée (ballon à 6,80, set 2 à 7,031) ; pendant les cartons du prix, de 13,40 à 15,33, il reste posé sur la patère 8.
5. Follow-through : oui. Chaque set se balance à 6°, -3°, 1,5° puis 0° en 0,9 s, et toute la rangée repart à 10,313 avec 0,06 s de décalage du set 8 au set 1 ; l'étiquette se balance de 1,2° en s'amortissant après 13,40.
6. Straight ahead / pose to pose : oui. Les accrochages tombent sur les temps 14 à 21 (6,563 à 9,844) et les poses de b07 (10,313 et 10,66) sur des labels, avec rebonds et pendules en fonctions pures du temps.
7. Slow in & slow out : oui. Le travelling reste en ease none de 6,563 à 10,313 et finit en power2.out à la même vitesse ; le zoom arrière suit power2.inOut de 13,125 à 15,938.
8. Arcs : oui. Les sauts de patère en patère sont des paraboles, comme l'arc qui mène de la patère 8 au début du logo (10,66 à 11,25).
9. Exaggeration : oui. Avant la frappe, le ballon remonte à 210 px au-dessus de la patère 8 (9,68 à 10,313), presque trois fois la hauteur d'un rebond de patère.
10. Secondary action : oui, plus discrète. Des points d'encre marquent le mur autour des patères et l'ombre du ballon se porte sur le carrelage, décalée de 14 et 18 px.
11. Appeal : oui. Les six tailles vont de 0,62 à 1,00 et le crochet du cintre sort du col de chaque maillot.

Le sujet semble-t-il vouloir quelque chose ? Oui. Le ballon appelle chaque set : il se pose sur la patère vide, et le set tombe à sa place au temps suivant. Sa frappe sur la dernière patère (10,313) fait répondre toute la rangée. Il signe ensuite le mur de 11,25 à 12,65.

## Scène maquette (b10, 15,938 à 18,750 s)

1. Squash & stretch : oui. Après le match cut, le ballon s'étire à 1,15 avant le contact de 16,20, où il s'écrase à vol(0,70). Un petit rebond le pose à 16,50 avec une oscillation amortie. Les cartons et la coche ne se déforment pas.
2. Timing : oui. Les quatre passes de couleurs durent 0,30 s chacune (16,30 ; 16,62 ; 16,94 ; 17,26) et la coche se trace en 0,14 s, de 17,66 à 17,80.
3. Anticipation : oui. Le feutre se lève de 12 px entre la dernière passe et la coche (17,56 à 17,66), et le saut vers l'objectif s'anticipe dans le vestiaire de 15,33 à 15,55.
4. Staging : oui, avec un écart de 0,20 s : le ballon se pose encore pendant le début de la première passe (16,30 à 16,50), puis reste immobile. La ligne 1 du carton arrive à 16,40 avec les couleurs et la ligne 2 à 17,80 avec la coche.
5. Follow-through : oui. Des traits de vitesse suivent la retombée du ballon (15,938 à 16,20), et le feutre se lève après la coche (17,80 à 17,92) avant de sortir.
6. Straight ahead / pose to pose : oui. Passes et coche partent d'instants fixes, et le ballon reste une fonction pure du temps.
7. Slow in & slow out : oui. Le push-in de 1,00 à 1,08 suit power1.inOut et la retombée du ballon power2.in ; les lignes de texte entrent en power3.out et sortent en power2.in.
8. Arcs : oui. La retombée suit un arc bombé de 90 px entre 15,938 et 16,20.
9. Exaggeration : oui. Le ballon arrive vers l'objectif 2,4 fois plus gros avant de retomber sur la feuille.
10. Secondary action : oui, plus discrète. L'ombre grandit pendant la retombée et des points d'encre marquent les contacts de 16,20 et 16,50.
11. Appeal : oui. Le même croquis passe par quatre couples de la palette, à côté de la photo du set posée de biais à 4°.

Le sujet semble-t-il vouloir quelque chose ? En partie. Le feutre veut faire valider la maquette, il essaie les couleurs puis coche à 17,80 ; le ballon regarde depuis le coin, sans intention propre dans cette scène.

## Scène CTA (b11 et b12, 18,750 à 22,500 s)

1. Squash & stretch : oui pour le ballon, qui s'étire au décollage de 21,563. Le bouton ne se déforme pas au-delà de son entrée en scale 0,97 vers 1.
2. Timing : oui. Le bouton reste fixe 2,5 s (19,05 à 21,563) et la page tourne en 0,84 s (21,563 à 22,40).
3. Anticipation : oui. Le coin de la page se soulève lentement avant de tourner vite, en power2.in à partir de 21,563.
4. Staging : oui. Le bouton est le seul centre : le ballon reste immobile de 16,50 à 21,563 et seuls la table (6 px/s) et le reflet bougent.
5. Follow-through : oui. Le rabat porte une ombre pendant le tour de page, et des traits de vitesse suivent le ballon qui remonte (21,825).
6. Straight ahead / pose to pose : oui. Les labels `b11_cta` et `b12_page` bornent la scène, et le pliage est une fonction pure du temps.
7. Slow in & slow out : oui. Le bouton entre en power2.out et la page tourne en power2.in ; la caméra revient par une courbe de Hermite qui arrive immobile sur l'état de l'image 0.
8. Arcs : oui. Le ballon remonte vers le coin haut droit en parabole (21,563 à 22,475) et redescend de là à l'image 0.
9. Exaggeration : oui. Le ballon monte à 1 040 px au-dessus de la feuille, le plus haut rebond de la vidéo.
10. Secondary action : oui, plus discrète. Le reflet glisse sur la feuille, puis le rabat montre le recto de la feuille de match (22,2).
11. Appeal : oui. Le rabat montre le vrai quadrillage de la feuille de match, et la feuille neuve dessous reçoit déjà le trait.

Le sujet semble-t-il vouloir quelque chose ? Oui pour le ballon. Il attend sous le bouton, puis s'élance vers le coin dès que la page part (21,563) pour relancer le dessin, qui reprend sur la feuille neuve à 21,76.
