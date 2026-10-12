#!/usr/bin/env python3
"""Génère les pages légales du site : mentions légales, confidentialité et CGV.

L'identité de la société tient dans IDENTITE, plus bas. Une valeur encore inconnue reste à None :
la page affiche alors un repère jaune « à compléter », et le test de fin de script la signale.

    python3 outils/pages-legales.py

Écrit site/mentions-legales.html, site/confidentialite.html et site/cgv.html.
"""
from html import escape
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent / "site"
MAJ = "12 octobre 2026"

IDENTITE = {
    "raison_sociale": None,        # dénomination exacte au registre, par exemple « I.F.S »
    "forme": None,                 # SAS, SARL…
    "capital": None,               # en euros
    "siege": None,                 # adresse complète du siège social
    "rcs": None,                   # « RCS Épinal 123 456 789 »
    "tva": None,                   # numéro de TVA intracommunautaire
    "directeur": None,             # directeur de la publication : représentant légal
    "telephone": None,
    "email": "antoine.contino@groupecontino.com",
    "tribunal": "Épinal",          # tribunal de commerce du siège social
}
CGV = {
    "validite_devis": None,        # durée de validité d'un devis, par exemple « 30 jours »
    "acompte": None,               # acompte à la commande, par exemple « 30 % du montant TTC »
    "paiement": None,              # échéance du solde, par exemple « 30 jours à compter de la date de facture »
    "moyens": None,                # moyens de paiement acceptés, par exemple « virement »
}


def v(cle, src=IDENTITE):
    val = src[cle]
    return escape(val) if val else f'<mark class="todo">[{escape(cle.replace("_", " "))} à compléter]</mark>'


def page(fichier, titre, description, corps):
    liens = [("mentions-legales.html", "Mentions légales"), ("confidentialite.html", "Confidentialité"), ("cgv.html", "CGV")]
    courant = ' aria-current="page"'
    pied = " ".join(f'<a href="{h}"{courant if h == fichier else ""}>{t}</a>' for h, t in liens)
    html = f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{titre} | Contino Sport</title>
<meta name="description" content="{description}">
<link rel="canonical" href="https://continosport.fr/{fichier}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#FFFFFF" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#141016" media="(prefers-color-scheme: dark)">
<link rel="icon" href="c-sport-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="c-sport-192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="c-sport-180.png">
<link rel="stylesheet" href="base.css">
<link rel="stylesheet" href="legal.css">
</head>
<body>
<header class="lg-top">
  <div class="wrap">
    <a href="./" aria-label="Contino Sport, retour au catalogue"><picture><source srcset="logo-contino-sport-blanc.webp" media="(prefers-color-scheme: dark)"><img src="logo-contino-sport.webp" width="104" height="44" alt=""></picture></a>
    <a class="lg-back" href="./">Retour au catalogue</a>
  </div>
</header>
<main class="lg-main" id="contenu">
<h1>{titre}</h1>
<p class="lg-maj">Mise à jour le {MAJ}</p>
{corps}
</main>
<footer class="lg-foot">
  <div class="wrap"><span><b>Contino Sport</b>, marque du Groupe Contino IFS</span> {pied} <button type="button" id="cs-ouvrir" hidden>Cookies</button></div>
</footer>
<script src="consentement.js"></script>
</body>
</html>
"""
    (SITE / fichier).write_text(html, encoding="utf-8")
    return html


MENTIONS = f"""
<h2>Éditeur du site</h2>
<p>Le site continosport.fr présente le catalogue de la marque Contino Sport, exploitée par la société suivante.</p>
<ul>
  <li>Dénomination : {v("raison_sociale")}</li>
  <li>Forme juridique : {v("forme")}, au capital de {v("capital")} euros</li>
  <li>Siège social : {v("siege")}</li>
  <li>Immatriculation : {v("rcs")}</li>
  <li>TVA intracommunautaire : {v("tva")}</li>
  <li>Téléphone : {v("telephone")}</li>
  <li>Email : <a href="mailto:{IDENTITE["email"]}">{IDENTITE["email"]}</a></li>
</ul>
<p>Directeur de la publication : {v("directeur")}.</p>

<h2>Hébergement</h2>
<p>Le site est hébergé par Netlify, Inc., 101 2nd Street, San Francisco, CA 94105, États-Unis. Contact : <a href="https://www.netlify.com/support/">netlify.com/support</a>.</p>

