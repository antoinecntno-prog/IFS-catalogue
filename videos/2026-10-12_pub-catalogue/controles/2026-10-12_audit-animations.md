# Grille d'audit du skill animations, pub « Le carnet »

Instants en secondes, pris dans `index.html` (un temps vaut 0,46875 s) et vérifiables sur les planches `2026-10-12_planche-poses.jpg` et `2026-10-12_planche-revelations.jpg`.

## Hook et héros (b01 à b03, 0 à 4,688 s)

1. Squash & stretch : oui. Le corps du ballon s'écrase à vol(0,70) et tient 0,07 s à chaque contact : case vide à 0,469, croquis du set à 0,938, tote bag à 2,813, sweat à 3,750. Il s'étire jusqu'à 1,18 pendant la chute de l'image 0 et prend 1,25 en 0,10 s au décollage. Le wrapper porte la position et le corps la déformation. Les photos restent rigides : leur rebond de 1 à 1,04 puis 1 en 0,25 s agit sur la case entière.
2. Timing : oui. La chute de l'image 0 finit à 0,469 ; le saut vers le set ne monte qu'à 50 px (0,539 à 0,938) et ceux vers le tote bag et le sweat montent à 120 px en 0,28 s. Le feutre part de 125 px/s sur le bord de flamme, accélère jusqu'à 1 200 px/s environ à 0,300, trace le maillot de 0,422 à 0,872, le tote bag de 1,406 à 2,719 et le sweat de 2,953 à 3,703.
3. Anticipation : partielle. Les petits sauts de cette scène partent sans recul. Le motif du ballon se tourne vers sa case 0,2 s avant de partir (2,28 vers le tote bag, 3,22 vers le sweat), et le feutre se lève de 12 px avant chaque tracé. L'étiquette trace son contour de 0,703 à 0,938 avant d'afficher son texte.
4. Staging : oui. Le ballon reste posé sur le coin de la case 1 de 1,219 à 2,531 pendant que le feutre dessine le tote bag. De 0,422 à 0,938, le feutre et le ballon convergent tous deux vers la case 1, où la photo naît. Accroche et compteur restent fixes ; le texte de l'étiquette entre à 0,938 et 1,055, puis le surlignage à 1,172.
5. Follow-through : oui. Deux traits de vitesse suivent le ballon avec 0,06 et 0,12 s de retard, et son corps oscille en s'amortissant après chaque pose (1,219 ; 3,094). L'étiquette se balance de 1,2° en s'amortissant à partir de 2,930. Le croquis s'efface en 0,25 s sous la photo qui naît.
6. Straight ahead / pose to pose : oui. Les labels `b01_hook` à `fin` sont posés par `tl.addLabel` depuis `TEMPS` et `OFFSET`. Caméra, feutre, ballon, révélations et tour de page sont des fonctions pures du temps lues par une horloge unique.
7. Slow in & slow out : oui. La caméra pousse de P0 vers H1 en power1.inOut (0 à 2,813), glisse vers H2 en power1.inOut, puis descend sur la rangée du bas en power2.inOut (3,750 à 4,219). Les révélations suivent power2.out. Le feutre et le surlignage restent en ease none pendant leur tracé, comme le veut le registre.
8. Arcs : oui. Chaque saut combine un sol interpolé en ease none et une hauteur parabolique ; le feutre rejoint la case suivante par un arc levé.
9. Exaggeration : oui. Le ballon tombe de 700 px au raccord de boucle et s'écrase à 0,70 ; les mêmes valeurs reviennent dans tout le film.
10. Secondary action : oui, plus discrète que l'action principale. Quatre points d'encre placés par un PRNG à graine fixe apparaissent à chaque contact et s'effacent en 0,9 s. L'ombre du ballon rapetisse et pâlit avec la hauteur.
11. Appeal : oui. Le ballon garde le dessin de la pub foot : cercle irrégulier à deux harmoniques, trait ouvert, motif décentré, hachures dans l'ombre. Le feutre oscille de ±3°, et les cases portent un tremblé figé.

