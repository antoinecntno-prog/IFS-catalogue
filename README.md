# IFS-catalogue

Catalogue sublimation 2026 de Contino Sport (continosport.fr), marque du Groupe Contino. Site statique prêt pour Netlify.

## Contenu

- `site/index.html` : le catalogue et le formulaire de devis (Netlify Forms, formulaire « devis »).
- `site/personnaliser.html` et `site/studio.js` : le studio de personnalisation (logos, textes, face et dos).
- `site/base.css` : polices, couleurs et composants communs aux deux pages.
- `site/donnees.js` : les produits, leurs prix et leur gabarit dans le studio.
- `site/stockage.js` : mémoire locale du navigateur qui porte le visuel du studio jusqu'au devis.
- `site/img/` : photos des produits, chacune en 640 px et en 360 px (`-360.webp`) pour les petits écrans.
- `site/fonts/` : Archivo et Hanken Grotesk, plus les 13 polices du studio (`studio-*.woff2`), toutes libres, avec leurs licences.
- `site/logo-contino-sport.webp` et `site/logo-contino-sport-blanc.webp` : logo de l'en-tête, en thème clair et en thème sombre. `site/c-sport-32.png`, `-192.png` et `-180.png` : favicon C SPORT et icône d'écran d'accueil.
- `site/_headers` : cache des photos et des polices, en-têtes de sécurité.
- `netlify.toml` : publie le dossier `site/`.

## Mise en ligne

Relier le dépôt à Netlify, ou glisser le dossier `site/` sur Netlify Drop. Le formulaire de devis n'envoie vraiment qu'une fois le site hébergé sur Netlify ; en local, il propose le lien email prérempli.

## Ouvrir la page seule

`site/index.html` a besoin des fichiers de son dossier (`base.css`, `donnees.js`, `img/`, `fonts/`). Ouverte seule, elle affiche un message qui renvoie vers le site en ligne ou la version fichier unique. Pour un aperçu, une pièce jointe ou une clé USB, utiliser `2026-10-05_catalogue-sublimation-contino-sport.html` : photos et polices sont incluses dans le fichier. Après toute modification de `site/`, le régénérer avec `python3 outils/fichier-unique.py`.

## Studio de personnalisation

`personnaliser.html?produit=<id>` ouvre le studio sur un produit ; il est relié depuis chaque fiche (« Personnaliser ce produit ») et depuis le devis. Le client y ajoute autant de logos et de textes qu'il veut, les place sur les zones rapides ou à la main, les agrandit par les coins, les fait tourner, et passe de la face au dos. Son visuel est gardé dans son navigateur, produit par produit.

- Gabarits : chaque produit de `site/donnees.js` porte une clé `viz` qui désigne son gabarit dans `site/studio.js` (`T`), par exemple `{"t":"tshirt"}` ou `{"t":"panel","r":[60,80],"d":"flag"}`. Un gabarit déclare ses vues (face, dos) et ses zones rapides : `Z(id, libellé, vue, x, y, w, h)`.
- Polices : liste `FONTS` dans `site/studio.js` et `@font-face` dans `site/personnaliser.html`.
- Designs des maillots : liste `MOTIFS` dans `site/studio.js`, proposée aux gabarits `tshirt` et `tank` (set football, maillots de basket, running et cyclisme). Ce sont les quatre motifs du maillot de la page d'accueil, plus Uni ; le client part d'un design, puis change le fond, le motif et le liseré.
- Devis : « Demander un devis avec ce visuel » ouvre le devis du catalogue avec l'aperçu. La demande reçoit dans Netlify `apercu` (image face et dos), `placement` (description élément par élément) et les fichiers des logos (`fichier`, `logo_2` à `logo_5`). Au-delà de 8 Mo ou de cinq fichiers, les fichiers restants sont nommés dans `placement`.
- La version fichier unique n'inclut pas le studio.

## Couleurs

Toutes les couleurs sont des jetons dans `site/base.css`, partagés par le catalogue et le studio, avec leur version pour le thème sombre juste en dessous. Pour changer une teinte, modifier le jeton.

## Remplacer une photo

Passer par l'outil, qui recadre en 4:5, crée les versions WebP 640 × 800 et 360 × 450, donne au fichier un nom unique et branche la photo sur la fiche :

```
python3 outils/photos.py ajouter image.png set-football            photo principale
python3 outils/photos.py ajouter dos.png set-football --vue 2      vue suivante de la galerie
python3 outils/photos.py ajouter image.png bob --illustration      photo de banque ou d'IA
python3 outils/fichier-unique.py                                   puis régénérer le fichier unique
```

- Le nom du fichier contient une empreinte de son contenu (`set-football-b63550d8.webp`) : une photo remplacée change de nom, et aucun navigateur ne garde l'ancienne en cache. Les photos de `site/img/` sont donc mises en cache un an (`site/_headers`).
- Sans `--illustration`, la photo compte comme une photo réelle de Contino Sport (`"reel": true` dans `site/donnees.js`) : la fiche n'affiche pas la mention « Photo d'illustration ».
- Les vignettes de catégories reprennent la photo du produit désigné par `cover` dans `site/donnees.js`.
