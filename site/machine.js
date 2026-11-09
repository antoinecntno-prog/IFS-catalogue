/* Machines à états du site, partagées par le catalogue, le studio et le bandeau cookies.
   Un parcours à plusieurs étapes déclare ses états et, pour chacun, les événements qu'il accepte :
     const m = IFSMachine("devis", { initial: "projet", noeud, etats: { projet: { CONTINUER: "coordonnees" }, coordonnees: {} }, rendu });
   m.signaler("CONTINUER") change d'état et renvoie true. Un événement que l'état en cours n'attend pas
   est refusé : signaler renvoie false et rien ne change.
   rendu(etat, precedent, detail) met la page à jour après chaque changement ; il n'est pas appelé à la création.
   L'état en cours se lit dans le code (m.etat, m.est("projet")) et dans la page : l'attribut data-etat
   du nœud, ou data-<attribut> quand le nœud porte plusieurs machines.
   Dans la console : IFSMachine.etats() donne l'état de chaque machine de la page,
   IFSMachine.journal les 50 derniers événements, acceptés (vers) ou refusés (vers : null). */
window.IFSMachine = (() => {
  "use strict";
  const machines = {}, journal = [];
  function creer(nom, { initial, etats, noeud = null, attribut = "etat", rendu = null }) {
    /* Une faute de frappe dans la table arrête la page dès le chargement */
    if (!etats[initial]) throw new Error(`Machine ${nom} : état initial inconnu « ${initial} »`);
    for (const [e, sorties] of Object.entries(etats)) for (const [ev, vers] of Object.entries(sorties)) {
      if (!etats[vers]) throw new Error(`Machine ${nom} : ${e} + ${ev} mène à un état inconnu « ${vers} »`);
    }
    let etat = initial;
    const refleter = () => { if (noeud) noeud.dataset[attribut] = etat; };
    const m = {
      nom,
      get etat() { return etat; },
      est: (...noms) => noms.includes(etat),
      peut: evenement => !!etats[etat][evenement],
      signaler(evenement, detail) {
        const de = etat, vers = etats[de][evenement] || null;
        journal.push({ machine: nom, de, evenement, vers });
        if (journal.length > 50) journal.shift();
        if (!vers) return false;
        etat = vers;
        refleter();
        if (rendu) rendu(etat, de, detail);
        return true;
      }
    };
    refleter();
    machines[nom] = m;
    return m;
  }
  creer.etats = () => Object.fromEntries(Object.entries(machines).map(([n, m]) => [n, m.etat]));
  creer.journal = journal;
  return creer;
})();