Le sujet semble-t-il vouloir quelque chose ? Oui. À 2,28, le motif du ballon se tourne vers la case du tote bag ; le ballon saute, et la photo naît de son contact à 2,813.

## Le 3 et le 0 (b04 à b08, 4,688 à 16,875 s)

1. Squash & stretch : oui. Contacts à vol(0,70) sur le softshell (7,031), l'écharpe (9,375), le bandeau (12,188), le bandana triangulaire (14,063), puis la rafale (15,469 ; 15,938 ; 16,406) et le boxer (16,875). Avant les deux grands sauts, l'anticipation écrase le ballon à vol(0,68).
2. Timing : oui. Les rebonds de la rafale durent 0,40 s pour 90 px, à un par temps. Le grand saut vers le haut du « 3 » monte à 240 px en 0,234 s (6,797 à 7,031). Les révélations tombent à un temps d'écart ; celles des héros durent 0,45 s et les autres 0,30 s.
3. Anticipation : oui. Le ballon recule de 18 px et s'écrase de 6,375 à 6,797 avant le saut vers le softshell, puis de 8,672 à 9,094 avant le saut vers l'écharpe. Le feutre se lève avant chaque pictogramme.
4. Staging : oui. À partir de 3,75, le feutre trace sans arrêt et le ballon reste posé sur du papier libre : marge haute de 7,406 à 9,094, intérieur du « 0 » de 9,656 à 11,906. Le ballon ne bouge que pour ses contacts et ses anticipations. Pendant les fouettés, caméra, ballon et feutre partent dans le même sens, vers la même case.
5. Follow-through : oui. Le corps oscille après chaque pose (7,406 ; 9,656), les traits de vitesse suivent les sauts, les chiffres du compteur roulent en 0,12 s et chaque croquis s'efface sous sa photo.
6. Straight ahead / pose to pose : oui. La liste PRODUITS fixe le temps de chaque révélation ; la caméra suit une interpolation monotone entre les rangées, et les contacts du ballon viennent d'une liste (temps, case).
7. Slow in & slow out : oui. La caméra garde une vitesse constante pendant les enchaînements d'une rangée par temps, ralentit sur les tenues, et fouette en power2.inOut de 6,750 à 7,031 et de 9,047 à 9,328. Les révélations suivent power2.out.
8. Arcs : oui. Les sauts sont des paraboles, y compris pendant les fouettés, où le sol du ballon suit le papier.
9. Exaggeration : oui. Le saut de 240 px vers le haut du « 3 » fait près de trois fois un rebond de la rafale ; les poses gardent les mêmes écrasements que dans la scène précédente.
10. Secondary action : oui, plus discrète. Le feutre entoure le manchon droit de 13,617 à 13,781, colorie le bob en deux passes croisées de 9,844 à 10,289, et des points d'encre marquent chaque contact.
11. Appeal : oui. Les cases dessinent un « 3 » puis un « 0 » ; le bob reste un croquis magenta et jaune sur fond jaune pâle.

Le sujet semble-t-il vouloir quelque chose ? Oui. Le ballon ouvre les familles de produits : il franchit la colonne vide et l'écharpe naît de son contact (9,375), puis la rafale qu'il mène de case en case finit sur le boxer (16,875).

## Révélation du « 30 » (b09 et b10, 16,875 à 21,563 s)

