/* Consentement et pixel Meta.
   Le pixel ne se charge qu'après un clic sur « Accepter » (règle CNIL : refuser aussi simple qu'accepter,
   aucun traceur publicitaire avant le choix). Le choix est gardé 6 mois dans le navigateur.
   Les pages envoient leurs événements par csTrack(nom, données) : sans accord, l'appel ne fait rien. */
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

  let charge = false;
  function chargerPixel() {
    if (charge) return;
    charge = true;
    /* Code de base fourni par Meta */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", PIXEL);
    fbq("track", "PageView");
  }

  window.csTrack = (nom, donnees) => {
    if (lire() === "oui" && window.fbq) fbq("track", nom, donnees || {});
  };

  const style = document.createElement("style");
  style.textContent = `
.cs-bandeau{position:fixed;left:16px;right:16px;bottom:16px;z-index:60;max-width:560px;margin-inline:auto;padding:20px;background:var(--bg);color:var(--text);border:1px solid var(--line-strong);border-radius:var(--r);box-shadow:var(--shadow-dialog);font:400 15px/1.5 var(--f-body)}
.cs-bandeau h2{margin:0 0 6px;font:700 17px/1.3 var(--f-head)}
.cs-bandeau p{margin:0 0 16px;color:var(--text-2)}
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
<p>Avec votre accord, nous utilisons le pixel Meta pour mesurer l'efficacité de nos publicités Facebook et Instagram et vous en montrer de plus pertinentes. Le catalogue fonctionne pareil si vous refusez. Vous pouvez changer d'avis depuis le lien « Cookies » en bas de page.</p>
<div class="cs-actions"><button type="button" data-cs="non">Refuser</button><button type="button" data-cs="oui">Accepter</button></div>`;
    d.addEventListener("click", e => {
      const b = e.target.closest("[data-cs]");
      if (!b) return;
      const avant = lire();
      ecrire(b.dataset.cs);
      d.remove();
      if (b.dataset.cs === "oui") chargerPixel();
      /* Retrait d'un accord donné plus tôt : on recharge la page pour décharger le pixel */
      else if (avant === "oui" && charge) location.reload();
    });
    document.body.appendChild(d);
  }

  function demarrer() {
    const lien = document.getElementById("cs-ouvrir");
    if (lien) { lien.hidden = false; lien.addEventListener("click", bandeau); }
    const choix = lire();
    if (choix === "oui") chargerPixel();
    else if (choix === null) bandeau();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer);
  else demarrer();
})();