<h2>Propriété intellectuelle</h2>
<p>Les textes, photos, visuels, logos et la marque Contino Sport présents sur ce site appartiennent à l'éditeur ou sont utilisés avec l'accord de leurs titulaires. Toute reproduction sans autorisation écrite est interdite. Les logos de clubs et de sponsors visibles sur les photos de réalisations restent la propriété de leurs titulaires.</p>
<p>Les polices de caractères du site et du studio de personnalisation sont distribuées sous licence libre (SIL Open Font License, Apache 2.0).</p>

<h2>Photos et visuels</h2>
<p>Les photos et visuels de produits sont non contractuels. Le rendu final d'une commande est celui du bon à tirer (BAT) validé par le client.</p>

<h2>Données personnelles et cookies</h2>
<p>Le traitement des données transmises par le formulaire de devis et l'usage des cookies sont décrits dans la <a href="confidentialite.html">politique de confidentialité</a>.</p>

<h2>Signaler un contenu</h2>
<p>Pour signaler un contenu illicite ou une erreur, écrivez à <a href="mailto:{IDENTITE["email"]}">{IDENTITE["email"]}</a> en précisant la page concernée.</p>
"""

CONFIDENTIALITE = f"""
<nav class="lg-sommaire" aria-label="Sommaire">
<ul>
  <li><a href="#responsable">Responsable du traitement</a></li>
  <li><a href="#donnees">Données collectées et usages</a></li>
  <li><a href="#destinataires">Destinataires</a></li>
  <li><a href="#transferts">Transferts hors de l'Union européenne</a></li>
  <li><a href="#durees">Durées de conservation</a></li>
  <li><a href="#cookies">Cookies et stockage dans le navigateur</a></li>
  <li><a href="#securite">Sécurité</a></li>
  <li><a href="#droits">Vos droits</a></li>
</ul>
</nav>

<h2 id="responsable">Responsable du traitement</h2>
<p>Les données personnelles collectées sur continosport.fr sont traitées par {v("raison_sociale")}, {v("siege")}, qui exploite la marque Contino Sport. Pour toute question sur vos données : <a href="mailto:{IDENTITE["email"]}">{IDENTITE["email"]}</a>.</p>

<h2 id="donnees">Données collectées et usages</h2>
<h3>Demande de devis</h3>
<p>Le formulaire de devis recueille votre profil (club, entreprise, association, école), vos nom, prénom, structure, email, téléphone et code postal, le produit et la quantité souhaités, la date de livraison souhaitée, votre message, et le cas échéant vos fichiers de logo, l'aperçu et la description du placement créés dans le studio.</p>
<p>Ces données servent à établir votre devis, à vous recontacter à son sujet, puis à exécuter et facturer la commande si vous la passez. Base légale : les mesures précontractuelles prises à votre demande et l'exécution du contrat (article 6.1.b du RGPD), puis nos obligations comptables pour les factures (article 6.1.c).</p>
<p>Nous pouvons ensuite vous adresser par email des informations sur des produits comparables à ceux demandés, sur la base de notre intérêt légitime à suivre nos clients et prospects professionnels (article 6.1.f). Chaque message permet de s'y opposer en un clic.</p>
<h3>Mesure publicitaire</h3>
<p>Si vous l'acceptez dans le bandeau cookies, le pixel Meta mesure les visites, les fiches produit consultées et les demandes de devis envoyées, pour évaluer nos publicités Facebook et Instagram et les montrer à des personnes susceptibles d'être intéressées. Base légale : votre consentement (article 6.1.a), que vous pouvez retirer à tout moment.</p>
<h3>Fonctionnement et sécurité du site</h3>
<p>Notre hébergeur enregistre des données techniques de connexion (adresse IP, navigateur, pages demandées, date et heure) pour faire fonctionner le site et le protéger des abus. Base légale : notre intérêt légitime à assurer la sécurité du service (article 6.1.f).</p>
<p>Aucune décision automatisée ni aucun profilage ayant un effet juridique ne sont réalisés à partir de vos données.</p>

