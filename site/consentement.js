/* Consentement et pixel Meta.
   Le pixel ne se charge qu'après un clic sur « Accepter » (règle CNIL : refuser aussi simple qu'accepter,
   aucun traceur publicitaire avant le choix). Le choix est gardé 6 mois dans le navigateur.
   Les pages envoient leurs événements par csTrack(nom, données) : sans accord, l'appel ne fait rien.
   Le choix est une machine à états (machine.js), lisible sur <html data-consentement> :
   indecis tant que le bandeau attend une réponse, puis refuse ou accepte (pixel chargé). */
(() => {
  const PIXEL = "1636636314482269";
  const CLE = "cs-consentement";
  const DUREE = 182 * 24 * 3600 * 1000;

  const lire = () => {
    try {
      const c = JSON.parse(localStorage.getItem(CLE) || "null");
      return c && Date.now() - c.t < DUREE ? c.v : null;
    } catch { return null; }
  };
  const ecrire = v => { try { localStorage.setItem(CLE, JSON.stringify({ v, t: Date.now() })); } catch {} };

  /* L'état en mémoire fait foi pendant la visite, même si le navigateur refuse d'écrire le choix.
     Dans le stockage, le choix garde ses valeurs d'origine : « oui » et « non ». */
  const choix = IFSMachine("consentement", {
    initial: { oui: "accepte", non: "refuse" }[lire()] || "indecis",
    noeud: document.documentElement,
    attribut: "consentement",
    etats: {
      indecis: { ACCEPTER: "accepte", REFUSER: "refuse" },
      refuse: { ACCEPTER: "accepte", REFUSER: "refuse" },
      accepte: { ACCEPTER: "accepte", REFUSER: "refuse" }
    },
    rendu(etat, precedent, autreOnglet) {
      if (!autreOnglet) ecrire(etat === "accepte" ? "oui" : "non");
      if (etat === "accepte") chargerPixel();
      /* Retrait d'un accord donné plus tôt : on recharge la page pour décharger le pixel.
         Retrait fait dans un autre onglet : csTrack se tait, la page reste en place avec ses saisies. */
      else if (precedent === "accepte" && !autreOnglet) location.reload();
    }
  });
  /* Choix fait dans un autre onglet : celui-ci le suit */
  window.addEventListener("storage", e => {
    if (e.key !== CLE) return;
    const etat = { oui: "accepte", non: "refuse" }[lire()];
    if (!etat || choix.est(etat)) return;
    document.querySelector(".cs-bandeau")?.remove();
    choix.signaler(etat === "accepte" ? "ACCEPTER" : "REFUSER", true);
  });

  let charge = false;
  function chargerPixel() {
    if (charge) return;
    charge = true;
    /* Code de base fourni par Meta */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", PIXEL);
    fbq("track", "PageView");
  }

  /* chargerPixel d'abord : un événement envoyé avant la fin du chargement de la page
     (fiche ouverte par un lien direct) attend dans la file du pixel, après PageView. */
  window.csTrack = (nom, donnees) => {
    if (!choix.est("accepte")) return;
    chargerPixel();
    fbq("track", nom, donnees || {});
  };

  const style = document.createElement("style");
  style.textContent = `
.cs-bandeau{position:fixed;left:16px;right:16px;bottom:16px;z-index:60;max-width:560px;margin-inline:auto;padding:20px;background:var(--bg);color:var(--text);border:1px solid var(--line-strong);border-radius:var(--r);box-shadow:var(--shadow-dialog);font:400 15px/1.5 var(--f-body)}
.cs-bandeau h2{margin:0 0 6px;font:700 17px/1.3 var(--f-head)}
.cs-bandeau p{margin:0 0 16px;color:var(--text-2)}
.cs-bandeau p a{color:var(--accent-text);font-weight:700;text-underline-offset:3px}
.cs-actions{display:flex;gap:12px;flex-wrap:wrap}
.cs-actions button{flex:1 1 140px;min-height:44px;padding:0 18px;border:2px solid var(--text);border-radius:var(--r);background:var(--bg);color:var(--text);font:700 15px/1 var(--f-body);cursor:pointer}
.cs-actions button:hover{background:var(--text);color:var(--bg)}
.cs-actions button:focus-visible{outline:3px solid var(--focus);outline-offset:2px}`;
  document.head.appendChild(style);

  function bandeau() {
    if (document.querySelector(".cs-bandeau")) return;
    const d = document.createElement("section");
    d.className = "cs-bandeau";
    d.setAttribute("role", "region");
    d.setAttribute("aria-labelledby", "cs-titre");
    d.innerHTML = `<h2 id="cs-titre">Cookies publicitaires</h2>
<p>Avec votre accord, nous utilisons le pixel Meta pour mesurer l'efficacité de nos publicités Facebook et Instagram et vous en montrer de plus pertinentes. Le catalogue fonctionne pareil si vous refusez. Vous pouvez changer d'avis depuis le lien « Cookies » en bas de page. <a href="confidentialite.html#cookies">En savoir plus</a></p>
<div class="cs-actions"><button type="button" data-cs="non">Refuser</button><button type="button" data-cs="oui">Accepter</button></div>`;
    d.addEventListener("click", e => {
      const b = e.target.closest("[data-cs]");
      if (!b) return;
      d.remove();
      choix.signaler(b.dataset.cs === "oui" ? "ACCEPTER" : "REFUSER");
    });
    document.body.appendChild(d);
  }

  function demarrer() {
    const lien = document.getElementById("cs-ouvrir");
    if (lien) { lien.hidden = false; lien.addEventListener("click", bandeau); }
    if (choix.est("accepte")) chargerPixel();
    else if (choix.est("indecis")) bandeau();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer);
  else demarrer();
})();