1. Squash & stretch : oui. Le ballon s'écrase sur le boxer (16,875), puis sur la marge haute (18,750), suivi d'un petit rebond de 26 px qui se pose en oscillant à 18,984.
2. Timing : oui. Le vol du boxer à la marge dure 1,8 s pour 260 px, contre 0,40 s pour un rebond de rafale. Le recul de la caméra, de l'échelle 2,4 à 0,92, dure 1,17 s (17,344 à 18,516).
3. Anticipation : oui. La caméra tient la rangée du boxer de 16,875 à 17,344 avant de reculer, et le feutre entoure « 30/30 » de 16,992 à 17,273 avant la sortie du compteur à 17,578.
4. Staging : oui. Le compteur sort pendant le recul et le « 30 » prend le relais du score. Les lignes « produits, prix en ligne » et « Hors taxes, selon la quantité » entrent à 18,750 et 18,984, une fois la caméra posée (18,516).
5. Follow-through : oui. La surface anthracite glisse en parallaxe 0,3 pendant le recul, et le ballon s'amortit après sa pose.
6. Straight ahead / pose to pose : oui. Recul, pose V et dérive de la surface sont des fonctions pures du temps entre les labels `b09_trente` et `b10_prix`.
7. Slow in & slow out : oui. Le recul interpole le logarithme de l'échelle en power2.inOut ; la pose V pousse de 0,92 à 0,93 en power1.inOut ; les cartons entrent en power3.out.
8. Arcs : oui. Le long vol du ballon suit une parabole pendant que la caméra recule.
9. Exaggeration : oui. Le rebond de 260 px est le plus haut de la construction.
10. Secondary action : oui, plus discrète. La surface anthracite dérive de 6 px/s à partir de 18,750, sous la feuille immobile.
11. Appeal : oui. 29 photos et le croquis du bob forment le nombre qu'annonce le film ; le « 30 » reste lisible sur une vignette de 135 × 240 px.

Le sujet semble-t-il vouloir quelque chose ? Oui. Après le dernier produit, le ballon rebondit haut et se pose au-dessus du « 0 », comme pour signer le nombre (18,750).

## CTA et page (b11 à b13, 21,563 à 30 s)

1. Squash & stretch : oui. Le ballon s'écrase sur le coin du bon (21,938), au dribble (24,375), sur le bouton (26,250), au retour sur le coin (26,719) et sur le coin de la feuille (28,125). Le bouton, en registre éditorial, descend à 0,96 en 0,08 s puis revient en 0,25 s.
2. Timing : oui. Le clic dure 0,33 s en tout, le tour de page 0,84 s en power2.in, et la plongée finale 1,41 s (28,594 à 30).
3. Anticipation : oui. Le ballon recule de 18 px et s'écrase de 27,375 à 27,797 avant la frappe ; le bon sort de 27,891 à 28,125 et découvre le coin avant le contact.
4. Staging : oui. Le contenu du bon entre ligne après ligne (logo à 22,125, phrase à 22,219, bouton à 22,313, adresse à 22,453). Le ballon attend sur le coin du bon de 21,938 à 26,0, sauf pendant le dribble. Le bouton reste fixe de 22,613 à 27,891, sauf pendant l'appui de 26,250.
5. Follow-through : oui. Le rabat de la page porte son ombre, le ballon s'amortit après chaque pose, et la dérive de la surface revient à zéro à 30 par une courbe de Hermite à vitesse nulle.
6. Straight ahead / pose to pose : oui. Le bon, le bouton, le pliage et la plongée sont posés sur les labels `b11_cta`, `b12_clic` et `b13_page`.
7. Slow in & slow out : oui. La caméra passe de V à C en power2.inOut (21,563 à 22,125). Le bon entre en power3.out (21,797 à 22,078) et sort en power2.in. La plongée suit une courbe de Hermite à pentes nulles, et la caméra arrive immobile sur l'image 0.
8. Arcs : oui. Les sauts vers le bouton et vers le coin de la feuille sont des paraboles. Le dernier vol monte jusqu'à 29,672 puis retombe sur la case vide de l'image 0.
9. Exaggeration : oui. La remontée de 700 px après la frappe est le plus haut vol du film.
10. Secondary action : oui, plus discrète. Des points d'encre marquent chaque contact, et le rabat montre le recto imprimé de la feuille de match.
11. Appeal : oui. Le bon porte un bord perforé et des pointillés ; le ballon se pose sur son coin.

Le sujet semble-t-il vouloir quelque chose ? Oui. À 26,250, le ballon appuie sur « Recevoir mon devis » et montre le seul geste à faire. Il frappe ensuite le coin de la feuille (28,125) et tourne la page pour recommencer.
