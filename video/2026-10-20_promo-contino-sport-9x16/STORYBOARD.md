# Storyboard : film vertical Contino Sport (9:16)

Film original de 60 s en 1080 × 1920, 30 i/s. Il suit le parcours d'un client sur continosport.fr dans le langage des promos d'applis : écrans de téléphone en perspective, gros plans inclinés sur l'interface, fonds de couleur pleine, mots géants en fond, cercles de tap jaunes, formes géométriques, coupes calées sur le tempo. Les scènes, les textes et la musique sont propres à Contino Sport.

## Grille

105 BPM. Un temps = 0,5714 s, une mesure = 2,2857 s. Temps n° k = k × 0,5714 s depuis 0. Les coupes et les punch-ins tombent sur des temps ; les apparitions d'éléments tombent sur des croches (0,2857 s).

Musique (original, `outils/son.py`) : intro filtrée avec souffle montant (0 à 4,43), silence de 4,43 à 4,571, premier départ à 4,571, groove A jusqu'à 20,0, arrêt de 20,0 à 20,571 avec souffle inversé, groove B de 20,571 à 40,857, coupure et coup sourd à 40,857, pause calme de 41,143 à 50,0 avec montée à partir de 45,714, silence de 50,0 à 50,286, second départ à 50,286, impact final à 57,143, extinction jusqu'à 60.

Le groove a des coupures sèches d'une croche à la fin de chaque deuxième mesure (le mix se tait puis repart) : les punch-ins visuels se placent sur ces relances.

## Direction visuelle

- Couleurs (site) : magenta `#B3125F`, magenta foncé `#940E4E`, jaune `#FFE45C`, encre `#1A1320`, blanc, surface `#F4F0F3`. Couleurs de club pour les fonds de sport : rouge `#D62839`, bleu roi `#1F4FD1`, vert `#138A4B`, marine `#0E1B4D`, or `#E8B021`, turquoise `#19C3A6`.
- Polices : Archivo (titres, 800 à 900, `font-stretch` 78 à 85 %, capitales pour les gros mots) et Hanken Grotesk (texte). Fichiers dans `assets/fonts/`.
- Écran de téléphone : carte blanche sans coque, coins arrondis 56 px, ombre douce, interface du site recomposée en HTML (voir `assets/kit.css` et les captures de `reference/`).
- Tap : point jaune plein + onde jaune qui s'élargit (`.tap` du kit). Bouton pressé : `scale` 0,95 puis 1.
- Formes : petits triangles, anneaux, croix et traits aux couleurs du site, qui dérivent ou éclatent au départ des sections.
- Zone sûre Reels : texte important entre y = 220 et y = 1500, marge latérale de 64 px.

## Scènes

Les temps sont globaux ; le temps local d'une scène = temps global − début de la scène.

