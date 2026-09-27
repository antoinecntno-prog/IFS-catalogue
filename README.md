# IFS-catalogue

Catalogue sublimation 2026 d'IFS, site statique prêt pour Netlify.

## Contenu

- `site/index.html` : la page, avec les données produits et le formulaire de devis (Netlify Forms, formulaire « devis »).
- `site/img/` : photos des produits, chacune en 640 px et en 360 px (`-360.webp`) pour les petits écrans.
- `site/fonts/` : Archivo et Hanken Grotesk hébergées avec le site, avec leurs licences OFL.
- `site/_headers` : cache des photos et des polices, en-têtes de sécurité.
- `netlify.toml` : publie le dossier `site/`.

## Mise en ligne

Relier le dépôt à Netlify, ou glisser le dossier `site/` sur Netlify Drop. Le formulaire de devis n'envoie vraiment qu'une fois le site hébergé sur Netlify ; en local, il propose le lien email prérempli.

## Couleurs

Toutes les couleurs sont des jetons en tête du `<style>` de `site/index.html`, avec leur version pour le thème sombre juste en dessous. Pour changer une teinte, modifier le jeton.

## Remplacer une photo

Déposer deux fichiers WebP en 4:5 dans `site/img/` : `nom.webp` (640 × 800) et `nom-360.webp` (360 × 450), puis renseigner `"photo": "nom"` sur le produit dans `DATA`.