<h2 id="destinataires">Destinataires</h2>
<p>Vos données sont lues par l'équipe commerciale de Contino Sport. Elles ne sont jamais vendues. Elles sont transmises, dans la stricte limite de leurs missions, aux prestataires suivants :</p>
<ul>
  <li><b>Netlify, Inc.</b> (États-Unis), qui héberge le site et reçoit les demandes du formulaire de devis, en qualité de sous-traitant.</li>
  <li><b>Notre partenaire de fabrication</b> en Europe, qui reçoit les éléments nécessaires à la production et à la livraison d'une commande (visuels, quantités, tailles, adresse de livraison).</li>
  <li><b>Le transporteur</b> chargé de la livraison, pour les nom, adresse et téléphone du destinataire.</li>
  <li><b>Meta Platforms Ireland Ltd</b>, Merrion Road, Dublin 4, Irlande, pour les données du pixel Meta, seulement après votre accord. Pour cette collecte, Meta et nous sommes responsables conjoints ; Meta traite ensuite ces données selon sa propre <a href="https://www.facebook.com/privacy/policy/">politique de confidentialité</a>.</li>
</ul>

<h2 id="transferts">Transferts hors de l'Union européenne</h2>
<p>Netlify et Meta peuvent traiter des données aux États-Unis. Ces transferts sont encadrés par le cadre de protection des données UE et États-Unis (Data Privacy Framework), auquel ces sociétés sont certifiées, et par les clauses contractuelles types de la Commission européenne.</p>

<h2 id="durees">Durées de conservation</h2>
<table class="lg-table">
  <thead><tr><th scope="col">Données</th><th scope="col">Durée</th></tr></thead>
  <tbody>
    <tr><td data-l="Données">Demande de devis restée sans suite</td><td data-l="Durée">3 ans après le dernier échange</td></tr>
    <tr><td data-l="Données">Données d'un client</td><td data-l="Durée">Durée de la relation commerciale, puis 3 ans après la dernière commande</td></tr>
    <tr><td data-l="Données">Factures et pièces comptables</td><td data-l="Durée">10 ans (article L123-22 du Code de commerce)</td></tr>
    <tr><td data-l="Données">Demandes stockées chez Netlify</td><td data-l="Durée">Supprimées de l'outil Netlify dans les 3 mois suivant leur réception, après report dans notre suivi commercial</td></tr>
    <tr><td data-l="Données">Choix exprimé dans le bandeau cookies</td><td data-l="Durée">6 mois, puis la question vous est reposée</td></tr>
    <tr><td data-l="Données">Cookies du pixel Meta</td><td data-l="Durée">13 mois au plus</td></tr>
  </tbody>
</table>

<h2 id="cookies">Cookies et stockage dans le navigateur</h2>
<p>Le site ne dépose aucun cookie publicitaire sans votre accord. À votre première visite, un bandeau vous propose d'accepter ou de refuser le pixel Meta, avec deux boutons de même importance. Le catalogue fonctionne de la même façon si vous refusez.</p>
<p>Vous pouvez changer d'avis à tout moment avec le bouton « Cookies » en bas de page. Si vous retirez votre accord, la page se recharge sans le pixel.</p>
<table class="lg-table">
  <thead><tr><th scope="col">Nom</th><th scope="col">Usage</th><th scope="col">Accord requis</th></tr></thead>
  <tbody>
    <tr><td data-l="Nom">cs-consentement</td><td data-l="Usage">Mémorise votre choix dans le bandeau cookies (stockage local)</td><td data-l="Accord requis">Non, nécessaire</td></tr>
    <tr><td data-l="Nom">ifs-devis-brouillon</td><td data-l="Usage">Garde le brouillon de votre demande de devis pendant la visite (stockage de session)</td><td data-l="Accord requis">Non, nécessaire</td></tr>
    <tr><td data-l="Nom">ifs-studio</td><td data-l="Usage">Garde vos logos et votre visuel du studio jusqu'à l'envoi du devis (base locale du navigateur)</td><td data-l="Accord requis">Non, nécessaire</td></tr>
    <tr><td data-l="Nom">_fbp, _fbc</td><td data-l="Usage">Cookies du pixel Meta : mesure des visites et des demandes de devis venues de nos publicités</td><td data-l="Accord requis">Oui</td></tr>
  </tbody>
</table>
<p>Les données du stockage local et de la base locale restent sur votre appareil : elles ne nous parviennent qu'au moment où vous envoyez une demande de devis. Vous pouvez les effacer depuis les réglages de votre navigateur.</p>

<h2 id="securite">Sécurité</h2>
<p>Le site est servi exclusivement en HTTPS. Il applique des en-têtes de sécurité qui limitent les scripts autorisés, empêchent son affichage dans un site tiers et désactivent l'accès à la caméra, au micro et à la position. L'accès aux demandes reçues est réservé à l'équipe commerciale, avec des comptes protégés.</p>