| # | Fichier | Début | Fin | Contenu |
| --- | --- | --- | --- | --- |
| 1 | `s01-mur.html` | 0 | 4,571 | Mur de fiches produits du catalogue, incliné, colonnes qui défilent en sens contraires de plus en plus vite. Bande d'encre magenta qui traverse en diagonale à 2,29 et porte « VOUS L'IMAGINEZ. » puis « NOUS L'IMPRIMONS. » (mots qui claquent sur les croches). Recul à 0,97 juste avant 4,43. |
| 2 | `s02-logo.html` | 4,571 | 6,857 | Fond magenta, logo blanc qui arrive sur le départ, souligné jaune, « Sublimation textile pour clubs et entreprises », éclat de formes. Punch-in sur la relance. |
| 3 | `s03-accueil.html` | 6,857 | 11,429 | Fond jaune. Écran de la page d'accueil qui monte en perspective (couché puis redressé), la page défile jusqu'aux catégories, tap sur « Maillots & shorts » à 10,29, traversée dans la vignette. |
| 4 | `s04-sports.html` | 11,429 | 20,571 | Une mesure par sport. Écran de face au centre, mot géant en fond sur trois lignes qui défilent, fond de couleur qui change : Football (magenta, maillot de football 19,99 € HT dès 30 pcs), Cyclisme (bleu roi, 28,99 € HT dès 30 pcs), Running (vert, 22,99 € HT dès 30 pcs), Supporters (encre, écharpe 6,29 € HT dès 100 pcs). L'écran change par poussée verticale. À 20,0 tout se fige (arrêt musical). |
| 5 | `s05-catalogue.html` | 20,571 | 25,143 | Fond blanc. Grille du catalogue en très gros plan, inclinée, qui défile vite puis freine. Gros texte « 30 RÉFÉRENCES » et « 9 CATÉGORIES ». Tap sur le set football à 24,0, traversée dans la carte. |
| 6 | `s06-fiche.html` | 25,143 | 29,714 | Fond surface. Fiche du set football couchée en perspective, la caméra glisse jusqu'à la grille de prix. La surbrillance avance d'un palier par temps : 30 pcs (26,0), 50 pcs (26,57), 100 pcs (27,14, elle s'y arrête). Coupe en macro sur « Personnaliser ce produit », tap à 28,86. |
| 7 | `s07-studio.html` | 29,714 | 34,286 | Fond encre avec halo magenta. Écran du studio de face, gros maillot. Taps : rayures rouges (30,286), marine et or (31,143), « + Logo » (32,0), « Dos » (32,857, le maillot pivote : VOTRE NOM, 10). Mention « Aperçu indicatif ». Titre au-dessus : « VOTRE LOGO. VOS COULEURS. » |
| 8 | `s08-devis.html` | 34,286 | 38,857 | Fond magenta. Formulaire de devis posé à plat en perspective, vu de haut. Taps : « Club sportif » (35,143), quantité « 100 à 249 » (36,0), « Continuer » (36,857, la barre passe à l'étape 2), frappe de l'e-mail de 37,3 à 37,9 (« contact@votreclub.fr »). |
| 9 | `s09-envoi.html` | 38,857 | 41,143 | Macro sur le bouton jaune « Envoyer ma demande », tap à 39,429, éclair jaune plein cadre, coche qui se trace et « Demande envoyée » à 40,0. Coupure à 40,857. |
| 10 | `s10-suivi.html` | 41,143 | 50,286 | Pause musicale. Fond encre. Très gros plan incliné sur une frise de suivi, la caméra descend : Demande reçue (41,714), BAT numérique validé (43,429), Production en Europe (45,143), Expédition (46,857), Livraison au club (48,571). Pendant la montée (45,714 à 50,0) la caméra accélère et pousse ; flash blanc à 50,286. |
| 11 | `s11-montage.html` | 50,286 | 54,857 | Second départ. Huit photos produits plein cadre, une par temps, punch-in à chaque coupe. Quatre engagements, deux temps chacun : « Prix affichés palier par palier », « Couleurs illimitées, même prix », « BAT avant production », « Fabriqué en Europe ». |
| 12 | `s12-fin.html` | 54,857 | 60 | Fond blanc. Logo, « Sublimation textile pour clubs et entreprises », « continosport.fr » en magenta, bouton jaune « Demandez votre devis ». Impact final à 57,143 : bande magenta et jaune qui balaie le bas, punch-in. Tenue jusqu'à 60. |

Raccords gérés par l'hôte (`index.html`) : flash blanc à 4,571, 20,571 et 50,286 ; bande d'encre en diagonale à 6,857, 25,143, 34,286 et 54,857.

## Règles de contenu

- Prix et noms : ceux de `site/donnees.js`, rien d'autre.
- « Fabriqué en Europe » pour ces produits ; aucun avis, aucun délai chiffré, aucune référence client.
- Photos exclues : maillots de basket (accord des clubs à confirmer) et bob (photo de banque d'images).
- Tout aperçu du studio porte « Aperçu indicatif ».
- Textes français sans tiret cadratin ni demi-cadratin.
