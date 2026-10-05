# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Deux publics de poids égal (confirmé par Antoine le 27/09/2026) :

- **Clubs sportifs amateurs** : dirigeants bénévoles (présidents, trésoriers) et responsables équipement qui habillent une ou plusieurs équipes (football, basket, handball, volley, cyclisme, running). Ils comparent les prix et font valider le budget par le bureau, avec une échéance fixe : la reprise de la saison.
- **Entreprises** : services communication et RH qui commandent des tenues et du textile promotionnel à leurs couleurs, y compris pour leurs événements.

Associations, collectivités, écoles et universités passent aussi commande (ce sont des profils du formulaire de devis), sans être prioritaires dans les arbitrages.

Leur tâche sur le catalogue : trouver le produit au prix de leur palier de quantité, puis demander un devis.

## Product Purpose

Le catalogue sublimation 2026 présente 34 références personnalisables en 9 catégories, avec les prix unitaires hors taxes par palier de quantité, et transforme la consultation en demande de devis. Une visite réussie se termine par un devis envoyé avec un produit chiffrable et des coordonnées exploitables.

## Positioning

Les prix sont affichés, palier par palier, là où beaucoup de fournisseurs de textile personnalisé répondent « sur devis ». Le client valide un BAT numérique avant toute production, et le nombre de couleurs ne change pas le prix. Derrière le catalogue, un interlocuteur industriel textile réel : IFS, atelier du Groupe CONTINO dans les Vosges, spécialisé en sublimation, coupe, confection, flocage et broderie (source : fiche Textile Alsace de mars 2026, Drive d'Antoine).

Les produits de ce catalogue sont fabriqués en Europe par un partenaire ; IFS chiffre et coordonne (confirmé le 27/09/2026).

## Operating Context

- **Saison** : les clubs commandent en juin et juillet pour jouer équipés à la reprise de septembre (reprise du championnat amateur de football le 13 septembre 2026). Source : veilles LinkedIn IFS de juin à août 2026.
- **Parcours** : recherche dans l'en-tête (collé en haut sur toute la page) ou rangée de catégories, fiche produit avec photos et grille tarifaire, demande de devis en deux étapes (projet, puis coordonnées), BAT numérique, production, livraison.
- **Règles commerciales affichées** : prix HT, transport inclus sauf mention sur la fiche, tarif du palier atteint par modèle, minimum par produit (en dessous : frais de lancement de 50 € HT ou devis petite série selon la fiche), tolérance de production de ±5 % sur les quantités, délai confirmé sur le devis.
- **Diffusion** : chaque fiche produit a un lien copiable, fait pour être partagé entre membres d'un bureau ou d'un service. Le canal principal de diffusion du catalogue (lien envoyé après un contact, recherche Google, QR code sur un support imprimé, salon) reste à préciser.

## Capabilities and Constraints

- Site statique hébergé sur Netlify (`site/`), demandes de devis par Netlify Forms (formulaire « devis ») avec un lien email prérempli de secours vers antoine.contino@groupecontino.com.
- Le catalogue s'affiche par JavaScript à partir des données `DATA` de `site/index.html` ; sans JavaScript, un message renvoie vers l'email.
- **Origine** : la mention exacte pour ces produits est « Fabriqué en Europe ». Aucune page du catalogue ne revendique « fabriqué en France » ou « Made in France » pour ces références, même si l'atelier IFS fabrique en France pour ses autres activités.
- 10 produits sur 34 n'ont pas encore de visuel et affichent « Visuel à venir ». Le fanion de club et le coussin de stade en font partie depuis le retrait de leurs photos trompeuses, le 27/09/2026. Le tapis de yoga a reçu le 29/09/2026 la photo d'une vraie pièce, tirée du catalogue Word du Drive.
- Retirés du catalogue le 27/09/2026 : poncho adulte, sac t-shirt, sac banane, serviette microfibre, cordon tour de cou, brassard de capitaine, maintien-chaussettes, mini beachflag de table.
- **Studio de personnalisation** (`site/personnaliser.html`) : page à part, ouverte depuis chaque fiche et depuis le devis. Le client place autant de logos et de textes qu'il veut (bibliothèque de 15 polices libres), sur la face et le dos, dans la couleur de produit de son choix. Pour les maillots, il peut partir d'un design prêt (les quatre motifs de la page d'accueil) et en changer les couleurs. L'aperçu face et dos, la description du placement et les fichiers des logos partent avec la demande de devis. Règle : chaque aperçu porte la mention « Aperçu indicatif », le rendu définitif est celui du BAT officiel. Les fichiers restent dans le navigateur du client jusqu'à l'envoi.
- Vocabulaire du métier : BAT, HT, palier, pièces (pcs), sublimation intégrale, recto verso, marquage DTF, flocage, frais de lancement.
- À décider : ajout d'un contact visible (téléphone, adresse de l'atelier) hors formulaire.

## Brand Commitments

- Nom : **Contino Sport**, marque du Groupe Contino, en ligne sur continosport.fr depuis le 05/10/2026. Le favicon est le monogramme « C SPORT », l'en-tête montre le logo Contino Sport avec « Sublimation textile ».
- IFS (Industrie Française de Sellerie), l'entité du groupe qui chiffre et coordonne, n'apparaît plus sur le site, sauf dans la mention de pied de page voulue par Antoine : « Contino Sport, marque du Groupe Contino IFS ».
- L'Usinier Français (jeans et vêtements de travail) est une marque sœur, hors de ce catalogue.
- Voix : français, vouvoiement, phrases courtes et factuelles, promesse concrète (« Vous l'imaginez. Nous l'imprimons. »).
- Le catalogue a quitté le bleu et le vert, jugés génériques dans le secteur ; Antoine a choisi la palette magenta encre le 27/09/2026 (détail dans le code).

## Evidence on Hand

- **Prix et caractéristiques** : réels, dans `DATA` (`site/index.html`).
- **Photos actuelles** : illustrations de banque d'images, signalées comme non contractuelles dans le pied de page.
- **Photos de réalisations** : le set football montre une vraie pièce, face et dos, avec les sponsors du club (Vittel, Casino Contrexéville, Ville de Contrexéville, Handball Contrex). Le club et ses sponsors ont donné leur accord à Antoine le 05/10/2026. Les maillots de basket viennent aussi de vraies pièces. Ces trois produits n'affichent pas la mention « Photo d'illustration » (`"reel": true`). Le tapis de yoga montre une vraie pièce du partenaire : il garde la mention. Les autres photos de réalisations arriveront avec les images retouchées par IA.
- **Absent, à ne pas fabriquer** : références clients citées ou logos de clients sans leur accord, avis et témoignages, photos de l'atelier, chiffres de volume ou de délai présentés comme des résultats.

## Product Principles

1. **Le prix se montre** : chaque fiche donne la grille complète par palier, HT, avec le minimum et le transport.
2. **L'origine annoncée est l'origine réelle** : « Fabriqué en Europe » pour ce catalogue, la France seulement pour ce que l'atelier fait lui-même.
3. **Un chemin court vers le devis** : le club comme l'entreprise passe du produit au devis en deux étapes, depuis n'importe quelle page et sur téléphone.
4. **Rien d'inventé** : une photo d'illustration est signalée comme telle, et aucune preuve (avis ou référence client) n'est publiée sans source réelle.

## Accessibility & Inclusion

Barre fixée lors de l'audit du 27/09/2026 : WCAG 2.2 AA, dans le thème clair comme dans le thème sombre, formulaire de devis compris (clavier, lecteur d'écran, erreurs reliées aux champs, cibles tactiles de 44 px au moins).