<h2 id="droits">Vos droits</h2>
<p>Vous disposez d'un droit d'accès, de rectification et d'effacement de vos données, d'un droit à la limitation et à la portabilité, d'un droit d'opposition, notamment à la prospection, du droit de retirer votre consentement à tout moment, et du droit de définir des directives sur le sort de vos données après votre décès.</p>
<p>Pour les exercer, écrivez à <a href="mailto:{IDENTITE["email"]}">{IDENTITE["email"]}</a>. Nous répondons dans un délai d'un mois. Si la réponse ne vous satisfait pas, vous pouvez adresser une réclamation à la CNIL, 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, ou sur <a href="https://www.cnil.fr/fr/plaintes">cnil.fr</a>.</p>
"""

CGV_TXT = f"""
<nav class="lg-sommaire" aria-label="Sommaire">
<ul>
  <li><a href="#a1">1. Champ d'application</a></li>
  <li><a href="#a2">2. Devis et commande</a></li>
  <li><a href="#a3">3. Bon à tirer</a></li>
  <li><a href="#a4">4. Fichiers, logos et droits</a></li>
  <li><a href="#a5">5. Prix</a></li>
  <li><a href="#a6">6. Quantités et tolérance</a></li>
  <li><a href="#a7">7. Délais et livraison</a></li>
  <li><a href="#a8">8. Réception et réclamations</a></li>
  <li><a href="#a9">9. Paiement</a></li>
  <li><a href="#a10">10. Réserve de propriété</a></li>
  <li><a href="#a11">11. Garanties et responsabilité</a></li>
  <li><a href="#a12">12. Droit de rétractation</a></li>
  <li><a href="#a13">13. Données personnelles</a></li>
  <li><a href="#a14">14. Droit applicable et litiges</a></li>
</ul>
</nav>

<h2 id="a1">1. Champ d'application</h2>
<p>Les présentes conditions générales de vente s'appliquent aux commandes de textiles et d'accessoires personnalisés passées auprès de {v("raison_sociale")}, sous la marque Contino Sport, par des clubs sportifs, entreprises, associations, collectivités et établissements d'enseignement. Le site ne vend pas aux consommateurs agissant à titre personnel.</p>
<p>Toute commande vaut acceptation des présentes conditions, qui prévalent sur les conditions d'achat du client sauf accord écrit contraire.</p>

<h2 id="a2">2. Devis et commande</h2>
<p>Le formulaire du site sert à demander un devis et n'engage pas le client. Le devis, gratuit, précise les produits, quantités, tailles, techniques de marquage, prix et délai. Il est valable {v("validite_devis", CGV)} à compter de son envoi.</p>
<p>La commande devient ferme à la réception du devis signé, ou accepté par écrit, accompagné de l'acompte prévu à l'article 9. Une commande ferme ne peut plus être annulée une fois le bon à tirer validé et la production lancée.</p>

<h2 id="a3">3. Bon à tirer</h2>
<p>Avant toute production, le client reçoit un bon à tirer (BAT) numérique qui montre les couleurs, les textes, les logos et leur placement. La production démarre seulement après sa validation écrite. Le client vérifie notamment l'orthographe, les noms, les numéros et la liste des tailles : les erreurs présentes sur un BAT validé ne peuvent pas faire l'objet d'une réclamation.</p>
<p>Les aperçus du studio de personnalisation et les visuels du site sont indicatifs. Le rendu des couleurs varie selon les écrans et selon la matière imprimée ; de légers écarts de teinte entre le BAT et la pièce sublimée sont inhérents au procédé.</p>

<h2 id="a4">4. Fichiers, logos et droits</h2>
<p>Le client fournit des fichiers exploitables et garantit qu'il détient les droits sur les logos, marques, noms, images et textes qu'il demande d'imprimer, y compris ceux de ses sponsors. Il garantit {v("raison_sociale")} contre toute réclamation d'un tiers à ce sujet.</p>
<p>Les créations graphiques réalisées par Contino Sport pour un devis restent sa propriété tant que la commande correspondante n'est pas payée. Contino Sport peut présenter les pièces réalisées dans ses supports de communication, sauf refus écrit du client.</p>

<h2 id="a5">5. Prix</h2>
<p>Les prix du catalogue et des devis sont exprimés en euros hors taxes ; la TVA s'ajoute au taux en vigueur. Le prix unitaire dépend du palier de quantité atteint par modèle. En dessous du minimum indiqué sur chaque fiche, des frais de lancement de 50 euros HT s'appliquent, ou un devis de petite série est établi. Le transport est inclus sauf mention contraire sur la fiche produit ou le devis.</p>

