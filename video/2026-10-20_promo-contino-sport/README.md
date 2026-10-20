# Film Contino Sport, du maillot au devis

Film promotionnel de 60 s en 1920 × 1080, 30 images par seconde, pour continosport.fr. Il suit le parcours d'un client sur le site : la promesse, le catalogue, un produit et sa grille de prix, le studio de personnalisation, la demande de devis, le suivi jusqu'à la livraison.

Le rendu final est `../2026-10-20_film-contino-sport.mp4`.

## Contenu

- `index.html` : la composition HyperFrames, onze scènes sur une seule timeline GSAP.
- `outils/son.py` : la bande-son, musique et bruitages synthétisés de zéro (Python, numpy et scipy). Sortie dans `assets/audio/`.
- `assets/` : photos des produits reprises de `site/img/`, polices Archivo et Hanken Grotesk du site, logo agrandi en PNG, GSAP en local.

## Grille et scènes

Tempo 105 BPM : un temps dure 0,571 s, une mesure 2,286 s. Chaque changement de scène tombe sur une mesure.

| Début (s) | Scène | Musique |
| --- | --- | --- |
| 0 | La promesse s'imprime, quatre produits apparaissent | Intro filtrée, souffle qui monte |
| 4,571 | Logo sur fond magenta | Premier départ, impact |
| 6,857 | La page d'accueil dans un téléphone, tap sur Maillots & shorts | Groove |
| 11,429 | Un sport par mesure : football, cyclisme, running, supporters, avec leur prix d'entrée | Groove, arrêt d'un temps à 20 s |
| 20,571 | Le mur du catalogue, 9 catégories et 30 références | Relance |
| 25,143 | Fiche du set football, la grille de prix avance jusqu'au palier 100 pcs | Groove |
| 29,714 | Studio : deux changements de couleurs, logo posé, vue de dos | Groove |
| 36,571 | Demande de devis : quantité 100, échéance, envoi | Groove |
| 41,143 | Suivi en quatre étapes, de la demande à la livraison | Pause, nappe et arpège, montée |
| 50,286 | Montage de huit photos et quatre engagements du site | Second départ, impact |
| 54,857 | Logo, continosport.fr, Demandez votre devis | Dernier impact à 57,143 puis extinction |

Les prix affichés viennent de `site/donnees.js`. Les quatre engagements du montage sont ceux du bandeau d'accueil.

## Modifier et refaire le rendu

```
python3 outils/son.py                                   # si un repère ou un son change
npx hyperframes check .                                 # contrôle de la composition
npx hyperframes preview                                 # relecture et retouches dans le Studio
npx hyperframes render . -o renders/film.mp4 -f 30 -q delivery --crf 20
```

Le fichier livré a ensuite reçu un réglage de volume à -14 LUFS (niveau courant des réseaux et du web), image recopiée sans réencodage : mesure avec `ffmpeg -i film.mp4 -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null -`, puis second passage `loudnorm` avec les valeurs mesurées et `-c:v copy`.

Les repères de temps sont écrits deux fois : en tête de `outils/son.py` (taps, transitions, étapes) et dans le script de `index.html`. Un repère déplacé se change aux deux endroits.

Sur une machine sans Chrome pour HyperFrames, `npx hyperframes browser ensure` l'installe, ou la variable `HYPERFRAMES_BROWSER_PATH` désigne un Chromium existant.
