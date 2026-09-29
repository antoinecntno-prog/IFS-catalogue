/* Source unique des temps du showreel : la page (index.html) cale ses scènes dessus,
   son.mjs y lit les repères de l'habillage sonore. Temps en secondes, 120 BPM (temps de 0,5 s). */
export const DUREE = 20;
export const BPM = 120;

export const SCENES = {
  encre: 0,        // goutte magenta, « VOUS L'IMAGINEZ. »
  impression: 2,   // maillot imprimé, « NOUS L'IMPRIMONS. », quatre motifs
  catalogue: 4.5,  // grille des produits, 34 références, recherche
  paliers: 7,      // fiche produit, prix par palier
  studio: 10,      // logo, polices, couleurs, face et dos
  devis: 14.5,     // devis en deux étapes, BAT, les 4 étapes
  fin: 17.5        // carton de fin
};

/* Changements de motif du maillot (scène impression) : demi-temps qui accélèrent */
export const MOTIFS_T = [3.25, 3.625, 3.875, 4.125];

/* Repères sonores : t, type, et intensité ou panoramique quand ils servent */
export const SONS = [
  { t: 0.05, type: "chute" },
  { t: 0.45, type: "impact", g: 1 },
  { t: 0.5, type: "souffle", d: 0.6, pan: 0 },
  { t: 1.55, type: "montee", d: 0.45 },
  { t: 2.0, type: "impact", g: 0.8 },
  { t: 2.0, type: "souffle", d: 0.6, pan: 0.4 },
  { t: 2.5, type: "chaleur", d: 0.5 },
  ...MOTIFS_T.map((t, i) => ({ t, type: "bascule", g: 0.7 + i * 0.1 })),
  { t: 4.3, type: "souffle", d: 0.55, pan: -0.5 },
  ...Array.from({ length: 12 }, (_, i) => ({ t: 4.62 + i * 0.07, type: "clic", g: 0.35, pan: -0.6 + i * 0.1 })),
  ...Array.from({ length: 9 }, (_, i) => ({ t: 5.0 + i * 0.1, type: "tic", g: 0.5 })),
  ...Array.from({ length: 7 }, (_, i) => ({ t: 5.95 + i * 0.065, type: "frappe", g: 0.5 })),
  { t: 6.45, type: "souffle", d: 0.3, pan: 0.3 },
  { t: 6.7, type: "montee", d: 0.3 },
  { t: 7.0, type: "impact", g: 0.7 },
  ...[7.9, 8.25, 8.6, 8.95, 9.3].map(t => ({ t, type: "palier", g: 0.8 })),
  { t: 9.85, type: "clic", g: 1, pan: 0.3 },
  { t: 10.0, type: "souffle", d: 0.5, pan: 0 },
  { t: 11.05, type: "pose", g: 1 },
  ...Array.from({ length: 15 }, (_, i) => ({ t: 11.7 + i * 0.075, type: "tic", g: 0.35 })),
  { t: 12.55, type: "clic", g: 0.6, pan: 0.5 },
  { t: 12.8, type: "clic", g: 0.6, pan: 0.6 },
  { t: 13.0, type: "souffle", d: 0.5, pan: -0.4 },
  { t: 13.45, type: "pose", g: 0.9 },
  { t: 14.2, type: "clic", g: 1, pan: 0.4 },
  { t: 14.5, type: "souffle", d: 0.45, pan: -0.3 },
  { t: 15.15, type: "clic", g: 0.7, pan: 0.2 },
  ...Array.from({ length: 8 }, (_, i) => ({ t: 15.3 + i * 0.05, type: "frappe", g: 0.35 })),
  { t: 15.75, type: "clic", g: 0.9, pan: 0.2 },
  { t: 15.85, type: "valide" },
  { t: 16.1, type: "souffle", d: 0.9, pan: 0 },
  ...[16.25, 16.55, 16.85, 17.15].map(t => ({ t, type: "palier", g: 0.6 })),
  { t: 16.85, type: "tampon" },
  { t: 17.22, type: "montee", d: 0.42 },
  { t: 17.64, type: "final" },
  { t: 18.0, type: "brillance" }
];