<h2 id="a6">6. Quantités et tolérance</h2>
<p>La production textile admet une tolérance de plus ou moins 5 % sur les quantités commandées. La facture correspond à la quantité réellement livrée.</p>

<h2 id="a7">7. Délais et livraison</h2>
<p>Le délai de production court à partir de la validation du BAT et de la réception de l'acompte. Il est confirmé sur le devis. Un délai non respecté ne peut entraîner l'annulation de la commande ou une indemnité qu'en cas de retard supérieur à 30 jours, après mise en demeure restée sans effet, et hors cas de force majeure.</p>
<p>Les risques passent au client à la remise des produits au transporteur, ou à leur retrait à l'atelier.</p>

<h2 id="a8">8. Réception et réclamations</h2>
<p>À la livraison, le client vérifie l'état et le nombre des colis et porte ses réserves précises sur le bon du transporteur, puis les confirme au transporteur par lettre recommandée dans les 3 jours (article L133-3 du Code de commerce).</p>
<p>Toute réclamation sur la conformité des produits au BAT validé est adressée par écrit, photos à l'appui, dans les 8 jours suivant la livraison. Après vérification, les pièces reconnues non conformes sont refaites ou remboursées, à l'exclusion de toute autre indemnité.</p>

<h2 id="a9">9. Paiement</h2>
<p>Un acompte de {v("acompte", CGV)} est dû à la commande. Le solde est payable {v("paiement", CGV)}, par {v("moyens", CGV)}. Aucun escompte n'est accordé pour paiement anticipé.</p>
<p>Pour les clients professionnels, tout retard de paiement entraîne de plein droit des pénalités égales au taux de refinancement de la Banque centrale européenne majoré de 10 points, ainsi qu'une indemnité forfaitaire de 40 euros pour frais de recouvrement (articles L441-10 et D441-5 du Code de commerce). Une indemnité complémentaire peut être demandée si les frais réels sont supérieurs.</p>

<h2 id="a10">10. Réserve de propriété</h2>
<p>Les produits restent la propriété de {v("raison_sociale")} jusqu'au paiement complet du prix. Le client en supporte toutefois les risques dès la livraison.</p>

<h2 id="a11">11. Garanties et responsabilité</h2>
<p>Les produits bénéficient de la garantie légale des vices cachés (articles 1641 et suivants du Code civil). La garantie ne couvre pas l'usure normale, ni les dommages dus à un entretien contraire aux consignes de lavage fournies.</p>
<p>La responsabilité de {v("raison_sociale")} est limitée au montant de la commande concernée. Elle ne peut être engagée en cas de force majeure au sens de l'article 1218 du Code civil.</p>

<h2 id="a12">12. Droit de rétractation</h2>
<p>Les commandes sont passées par des clients agissant pour leur structure. Elles portent sur des produits fabriqués selon les spécifications du client et nettement personnalisés : le droit de rétractation prévu pour les consommateurs ne s'applique pas (article L221-28, 3° du Code de la consommation).</p>

<h2 id="a13">13. Données personnelles</h2>
<p>Les données transmises pour un devis ou une commande sont traitées selon la <a href="confidentialite.html">politique de confidentialité</a>.</p>

<h2 id="a14">14. Droit applicable et litiges</h2>
<p>Les présentes conditions sont soumises au droit français. En cas de différend, les parties recherchent d'abord une solution amiable. Entre commerçants, tout litige relève de la compétence exclusive du tribunal de commerce d'{v("tribunal")}. Pour les autres clients, les règles de compétence de droit commun s'appliquent.</p>
"""

page("mentions-legales.html", "Mentions légales", "Mentions légales du site continosport.fr : éditeur, hébergeur, propriété intellectuelle.", MENTIONS)
page("confidentialite.html", "Politique de confidentialité", "Comment Contino Sport traite les données du formulaire de devis, les cookies et vos droits RGPD.", CONFIDENTIALITE)
page("cgv.html", "Conditions générales de vente", "Conditions générales de vente Contino Sport : devis, bon à tirer, prix, livraison, paiement.", CGV_TXT)

manque = [k for d in (IDENTITE, CGV) for k, val in d.items() if not val]
print("pages écrites :", ", ".join(["mentions-legales.html", "confidentialite.html", "cgv.html"]))
if manque:
    print("À COMPLÉTER avant publication :", ", ".join(manque))
