/* Studio de personnalisation : le produit dessiné, face et dos, avec autant de logos et de textes que voulu.
   Aperçu indicatif : les couleurs et le placement définitifs sont validés sur le BAT officiel.
   Les fichiers du client restent dans son navigateur jusqu'à l'envoi de la demande de devis. */
(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Outils ---------- */
  const tok = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const hexRgb = h => { h = h.replace("#", ""); if (h.length === 3) h = [...h].map(c => c + c).join(""); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const rgbHex = a => "#" + a.map(v => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("").toUpperCase();
  const mix = (a, b, t) => { const A = hexRgb(a), B = hexRgb(b); return rgbHex(A.map((v, i) => v + (B[i] - v) * t)); };
  const lum = h => { const [r, g, b] = hexRgb(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
  /* Coutures et bords-côtes : plus sombres que le tissu, plus clairs sur un tissu très sombre */
  const trimOf = c => lum(c) < .05 ? mix(c, "#FFFFFF", .3) : mix(c, "#000000", .28);
  const inkOf = c => lum(c) < .05 ? mix(c, "#FFFFFF", .18) : mix(c, "#000000", .42);
  const contrastOn = c => lum(c) > .4 ? tok("--kit-black").toUpperCase() : tok("--kit-white").toUpperCase();
  let seq = 0;
  const newId = () => `e${Date.now().toString(36)}${(seq++).toString(36)}`;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- Couleurs et polices proposées ---------- */
  const SWATCHES = [["Blanc", "--kit-white"], ["Noir", "--kit-black"], ["Rouge", "--kit-red"], ["Bleu marine", "--kit-navy"], ["Bleu roi", "--kit-royal"], ["Vert", "--kit-green"], ["Jaune", "--kit-yellow"], ["Magenta", "--magenta"], ["Or", "--kit-gold"], ["Turquoise", "--kit-turquoise"]];
  const swatches = () => SWATCHES.map(([name, t]) => ({ name, hex: tok(t).toUpperCase() }));
  const colorName = hex => { const hit = swatches().find(s => s.hex === hex.toUpperCase()); return hit ? hit.name.toLowerCase() : hex.toUpperCase(); };
  /* Polices libres (SIL OFL, Apache pour Permanent Marker) hébergées dans fonts/ */
  const FONTS = [
    { id: "teko", label: "Teko", family: "Teko", weight: 600 },
    { id: "bebas", label: "Bebas Neue", family: "Bebas Neue", weight: 400 },
    { id: "anton", label: "Anton", family: "Anton", weight: 400 },
    { id: "oswald", label: "Oswald", family: "Oswald", weight: 700 },
    { id: "archivo", label: "Archivo", family: "Archivo", weight: 900 },
    { id: "russo", label: "Russo One", family: "Russo One", weight: 400 },
    { id: "graduate", label: "Graduate", family: "Graduate", weight: 400 },
    { id: "blackops", label: "Black Ops One", family: "Black Ops One", weight: 400 },
    { id: "bungee", label: "Bungee", family: "Bungee", weight: 400 },
    { id: "staatliches", label: "Staatliches", family: "Staatliches", weight: 400 },
    { id: "alfa", label: "Alfa Slab One", family: "Alfa Slab One", weight: 400 },
    { id: "hanken", label: "Hanken Grotesk", family: "Hanken Grotesk", weight: 700 },
    { id: "marker", label: "Permanent Marker", family: "Permanent Marker", weight: 400 },
    { id: "pacifico", label: "Pacifico", family: "Pacifico", weight: 400 },
    { id: "lobster", label: "Lobster", family: "Lobster", weight: 400 }
  ];
  const fontOf = id => FONTS.find(f => f.id === id) || FONTS[0];
  /* Designs prêts des maillots : les quatre motifs du maillot de la page d'accueil, dans leurs couleurs d'origine.
     cols : fond, motif, liseré. Dessinés en 400 × 440, la boîte des gabarits tshirt et tank. */
  const MOTIFS = [
    { id: "uni", label: "Uni" },
    { id: "eclats", label: "Éclats", cols: ["--kit-white", "--magenta", "--kit-yellow"], liser: true },
    { id: "rayures", label: "Rayures", cols: ["--kit-white", "--kit-red", "--kit-red"] },
    { id: "degrade", label: "Dégradé", cols: ["--kit-turquoise", "--kit-navy", "--kit-white"], liser: true },
    { id: "chevrons", label: "Chevrons", cols: ["--kit-black", "--kit-gold", "--kit-gold"] }
  ];
  const MOTIF_T = ["tshirt", "tank"];
  const motifOf = id => MOTIFS.find(m => m.id === id) || MOTIFS[0];
  /* gid : dégradé déclaré dans les defs. mirror : le dos montre le motif retourné, comme un maillot vu de derrière. */
  function motifSvg(id, c1, c2, c3, gid, mirror) {
    const d = {
      eclats: `<path d="M-20 262 420 72v84L-20 346z" fill="${c2}"/><path d="M-20 368 420 178v18L-20 386z" fill="${c3}"/>`,
      rayures: `<path d="M36 0h38v440H36zM118 0h38v440h-38zM200 0h38v440h-38zM282 0h38v440h-38z" fill="${c2}"/>`,
      degrade: `<rect width="400" height="440" fill="url(#${gid})"/><path d="M-20 300h440M-20 318h440M-20 336h440" stroke="${c3}" stroke-width="3" stroke-opacity=".45" fill="none"/>`,
      chevrons: `<path d="M-30 268 200 372 430 268" stroke="${c2}" stroke-width="34" fill="none"/><path d="M-30 320 200 424 430 320" stroke="${c2}" stroke-width="10" fill="none"/>`
    }[id] || "";
    return mirror && d ? `<g transform="matrix(-1 0 0 1 400 0)">${d}</g>` : d;
  }
  const motifGrad = (gid, c1, c2) => `<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="440"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`;
  const fontCss = (f, px) => `${f.weight} ${px}px "${f.family}"`;

  /* ---------- Gabarits ----------
     vb : boîte de dessin. views : face et dos, chacune avec shapes (silhouette : [chemin, dx, dy]),
     under (sous les éléments), over (par-dessus : cols, zips, poignets), outside (hors silhouette : intérieur du col).
     zones : emplacements rapides, du point de vue de la personne qui porte le vêtement. */
  const S_TEE = "M165 26C180 44 220 44 235 26L292 44 372 104 340 164 302 142 304 420Q200 432 96 420L98 142 60 164 28 104 108 44Z";
  const S_TEE_B = "M165 26C185 34 215 34 235 26L292 44 372 104 340 164 302 142 304 420Q200 432 96 420L98 142 60 164 28 104 108 44Z";
  const S_LONG = "M165 26C180 44 220 44 235 26L292 44 336 80 392 300 356 310 304 150 304 420Q200 432 96 420L96 150 44 310 8 300 64 80 108 44Z";
  const S_LONG_B = "M165 26C185 34 215 34 235 26L292 44 336 80 392 300 356 310 304 150 304 420Q200 432 96 420L96 150 44 310 8 300 64 80 108 44Z";
  const S_SHORT = "M70 10H330L350 220H222L200 110L178 220H50Z";
  const WRIST = "M392 332 356 342 353 330 389 320ZM8 332 44 342 47 330 11 320Z";
  const label = (c, x, y) => `<rect x="${x - 9}" y="${y}" width="18" height="10" rx="1.5" fill="${c.t}" opacity=".85"/>`;
  const Z = (id, lbl, view, x, y, w, h) => ({ id, label: lbl, view, x, y, w, h });

  const T = {
    tshirt(p, c) {
      const long = p.sl === "long";
      const cuffs = long ? "M392 300 356 310 353 298 389 288ZM8 300 44 310 47 298 11 288Z" : "M372 104 340 164 329 156 361 96ZM28 104 60 164 71 156 39 96Z";
      const zip = p.zip ? `<path d="M200 44V168" stroke="${c.t}" stroke-width="4"/><rect x="195" y="160" width="10" height="18" rx="2" fill="${c.t}"/>` : "";
      const sleeveG = long ? Z("manche-g", "Manche gauche", "face", 324, 118, 34, 46) : Z("manche-g", "Manche gauche", "face", 312, 90, 38, 38);
      const sleeveD = long ? Z("manche-d", "Manche droite", "face", 42, 118, 34, 46) : Z("manche-d", "Manche droite", "face", 50, 90, 38, 38);
      return {
        vb: [400, 440],
        views: {
          face: {
            shapes: [[long ? S_LONG : S_TEE]],
            outside: `<path d="M165 26C185 34 215 34 235 26C220 44 180 44 165 26Z" fill="${c.i}"/>`,
            over: `<path d="M165 26C180 50 220 50 235 26" fill="none" stroke="${c.t}" stroke-width="10"/><path d="${cuffs}" fill="${c.t}"/>${zip}`
          },
          dos: {
            shapes: [[long ? S_LONG_B : S_TEE_B]],
            over: `<path d="M165 26C185 38 215 38 235 26" fill="none" stroke="${c.t}" stroke-width="9"/>${label(c, 200, 40)}<path d="M108 44C130 60 150 66 165 70M292 44C270 60 250 66 235 70" fill="none" stroke="${c.t}" stroke-width="1.5" stroke-opacity=".5"/><path d="${cuffs}" fill="${c.t}"/>`
          }
        },
        zones: [
          Z("coeur", "Cœur", "face", 232, 88, 56, 56), Z("anticoeur", "Anti-cœur", "face", 112, 88, 56, 56),
          Z("poitrine", "Poitrine", "face", 128, 100, 144, 112), Z("ventre", "Ventre", "face", 128, 232, 144, 120),
          sleeveG, sleeveD,
          Z("haut-dos", "Haut du dos", "dos", 130, 58, 140, 46), Z("centre-dos", "Centre du dos", "dos", 120, 112, 160, 190), Z("bas-dos", "Bas du dos", "dos", 130, 318, 140, 70)
        ]
      };
    },
    tank(p, c) {
      const arm = `<path d="M110 30C108 70 100 110 68 128M290 30C292 70 300 110 332 128" fill="none" stroke="${c.t}" stroke-width="9"/>`;
      const body = neck => `M150 20${neck}L290 30C292 70 300 110 332 128L332 420Q200 434 68 420L68 128C100 110 108 70 110 30Z`;
      return {
        vb: [400, 440],
        views: {
          face: { shapes: [[body("C168 70 232 70 250 20")]], outside: `<path d="M150 20C175 40 225 40 250 20C232 70 168 70 150 20Z" fill="${c.i}"/>`, over: `<path d="M150 20C168 70 232 70 250 20" fill="none" stroke="${c.t}" stroke-width="9"/>${arm}` },
          dos: { shapes: [[body("C175 40 225 40 250 20")]], over: `<path d="M150 20C175 40 225 40 250 20" fill="none" stroke="${c.t}" stroke-width="9"/>${label(c, 200, 38)}${arm}` }
        },
        zones: [
          Z("coeur", "Cœur", "face", 224, 102, 52, 52), Z("anticoeur", "Anti-cœur", "face", 124, 102, 52, 52),
          Z("poitrine", "Poitrine", "face", 120, 128, 160, 120), Z("ventre", "Ventre", "face", 120, 262, 160, 110),
          Z("haut-dos", "Haut du dos", "dos", 125, 58, 150, 46), Z("centre-dos", "Centre du dos", "dos", 110, 114, 180, 190), Z("bas-dos", "Bas du dos", "dos", 125, 318, 150, 70)
        ]
      };
    },
    hoodie(p, c) {
      const shape = "M150 44C150 4 250 4 250 44L300 54 344 92 392 332 356 342 306 172 306 420Q200 432 94 420L94 172 44 342 8 332 56 92 100 54Z";
      const hem = `<path d="M96 406Q200 420 304 406" fill="none" stroke="${c.t}" stroke-width="8"/><path d="${WRIST}" fill="${c.t}"/>`;
      return {
        vb: [400, 440],
        views: {
          face: { shapes: [[shape]], over: `<path d="M162 46C162 16 238 16 238 46C232 74 168 74 162 46Z" fill="${c.i}"/><path d="M186 70V128M214 70V128" stroke="${c.t}" stroke-width="3" stroke-linecap="round"/><path d="M126 300H274L292 392H108Z" fill="none" stroke="${c.t}" stroke-width="3"/>${hem}` },
          dos: { shapes: [[shape]], over: `<path d="M150 44C150 88 250 88 250 44" fill="none" stroke="${c.t}" stroke-width="3"/><path d="M200 6V78" stroke="${c.t}" stroke-width="2.5"/>${hem}` }
        },
        zones: [
          Z("coeur", "Cœur", "face", 234, 102, 44, 44), Z("anticoeur", "Anti-cœur", "face", 122, 102, 44, 44),
          Z("poitrine", "Poitrine", "face", 132, 136, 136, 110), Z("ventre", "Poche ventrale", "face", 140, 308, 120, 66),
          Z("manche-g", "Manche gauche", "face", 322, 180, 30, 46), Z("manche-d", "Manche droite", "face", 48, 180, 30, 46),
          Z("haut-dos", "Haut du dos", "dos", 130, 96, 140, 44), Z("centre-dos", "Centre du dos", "dos", 115, 150, 170, 180), Z("bas-dos", "Bas du dos", "dos", 130, 346, 140, 44)
        ]
      };
    },
    jacket(p, c) {
      const shape = "M158 30H242L252 46 300 56 344 94 392 332 356 342 306 174 306 420Q200 430 94 420L94 174 44 342 8 332 56 94 100 56 148 46Z";
      let quilt = "";
      if (p.q) for (let y = 110; y <= 400; y += 36) quilt += `M96 ${y}H304`;
      const lines = quilt ? `<path d="${quilt}" stroke="${c.t}" stroke-width="2" stroke-opacity=".55"/>` : "";
      const hem = `<path d="M96 406Q200 418 304 406" fill="none" stroke="${c.t}" stroke-width="8"/><path d="${WRIST}" fill="${c.t}"/>`;
      return {
        vb: [400, 440],
        views: {
          face: { shapes: [[shape]], over: `${lines}<path d="M158 30H242L252 46Q200 64 148 46Z" fill="${c.i}"/><path d="M200 52V420" stroke="${c.t}" stroke-width="4"/><path d="M122 330l30-22M278 330l-30-22" stroke="${c.t}" stroke-width="3" stroke-linecap="round"/>${hem}` },
          dos: { shapes: [[shape]], over: `${lines}<path d="M158 30H242L252 46Q200 52 148 46Z" fill="${c.t}"/>${label(c, 200, 50)}<path d="M100 120Q200 134 300 120" fill="none" stroke="${c.t}" stroke-width="2" stroke-opacity=".6"/>${hem}` }
        },
        zones: [
          Z("coeur", "Cœur", "face", 222, 96, 56, 56), Z("anticoeur", "Anti-cœur", "face", 122, 96, 56, 56),
          Z("manche-g", "Manche gauche", "face", 322, 180, 30, 46), Z("manche-d", "Manche droite", "face", 48, 180, 30, 46),
          Z("haut-dos", "Haut du dos", "dos", 130, 74, 140, 40), Z("centre-dos", "Centre du dos", "dos", 115, 144, 170, 180), Z("bas-dos", "Bas du dos", "dos", 130, 346, 140, 44)
        ]
      };
    },
    bib(p, c) {
      const body = neck => `M140 20${neck}L310 30V420H90V30Z`;
      const ties = `<path d="M90 250H70M310 250H330" stroke="${c.t}" stroke-width="8" stroke-linecap="round"/>`;
      return {
        vb: [400, 440],
        views: {
          face: { shapes: [[body("C160 64 240 64 260 20")]], outside: `<path d="M140 20C165 40 235 40 260 20C240 64 160 64 140 20Z" fill="${c.i}"/>`, over: `<path d="M140 20C160 64 240 64 260 20" fill="none" stroke="${c.t}" stroke-width="8"/>${ties}` },
          dos: { shapes: [[body("C165 40 235 40 260 20")]], over: `<path d="M140 20C165 40 235 40 260 20" fill="none" stroke="${c.t}" stroke-width="8"/>${ties}` }
        },
        zones: [
          Z("coeur", "Cœur", "face", 224, 72, 46, 46), Z("anticoeur", "Anti-cœur", "face", 130, 72, 46, 46), Z("centre", "Centre", "face", 118, 96, 164, 200),
          Z("haut-dos", "Haut du dos", "dos", 130, 52, 140, 44), Z("centre-dos", "Centre du dos", "dos", 118, 104, 164, 220)
        ]
      };
    },
    boxer(p, c) {
      const shape = "M60 30H340L352 262H222L200 150L178 262H48Z";
      return {
        vb: [400, 300],
        views: {
          face: { shapes: [[shape]], under: `<path d="M60 30H340V70H60Z" fill="${c.t}"/>`, over: `<path d="M200 70C200 108 192 128 178 140" fill="none" stroke="${c.t}" stroke-width="3"/>` },
          dos: { shapes: [[shape]], under: `<path d="M60 30H340V70H60Z" fill="${c.t}"/>`, over: `<path d="M200 70C196 104 204 126 200 150" fill="none" stroke="${c.t}" stroke-width="2.5"/>` }
        },
        zones: [
          Z("ceinture", "Ceinture", "face", 90, 38, 220, 24), Z("jambe-g", "Jambe gauche", "face", 238, 150, 80, 70), Z("jambe-d", "Jambe droite", "face", 82, 150, 80, 70),
          Z("ceinture-dos", "Ceinture arrière", "dos", 90, 38, 220, 24), Z("arriere", "Arrière", "dos", 110, 84, 180, 90)
        ]
      };
    },
    tote(p, c) {
      const handles = `<path d="M128 152C128 44 272 44 272 152" fill="none" stroke="${c.t}" stroke-width="16"/>`;
      const jute = p.fixed === "jute";
      const view = { shapes: [["M58 150H342L332 440H68Z"]], under: `${handles}<path d="M58 150H342V166H58Z" fill="${c.t}"/>`, over: jute ? `<path d="${hatch(58, 150, 342, 440)}" stroke="${c.t}" stroke-width="1" stroke-opacity=".35"/>` : "" };
      return {
        vb: [400, 460],
        views: jute ? { face: view } : { face: view, dos: { ...view } },
        zones: [Z("centre", "Centre", "face", 92, 190, 216, 216), Z("haut", "Haut", "face", 110, 180, 180, 60), ...(jute ? [] : [Z("centre-dos", "Centre du verso", "dos", 92, 190, 216, 216)])]
      };
    },
    drawstring(p, c) {
      const view = { shapes: [["M86 40H314V440H86Z"]], under: `<path d="M86 40H314V64H86Z" fill="${c.t}"/>`, over: `<path d="M98 52L66 440M302 52L334 440" stroke="${c.t}" stroke-width="5" stroke-linecap="round"/><circle cx="94" cy="424" r="7" fill="${c.t}"/><circle cx="306" cy="424" r="7" fill="${c.t}"/>` };
      return { vb: [400, 460], views: { face: view, dos: { ...view } }, zones: [Z("centre", "Centre", "face", 112, 96, 176, 300), Z("centre-dos", "Centre du verso", "dos", 112, 96, 176, 300)] };
    },
    pennant(p, c) {
      return { vb: [440, 240], views: { face: { shapes: [["M40 20L420 120L40 220Z"]], under: `<path d="M40 20H66V220H40Z" fill="${c.t}"/>` } }, zones: [Z("centre", "Centre", "face", 84, 90, 180, 60)] };
    },
    clubpennant(p, c, k) {
      let fringe = "";
      for (let i = 0; i <= 10; i++) { const t = i / 10; fringe += `M${44 + 106 * t} ${310 + 90 * t}l-10 14M${150 + 106 * t} ${400 - 90 * t}l10 14`; }
      const view = { shapes: [["M44 40H256V310L150 400L44 310Z"]], over: `<path d="${fringe}" stroke="${c.t}" stroke-width="3" stroke-linecap="round"/><path d="M44 32L150 8L256 32" fill="none" stroke="${c.t}" stroke-width="2"/><path d="M20 34H280" stroke="${k.wood}" stroke-width="8" stroke-linecap="round"/><circle cx="16" cy="34" r="9" fill="${k.wood}"/><circle cx="284" cy="34" r="9" fill="${k.wood}"/>` };
      return { vb: [300, 440], views: { face: view, dos: { ...view } }, names: { dos: "Verso" }, zones: [Z("centre", "Centre", "face", 72, 76, 156, 196), Z("centre-dos", "Centre du verso", "dos", 72, 76, 156, 196)] };
    },
    beachflag(p, c, k) {
      return {
        vb: [300, 540],
        views: { face: { shapes: [["M76 30C196 26 252 120 244 330L232 478H76Z"]], over: `<path d="M70 18V512" stroke="${k.metal}" stroke-width="8" stroke-linecap="round"/><path d="M36 520H104M70 512 48 532M70 512 92 532" stroke="${k.metal}" stroke-width="5" stroke-linecap="round"/>` } },
        zones: [Z("centre", "Centre", "face", 96, 140, 124, 260), Z("haut", "Haut", "face", 96, 60, 120, 70)]
      };
    },
    bob(p, c) {
      return { vb: [400, 280], views: { face: { shapes: [["M122 150C122 64 160 34 200 34S278 64 278 150Z"], ["M40 172C84 138 316 138 360 172C318 210 82 210 40 172Z"]], under: `<path d="M122 130H278V152H122Z" fill="${c.t}"/>`, over: `<path d="M66 172C106 152 294 152 334 172" fill="none" stroke="${c.t}" stroke-width="2" stroke-dasharray="5 4"/>` } }, zones: [Z("devant", "Devant", "face", 150, 64, 100, 62), Z("bord", "Bord", "face", 90, 160, 220, 24)] };
    },
    beanie(p, c) {
      let ribs = "";
      for (let x = 104; x <= 296; x += 12) ribs += `M${x} 244V316`;
      return { vb: [400, 360], views: { face: { shapes: [["M104 250C104 112 150 52 200 52S296 112 296 250Z"], ["M92 238H308V322H92Z"]], under: `<path d="M92 238H308V322H92Z" fill="${c.t}"/>`, over: `<path d="${ribs}" stroke="${c.c}" stroke-width="2" stroke-opacity=".35"/>` } }, zones: [Z("revers", "Revers", "face", 130, 252, 140, 56), Z("haut", "Haut", "face", 146, 118, 108, 88)] };
    },
    swimcap(p, c) {
      return { vb: [400, 300], views: { face: { shapes: [["M60 240C60 108 130 40 200 40S340 108 340 240C280 262 120 262 60 240Z"]], over: `<path d="M60 240C120 262 280 262 340 240" fill="none" stroke="${c.t}" stroke-width="3"/>` } }, zones: [Z("cote", "Côté", "face", 120, 100, 160, 100)] };
    },
    tube(p, c) {
      if (p.v === "arm") return { vb: [300, 480], views: { face: { shapes: [["M96 30H204L186 450H114Z"]], under: `<path d="M96 30H204L202 58H98Z" fill="${c.t}"/>` } }, zones: [Z("centre", "Centre", "face", 112, 90, 76, 300)] };
      if (p.v === "knee") return { vb: [300, 400], views: { face: { shapes: [["M70 40H230L220 360H80Z"]], under: `<path d="M70 40H230L229 64H71ZM76 336H224L220 360H80Z" fill="${c.t}"/>` } }, zones: [Z("centre", "Centre", "face", 96, 90, 108, 220)] };
      return { vb: [300, 440], views: { face: { shapes: [["M60 50H240V390H60Z"]], over: `<path d="M60 50C60 30 240 30 240 50C240 70 60 70 60 50Z" fill="${c.t}"/><path d="M60 390C60 410 240 410 240 390" fill="none" stroke="${c.t}" stroke-width="3"/>` } }, zones: [Z("centre", "Centre", "face", 80, 90, 140, 260)] };
    },
    /* Surface à plat : drapeau, serviette, tapis, trousse, coussin, bandana, écharpe, bandeau, bracelet, dossard */
    panel(p, c, k) {
      const [rw, rh] = p.r || [1, 1];
      const m = 20, big = 380, W = rw >= rh ? big : big * rw / rh, H = rw >= rh ? big * rh / rw : big;
      const d = p.d || "";
      const x0 = d === "flag" ? m + 14 : m, y0 = m, vw = x0 + W + m, vh = H + 2 * m;
      const rx = { towel: 16, mat: 12, cushion: 20, band: H / 2, pouch: H * .35, numbib: 6 }[d] || 3;
      const rect = (x, y, w, h, r) => `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
      const shape = d === "triangle" ? `M${x0} ${y0}H${x0 + W}L${x0 + W / 2} ${y0 + H}Z` : rect(x0, y0, W, H, Math.min(rx, W / 2, H / 2));
      let over = "";
      if (d === "towel" || d === "bandana" || d === "cushion") { const i = d === "cushion" ? 10 : 7; over = `<path d="${rect(x0 + i, y0 + i, W - 2 * i, H - 2 * i, Math.max(2, rx - i))}" fill="none" stroke="${c.t}" stroke-width="3"${d === "cushion" ? ' stroke-dasharray="6 5"' : ""}/>`; }
      if (d === "triangle") over = `<path d="M${x0 + 8} ${y0 + 6}H${x0 + W - 8}L${x0 + W / 2} ${y0 + H - 12}Z" fill="none" stroke="${c.t}" stroke-width="3"/>`;
      if (d === "scarf") { let f = ""; for (let y = y0 + 2; y <= y0 + H - 2; y += 5) f += `M${x0} ${y}h-14M${x0 + W} ${y}h14`; over = `<path d="${f}" stroke="${c.t}" stroke-width="2"/>`; }
      if (d === "pouch") over = `<path d="M${x0 + 14} ${y0 + 9}H${x0 + W - 14}" stroke="${c.t}" stroke-width="4"/><rect x="${x0 + W - 30}" y="${y0 + 4}" width="12" height="18" rx="2" fill="${c.t}"/>`;
      if (d === "numbib") over = [[12, 12], [W - 12, 12], [12, H - 12], [W - 12, H - 12]].map(([a, b]) => `<circle cx="${x0 + a}" cy="${y0 + b}" r="5" fill="${k.hole}" stroke="${c.t}" stroke-width="1.5"/>`).join("");
      if (d === "flag") over = `<path d="M${x0 - 8} ${y0 - 10}V${y0 + H + 16}" stroke="${k.metal}" stroke-width="7" stroke-linecap="round"/>`;
      return {
        vb: [vw, vh],
        views: { face: { shapes: [[shape]], over } },
        zones: [
          d === "triangle" ? Z("centre", "Centre", "face", x0 + W * .3, y0 + H * .12, W * .4, H * .38) : Z("centre", "Centre", "face", x0 + W * .2, y0 + H * .2, W * .6, H * .6),
          Z("plein", "Pleine surface", "face", x0, y0, W, H)
        ]
      };
    }
  };
  function hatch(x1, y1, x2, y2) { let d = ""; for (let x = x1 - (y2 - y1); x < x2; x += 9) d += `M${x} ${y2}L${x + (y2 - y1)} ${y1}`; return d; }
  /* Short des ensembles : dessiné sous le haut, face et dos différents */
  function withShort(tpl, c) {
    const dy = tpl.vb[1] + 10, tr = `transform="translate(0 ${dy})"`;
    const band = `<path d="M68 10H332L334 36H66Z" fill="${c.t}" ${tr}/>`;
    tpl.views.face.shapes = [...tpl.views.face.shapes, [S_SHORT, 0, dy]];
    tpl.views.face.under = (tpl.views.face.under || "") + band;
    tpl.views.face.over = (tpl.views.face.over || "") + `<path d="M188 36c-6 14-14 20-22 24M212 36c6 14 14 20 22 24" fill="none" stroke="${c.t}" stroke-width="3" stroke-linecap="round" ${tr}/>`;
    if (tpl.views.dos) {
      tpl.views.dos.shapes = [...tpl.views.dos.shapes, [S_SHORT, 0, dy]];
      tpl.views.dos.under = (tpl.views.dos.under || "") + band;
      tpl.views.dos.over = (tpl.views.dos.over || "") + `<path d="M200 36C197 64 203 90 200 110" fill="none" stroke="${c.t}" stroke-width="2.5" ${tr}/>`;
      tpl.zones.push(Z("short-dos", "Arrière du short", "dos", 140, dy + 48, 120, 50));
    }
    tpl.zones.push(Z("short-g", "Short, jambe gauche", "face", 236, dy + 110, 70, 70), Z("short-d", "Short, jambe droite", "face", 94, dy + 110, 70, 70));
    tpl.vb = [tpl.vb[0], dy + 230];
    tpl.shortDy = dy;
    return tpl;
  }

  /* ---------- État ---------- */
  const PRODUCTS = DATA.products.filter(p => p.viz);
  const byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
  const S = { pid: null, short: false, color: null, motif: "uni", c2: null, c3: null, view: "face", els: [], sel: null, files: {}, extra: [], tab: "produit" };
  const KFIX = () => ({ wood: tok("--viz-wood"), metal: tok("--viz-metal"), jute: tok("--viz-jute"), shade: tok("--viz-shade"), hole: tok("--paper") });
  let TPL = null, CUR = null;
  function build() {
    const p = byId[S.pid], k = KFIX();
    const fixed = p.viz.fixed === "jute";
    const color = fixed ? k.jute.toUpperCase() : (S.color || tok("--kit-white").toUpperCase());
    const motifOk = MOTIF_T.includes(p.viz.t), mo = motifOk ? motifOf(S.motif) : MOTIFS[0];
    const m = mo.cols ? { ...mo, c2: S.c2 || tok(mo.cols[1]).toUpperCase(), c3: S.c3 || tok(mo.cols[2]).toUpperCase() } : null;
    /* Avec un motif, col, poignets et ceinture du short prennent la couleur du motif */
    const c = { c: color, t: m ? m.c2 : trimOf(color), i: inkOf(color) };
    let tpl = T[p.viz.t](p.viz, c, k);
    if (p.quoteShort && S.short) tpl = withShort(tpl, c);
    tpl.names = Object.assign({ face: "Face", dos: "Dos" }, tpl.names || {});
    if (!tpl.views[S.view]) S.view = "face";
    TPL = tpl;
    CUR = { p, tpl, c, k, fixed, motifOk, m };
    return CUR;
  }
  /* Couleurs et design en clair, pour l'aperçu, le lecteur d'écran et le devis */
  function colorsText(hex) {
    const n = c => hex ? `${colorName(c)} (${c})` : colorName(c);
    if (CUR.fixed) return "couleur jute naturel";
    if (!CUR.m) return `couleur ${n(CUR.c.c)}`;
    return `design ${CUR.m.label.toLowerCase()}, fond ${n(CUR.c.c)}, motif ${n(CUR.m.c2)}${CUR.m.liser ? `, liseré ${n(CUR.m.c3)}` : ""}`;
  }
  const optionName = () => { const p = byId[S.pid]; if (p.quoteAs && p.quoteShort) { const i = p.quoteShort.indexOf(!!S.short); if (i >= 0) return p.quoteAs[i]; } return p.name; };
  const zonesOf = view => TPL.zones.filter(z => z.view === view);

  /* ---------- Mesure des éléments ---------- */
  const mctx = document.createElement("canvas").getContext("2d");
  const mcache = new Map();
  function metrics(el) {
    const f = fontOf(el.font), key = `${f.id}|${el.text}`;
    let m = mcache.get(key);
    if (!m) {
      mctx.font = fontCss(f, 100);
      mctx.textAlign = "center";
      const t = mctx.measureText(el.text || " ");
      const L = t.actualBoundingBoxLeft || 0, R = t.actualBoundingBoxRight || t.width, A = t.actualBoundingBoxAscent || 70, D = t.actualBoundingBoxDescent || 0;
      m = { w: Math.max(1, L + R), dx: (L - R) / 2, asc: A, desc: D };
      mcache.set(key, m);
    }
    const s = el.fs / 100, sw = el.stroke ? el.fs * .1 : 0;
    return { w: m.w * s + sw, h: (m.asc + m.desc) * s + sw, dx: m.dx * s, base: (m.asc - m.desc) / 2 * s, sw };
  }
  const loading = new Set();
  function ensureFont(id) {
    const f = fontOf(id);
    if (document.fonts.check(fontCss(f, 40)) || loading.has(id)) return;
    loading.add(id);
    document.fonts.load(fontCss(f, 40)).then(() => { for (const k of mcache.keys()) if (k.startsWith(f.id + "|")) mcache.delete(k); loading.delete(id); renderAll(); });
  }
  function dims(el) {
    if (el.type === "txt") { const m = metrics(el); return { w: m.w, h: m.h }; }
    const f = S.files[el.src], a = f && f.img ? f.img.naturalHeight / f.img.naturalWidth : 1;
    return { w: el.w, h: el.w * a };
  }
  function setWidth(el, w) {
    const lim = [TPL.vb[0] * .03, TPL.vb[0] * 1.2];
    if (el.type === "txt") { const cur = dims(el).w; el.fs = clamp(el.fs * clamp(w, ...lim) / cur, 6, 600); }
    else el.w = clamp(w, ...lim);
  }
  function keepInside(el) { el.cx = clamp(el.cx, 0, TPL.vb[0]); el.cy = clamp(el.cy, 0, TPL.vb[1]); }

  /* ---------- Rendu SVG ---------- */
  function defs(uid, view) {
    const v = TPL.views[view];
    const shapes = v.shapes.map(([d, dx = 0, dy = 0]) => `<path d="${d}"${dx || dy ? ` transform="translate(${dx} ${dy})"` : ""}/>`).join("");
    const grad = CUR.m && CUR.m.id === "degrade" ? motifGrad(`${uid}-m`, CUR.c.c, CUR.m.c2) : "";
    return `<defs><clipPath id="${uid}-s">${shapes}</clipPath>${grad}<linearGradient id="${uid}-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${CUR.k.shade}" stop-opacity=".2"/><stop offset=".28" stop-color="${CUR.k.shade}" stop-opacity="0"/><stop offset=".72" stop-color="${CUR.k.shade}" stop-opacity="0"/><stop offset="1" stop-color="${CUR.k.shade}" stop-opacity=".2"/></linearGradient></defs>`;
  }
  function motifLayer(uid, view) {
    const m = CUR.m; if (!m) return "";
    const dy = TPL.shortDy;
    const short = dy ? `<path d="M70 10H86L68 220H50ZM330 10H314L332 220H350Z" fill="${m.c2}" transform="translate(0 ${dy})"/>` : "";
    return motifSvg(m.id, CUR.c.c, m.c2, m.c3, `${uid}-m`, view === "dos") + short;
  }
  const under = (uid, view) => { const [W, H] = TPL.vb, v = TPL.views[view]; return `${v.outside || ""}<g clip-path="url(#${uid}-s)"><rect width="${W}" height="${H}" fill="${CUR.c.c}"/>${motifLayer(uid, view)}${v.under || ""}</g>`; };
  const over = (uid, view) => {
    const [W, H] = TPL.vb, v = TPL.views[view];
    const outline = v.shapes.map(([d, dx = 0, dy = 0]) => `<path d="${d}" fill="none" stroke="${mix(CUR.c.c, "#000000", .35)}" stroke-width="1.5"${dx || dy ? ` transform="translate(${dx} ${dy})"` : ""}/>`).join("");
    return `<g clip-path="url(#${uid}-s)">${v.over || ""}<rect width="${W}" height="${H}" fill="url(#${uid}-g)"/></g>${outline}`;
  };
  function elSvg(el) {
    const d = dims(el);
    const tr = `translate(${el.cx} ${el.cy}) rotate(${el.rot || 0})`;
    if (el.type === "img") {
      const f = S.files[el.src]; if (!f || !f.img) return "";
      const img = el.keyed && f.keyed ? f.keyed : f.img;
      return `<g data-id="${el.id}" transform="${tr}"><image href="${img.src}" x="${-d.w / 2}" y="${-d.h / 2}" width="${d.w}" height="${d.h}" preserveAspectRatio="none"/></g>`;
    }
    const m = metrics(el), f = fontOf(el.font);
    const stroke = el.stroke ? ` stroke="${el.strokeColor}" stroke-width="${m.sw}" stroke-linejoin="round" paint-order="stroke"` : "";
    return `<g data-id="${el.id}" transform="${tr}"><text x="${m.dx}" y="${m.base}" text-anchor="middle" font-family="${esc(f.family)}" font-weight="${f.weight}" font-size="${el.fs}" fill="${el.color}"${stroke} xml:space="preserve">${esc(el.text)}</text></g>`;
  }
  const viewSvg = (uid, view, extra = "") => `${defs(uid, view)}${under(uid, view)}<g clip-path="url(#${uid}-s)">${S.els.filter(e => e.view === view).map(elSvg).join("")}</g>${over(uid, view)}${extra}`;

  /* ---------- Scène ---------- */
  const stage = $("#stage"), svg = $("#st-svg"), hits = $("#st-hits");
  function stageLabel() {
    const n = S.els.filter(e => e.view === S.view).length;
    return `Aperçu ${TPL.names[S.view].toLowerCase()} : ${optionName()}, ${colorsText(false)}, ${n ? `${n} élément${n > 1 ? "s" : ""}` : "aucun élément"}`;
  }
  function renderStage() {
    const [W, H] = TPL.vb;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.innerHTML = viewSvg("st", S.view);
    svg.setAttribute("aria-label", stageLabel());
    $("#st-viewtag").textContent = S.view === "dos" ? `Vue de ${TPL.names.dos === "Verso" ? "verso" : "dos"}` : "Vue de face";
    stage.dataset.view = S.view;
    $("#st-empty").hidden = S.els.length > 0;
    placeHits();
  }
  function renderThumbs() {
    const box = $("#st-thumbs"), views = Object.keys(TPL.views);
    box.hidden = views.length < 2;
    box.innerHTML = views.map(v => `<button type="button" class="st-thumb" data-view="${v}" aria-pressed="${v === S.view}"><svg viewBox="0 0 ${TPL.vb[0]} ${TPL.vb[1]}" aria-hidden="true">${viewSvg(`th-${v}`, v)}</svg><span>${TPL.names[v]}</span></button>`).join("");
  }
  /* Repère écran : coordonnées de dessin vers pixels de la scène */
  function mapper() {
    const m = svg.getScreenCTM(), r = stage.getBoundingClientRect();
    if (!m) return null;
    return { k: m.a, x: v => m.e - r.left + v * m.a, y: v => m.f - r.top + v * m.d, inv: (cx, cy) => ({ x: (cx - m.e) / m.a, y: (cy - m.f) / m.d }) };
  }
  const describeEl = el => el.type === "txt" ? `Texte « ${el.text} »` : `Logo ${S.files[el.src] ? S.files[el.src].name : ""}`;
  function placeHits() {
    const M = mapper();
    hits.innerHTML = "";
    if (!M) return;
    for (const el of S.els.filter(e => e.view === S.view)) {
      const d = dims(el), sel = el.id === S.sel;
      /* Un élément sélectionné garde un cadre d'au moins 56 px : ses poignées ne se chevauchent jamais */
      const w = sel ? Math.max(56, d.w * M.k) : d.w * M.k, h = sel ? Math.max(56, d.h * M.k) : d.h * M.k;
      const hw = Math.max(44, w), hh = Math.max(44, h);
      const node = document.createElement("div");
      node.className = "st-hit" + (sel ? " is-sel" : "");
      node.dataset.id = el.id;
      node.tabIndex = 0;
      node.setAttribute("role", "button");
      node.setAttribute("aria-label", `${describeEl(el)}${sel ? ", sélectionné" : ""}. Flèches pour déplacer, plus et moins pour la taille, crochets pour tourner, Suppr pour retirer.`);
      Object.assign(node.style, { left: `${M.x(el.cx) - hw / 2}px`, top: `${M.y(el.cy) - hh / 2}px`, width: `${hw}px`, height: `${hh}px`, transform: `rotate(${el.rot || 0}deg)` });
      node.innerHTML = `<span class="st-frame" style="width:${w}px;height:${h}px">${sel ? `<i class="st-h" data-h="nw"></i><i class="st-h" data-h="ne"></i><i class="st-h" data-h="sw"></i><i class="st-h" data-h="se"></i><i class="st-rot" data-h="rot"></i>` : ""}</span>`;
      hits.appendChild(node);
    }
    const el = selEl();
    $("#st-bar").hidden = !(el && el.view === S.view);
  }
  /* Mise à jour légère pendant un geste : un seul élément redessiné */
  function refreshEl(el) {
    const g = svg.querySelector(`[data-id="${el.id}"]`);
    if (g) g.outerHTML = elSvg(el);
    placeHits();
  }

  /* ---------- Sélection et gestes ---------- */
  const selEl = () => S.els.find(e => e.id === S.sel) || null;
  const live = msg => { $("#st-live").textContent = msg; };
  function select(id, focus = false) {
    S.sel = id;
    const el = selEl();
    if (el) { if (el.view !== S.view) S.view = el.view; openTab(el.type === "txt" ? "textes" : "logos", false); }
    renderAll();
    if (focus && el) { const h = hits.querySelector(`[data-id="${id}"]`); h && h.focus(); }
  }
  let g = null;
  stage.addEventListener("pointerdown", ev => {
    if (ev.button > 0 || ev.target.closest("#st-bar")) return;
    const M = mapper(); if (!M) return;
    const hit = ev.target.closest(".st-hit"), handle = ev.target.closest(".st-h, .st-rot");
    if (!hit) { if (S.sel) { S.sel = null; renderAll(); } return; }
    ev.preventDefault();
    const el = S.els.find(e => e.id === hit.dataset.id);
    if (S.sel !== el.id) { S.sel = el.id; openTab(el.type === "txt" ? "textes" : "logos", false); renderAll(); }
    const p = M.inv(ev.clientX, ev.clientY);
    const mode = handle ? (handle.dataset.h === "rot" ? "rot" : "size") : "move";
    g = { id: ev.pointerId, el, mode, p0: p, cx: el.cx, cy: el.cy, w0: dims(el).w, dist0: Math.hypot(p.x - el.cx, p.y - el.cy) || 1, ang0: Math.atan2(p.y - el.cy, p.x - el.cx), rot0: el.rot || 0 };
    stage.setPointerCapture(ev.pointerId);
    stage.classList.add("is-drag");
  });
  stage.addEventListener("pointermove", ev => {
    if (!g || ev.pointerId !== g.id) return;
    const M = mapper(), p = M.inv(ev.clientX, ev.clientY), el = g.el;
    if (g.mode === "move") { el.cx = g.cx + p.x - g.p0.x; el.cy = g.cy + p.y - g.p0.y; keepInside(el); }
    else if (g.mode === "size") setWidth(el, g.w0 * Math.hypot(p.x - el.cx, p.y - el.cy) / g.dist0);
    else {
      let a = g.rot0 + (Math.atan2(p.y - el.cy, p.x - el.cx) - g.ang0) * 180 / Math.PI;
      a = ((a % 360) + 540) % 360 - 180;
      const snap = ev.shiftKey ? 15 : 90, near = Math.round(a / snap) * snap;
      if (ev.shiftKey || Math.abs(a - near) < 4) a = near;
      el.rot = Math.round(a * 10) / 10;
    }
    refreshEl(el);
  });
  const endGesture = ev => { if (!g || (ev.pointerId !== undefined && ev.pointerId !== g.id)) return; g = null; stage.classList.remove("is-drag"); renderAll(); save(); };
  stage.addEventListener("pointerup", endGesture);
  stage.addEventListener("pointercancel", endGesture);
  stage.addEventListener("lostpointercapture", endGesture);
  stage.addEventListener("focusin", ev => { const h = ev.target.closest(".st-hit"); if (h && S.sel !== h.dataset.id && !g) { S.sel = h.dataset.id; renderPanel(); renderStage(); const n = hits.querySelector(`[data-id="${h.dataset.id}"]`); n && n.focus(); } });
  stage.addEventListener("keydown", ev => {
    const h = ev.target.closest(".st-hit"); if (!h) return;
    const el = S.els.find(e => e.id === h.dataset.id); if (!el) return;
    const step = TPL.vb[0] * (ev.shiftKey ? .05 : .01), k = ev.key;
    if (k === "ArrowLeft") el.cx -= step; else if (k === "ArrowRight") el.cx += step;
    else if (k === "ArrowUp") el.cy -= step; else if (k === "ArrowDown") el.cy += step;
    else if (k === "+" || k === "=") setWidth(el, dims(el).w * 1.06); else if (k === "-" || k === "_") setWidth(el, dims(el).w / 1.06);
    else if (k === "]") el.rot = (el.rot || 0) + (ev.shiftKey ? 15 : 5); else if (k === "[") el.rot = (el.rot || 0) - (ev.shiftKey ? 15 : 5);
    else if (k === "Delete" || k === "Backspace") { removeEl(el.id); return ev.preventDefault(); }
    else if (k === "Escape") { S.sel = null; renderAll(); stage.focus(); return; }
    else return;
    ev.preventDefault();
    keepInside(el); refreshEl(el); save();
    const n = hits.querySelector(`[data-id="${el.id}"]`); n && n.focus();
  });
  if (window.ResizeObserver) new ResizeObserver(() => placeHits()).observe(stage);

  /* ---------- Actions sur les éléments ---------- */
  function nearestZone(el) {
    const zs = zonesOf(el.view);
    const inside = zs.filter(z => el.cx >= z.x && el.cx <= z.x + z.w && el.cy >= z.y && el.cy <= z.y + z.h).sort((a, b) => a.w * a.h - b.w * b.h);
    if (inside.length) return inside[0];
    return zs.slice().sort((a, b) => Math.hypot(a.x + a.w / 2 - el.cx, a.y + a.h / 2 - el.cy) - Math.hypot(b.x + b.w / 2 - el.cx, b.y + b.h / 2 - el.cy))[0];
  }
  function putInZone(el, z) {
    el.view = z.view; el.cx = z.x + z.w / 2; el.cy = z.y + z.h / 2; el.rot = 0;
    const d = dims(el), fit = Math.min(z.w / d.w, z.h / d.h) * .92;
    setWidth(el, d.w * fit);
    S.view = z.view;
  }
  function freeZone(view, order) {
    const zs = zonesOf(view);
    const taken = z => S.els.some(e => e.view === view && e.cx >= z.x && e.cx <= z.x + z.w && e.cy >= z.y && e.cy <= z.y + z.h);
    const pref = order.map(id => zs.find(z => z.id === id)).filter(Boolean);
    return [...pref, ...zs].find(z => !taken(z)) || pref[0] || zs[0];
  }
  function addEl(el, zone) {
    S.els.push(el);
    if (zone) putInZone(el, zone); else keepInside(el);
    S.sel = el.id;
    renderAll(); save();
    live(`${describeEl(el)} ajouté, ${TPL.names[el.view].toLowerCase()}, zone ${nearestZone(el).label}.`);
  }
  function removeEl(id) {
    const i = S.els.findIndex(e => e.id === id); if (i < 0) return;
    const el = S.els[i];
    S.els.splice(i, 1);
    if (S.sel === id) S.sel = null;
    renderAll(); save();
    live(`${describeEl(el)} retiré.`);
    stage.focus();
  }
  function duplicate(id) {
    const el = S.els.find(e => e.id === id); if (!el) return;
    const copy = { ...el, id: newId(), cx: el.cx + TPL.vb[0] * .05, cy: el.cy + TPL.vb[0] * .05 };
    keepInside(copy);
    S.els.splice(S.els.indexOf(el) + 1, 0, copy);
    S.sel = copy.id; renderAll(); save();
    live(`${describeEl(copy)} dupliqué.`);
  }
  function raise(id, top) {
    const i = S.els.findIndex(e => e.id === id); if (i < 0) return;
    const [el] = S.els.splice(i, 1);
    top ? S.els.push(el) : S.els.unshift(el);
    renderAll(); save();
    live(top ? "Élément passé au premier plan." : "Élément passé à l'arrière-plan.");
  }

  /* ---------- Fichiers du client ---------- */
  const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  function sizeSvg(txt) {
    const doc = new DOMParser().parseFromString(txt, "image/svg+xml"), el = doc.documentElement;
    if (el.nodeName.toLowerCase() !== "svg") throw new Error("svg");
    const vb = (el.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
    const ok = a => /^\d/.test(el.getAttribute(a) || "") && !/%$/.test(el.getAttribute(a));
    if (!ok("width") || !ok("height")) {
      const [w, h] = vb.length === 4 && vb[2] > 0 && vb[3] > 0 ? [vb[2], vb[3]] : [500, 500], k = 1000 / Math.max(w, h);
      el.setAttribute("width", Math.round(w * k)); el.setAttribute("height", Math.round(h * k));
    }
    return new XMLSerializer().serializeToString(el);
  }
  /* Fond blanc : on efface le blanc relié aux bords de l'image ; les blancs intérieurs du logo restent */
  function keyWhite(img) {
    const k = Math.min(1, 1200 / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * k)), h = Math.max(1, Math.round(img.naturalHeight * k));
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    const ctx = cv.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    let data;
    try { data = ctx.getImageData(0, 0, w, h); } catch (e) { return null; }
    const px = data.data, white = i => px[i + 3] > 250 && Math.min(px[i], px[i + 1], px[i + 2]) > 236;
    if (![[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]].every(([x, y]) => white((y * w + x) * 4))) return null;
    const seen = new Uint8Array(w * h), stack = [];
    for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
    for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
    while (stack.length) {
      const n = stack.pop();
      if (seen[n]) continue;
      seen[n] = 1;
      const i = n * 4, mn = Math.min(px[i], px[i + 1], px[i + 2]);
      if (px[i + 3] < 10 || mn >= 228) {
        px[i + 3] = 0;
        const x = n % w;
        if (x > 0) stack.push(n - 1); if (x < w - 1) stack.push(n + 1);
        if (n >= w) stack.push(n - w); if (n < w * (h - 1)) stack.push(n + w);
      } else if (mn > 190) px[i + 3] = Math.round(px[i + 3] * (228 - mn) / 38);
    }
    ctx.putImageData(data, 0, 0);
    return cv.toDataURL("image/png");
  }
  const isRaster = f => /^image\/(png|jpe?g|webp|gif)$/.test(f.type) || /\.(png|jpe?g|webp|gif)$/i.test(f.name);
  const isSvg = f => f.type === "image/svg+xml" || /\.svg$/i.test(f.name);
  async function loadFile(file) {
    const rec = { file, name: file.name || "logo", img: null, keyed: null };
    const url = URL.createObjectURL(isSvg(file) ? new Blob([sizeSvg(await file.text())], { type: "image/svg+xml" }) : file);
    rec.img = await loadImg(url);
    if (!rec.img.naturalWidth) throw new Error("vide");
    if (isRaster(file)) { const k = keyWhite(rec.img); if (k) rec.keyed = await loadImg(k); }
    return rec;
  }
  async function addFiles(list) {
    const msgs = [];
    for (const file of list) {
      if (!isRaster(file) && !isSvg(file)) {
        S.extra.push({ file, name: file.name });
        msgs.push(`${file.name} : aperçu indisponible pour ce format, le fichier sera joint tel quel au devis.`);
        continue;
      }
      try {
        const rec = await loadFile(file), key = newId();
        S.files[key] = rec;
        const el = { id: newId(), type: "img", src: key, view: S.view, cx: 0, cy: 0, w: 60, rot: 0, keyed: !!rec.keyed };
        addEl(el, freeZone(S.view, ["coeur", "anticoeur", "poitrine", "ventre", "manche-g", "manche-d", "centre", "centre-dos", "haut-dos"]));
        if (rec.keyed) msgs.push(`${file.name} : fond blanc rendu transparent. Décochez la case « Fond blanc transparent » pour le garder.`);
      } catch (e) {
        S.extra.push({ file, name: file.name });
        msgs.push(`${file.name} : ce fichier ne peut pas être affiché, il sera joint tel quel au devis.`);
      }
    }
    $("#l-msg").textContent = msgs.join(" ");
    renderAll(); save();
  }

  /* ---------- Panneau ---------- */
  function openTab(id, focus = true) {
    S.tab = id;
    $$('[role="tab"]').forEach(t => { const on = t.dataset.tab === id; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
    $$('[role="tabpanel"]').forEach(p => { p.hidden = p.id !== `tab-${id}`; });
    if (id === "textes") FONTS.forEach(f => ensureFont(f.id));
  }
  $("#st-tabs").addEventListener("click", e => { const t = e.target.closest('[role="tab"]'); if (t) openTab(t.dataset.tab); });
  $("#st-tabs").addEventListener("keydown", e => {
    const tabs = $$('[role="tab"]'), i = tabs.findIndex(t => t.dataset.tab === S.tab);
    const n = e.key === "ArrowRight" ? (i + 1) % tabs.length : e.key === "ArrowLeft" ? (i - 1 + tabs.length) % tabs.length : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : -1;
    if (n >= 0) { e.preventDefault(); openTab(tabs[n].dataset.tab); }
  });
  const swatchRadios = (name, cur, extra = "") => swatches().map(s => `<label class="st-sw" style="--c:${s.hex}"><input type="radio" name="${name}" value="${s.hex}"${s.hex === (cur || "").toUpperCase() ? " checked" : ""} aria-label="${s.name}"${extra}><span></span></label>`).join("");
  function zoneButtons(el) {
    const cur = nearestZone(el);
    return Object.keys(TPL.views).map(v => `<div class="st-zg"><span>${TPL.names[v]}</span><div class="st-zb">${zonesOf(v).map(z => `<button type="button" class="st-chip" data-act="zone" data-zone="${z.id}" aria-pressed="${el.view === v && cur && cur.id === z.id}">${z.label}</button>`).join("")}</div></div>`).join("");
  }
  const commonCtl = el => `
    <div class="st-row"><span class="st-lbl">Placer sur</span>${zoneButtons(el)}</div>
    <div class="st-row st-inline"><span class="st-lbl">Taille</span><button type="button" class="st-ib" data-act="smaller" aria-label="Réduire">−</button><button type="button" class="st-ib" data-act="bigger" aria-label="Agrandir">+</button>
      <span class="st-lbl st-ml">Rotation</span><button type="button" class="st-ib" data-act="rotl" aria-label="Tourner à gauche de 15 degrés">↺</button><button type="button" class="st-ib" data-act="rotr" aria-label="Tourner à droite de 15 degrés">↻</button><button type="button" class="st-chip" data-act="rot0">Droit</button></div>
    <div class="st-row st-inline"><button type="button" class="st-chip" data-act="dup">Dupliquer</button><button type="button" class="st-chip" data-act="front">Premier plan</button><button type="button" class="st-chip" data-act="back">Arrière-plan</button><button type="button" class="st-chip st-del" data-act="del">Supprimer</button></div>`;
  function cardHead(el, i) {
    const f = el.type === "img" ? S.files[el.src] : null;
    const thumb = el.type === "img" ? `<img src="${esc((el.keyed && f.keyed ? f.keyed : f.img).src)}" alt="">` : `<b style="font-family:'${esc(fontOf(el.font).family)}';color:${el.color}">T</b>`;
    const where = `${TPL.names[el.view]}, ${nearestZone(el).label.toLowerCase()}`;
    const name = el.type === "img" ? f.name : `« ${el.text} »`;
    return `<button type="button" class="st-card-h" data-act="select" aria-expanded="${el.id === S.sel}"><span class="st-th">${thumb}</span><span class="st-cn"><b>${esc(name)}</b><small>${esc(where)}</small></span></button>`;
  }
  function logoCard(el, i) {
    const sel = el.id === S.sel, f = S.files[el.src];
    return `<li class="st-card${sel ? " is-sel" : ""}" data-id="${el.id}">${cardHead(el, i)}${sel ? `<div class="st-card-b">
      ${f.keyed ? `<label class="st-check"><input type="checkbox" data-act="keyed"${el.keyed ? " checked" : ""}> Fond blanc transparent</label>` : ""}${commonCtl(el)}</div>` : ""}</li>`;
  }
  function textCard(el, i) {
    const sel = el.id === S.sel, uid = el.id;
    return `<li class="st-card${sel ? " is-sel" : ""}" data-id="${el.id}">${cardHead(el, i)}${sel ? `<div class="st-card-b">
      <div class="f"><label class="f-lbl" for="tx-${uid}">Texte</label><input id="tx-${uid}" data-act="text" value="${esc(el.text)}" maxlength="40" autocomplete="off"></div>
      <div class="st-row"><span class="st-lbl" id="fl-${uid}">Police</span><div class="st-fonts" role="radiogroup" aria-labelledby="fl-${uid}">${FONTS.map(f => `<label class="st-font"><input type="radio" name="font-${uid}" value="${f.id}" data-act="font"${f.id === el.font ? " checked" : ""}><span style="font-family:'${esc(f.family)}';font-weight:${f.weight}">${esc(f.label)}</span></label>`).join("")}</div></div>
      <div class="st-row"><span class="st-lbl" id="cl-${uid}">Couleur du texte</span><div class="st-sws" role="radiogroup" aria-labelledby="cl-${uid}">${swatchRadios(`col-${uid}`, el.color, ' data-act="color"')}<label class="st-custom"><input type="color" value="${el.color.length === 7 ? el.color : "#FFFFFF"}" data-act="color" aria-label="Autre couleur de texte"><span>Autre</span></label></div></div>
      <label class="st-check"><input type="checkbox" data-act="stroke"${el.stroke ? " checked" : ""}> Contour autour des lettres</label>
      ${el.stroke ? `<div class="st-row"><span class="st-lbl" id="sl-${uid}">Couleur du contour</span><div class="st-sws" role="radiogroup" aria-labelledby="sl-${uid}">${swatchRadios(`stc-${uid}`, el.strokeColor, ' data-act="strokeColor"')}</div></div>` : ""}
      ${commonCtl(el)}</div>` : ""}</li>`;
  }
  function renderPanel() {
    const p = CUR.p;
    /* Produit */
    $("#p-color-row").hidden = CUR.fixed;
    $("#p-motif-row").hidden = !CUR.motifOk;
    const mid = CUR.m ? CUR.m.id : "uni";
    $$('#p-motifs input').forEach(r => { r.checked = r.value === mid; });
    $$('#p-motifs .pm-uni').forEach(r => r.setAttribute("fill", CUR.c.c));
    $("#p-color-l").textContent = CUR.m ? "Couleur de fond" : "Couleur du produit";
    $("#p-custom").setAttribute("aria-label", CUR.m ? "Autre couleur de fond" : "Autre couleur du produit");
    $("#p-c2-row").hidden = !CUR.m;
    $("#p-c3-row").hidden = !(CUR.m && CUR.m.liser);
    if (CUR.m) {
      $$('#p-c2s input').forEach(r => { r.checked = r.value === CUR.m.c2; }); $("#p-c2-custom").value = CUR.m.c2;
      $$('#p-c3s input').forEach(r => { r.checked = r.value === CUR.m.c3; }); $("#p-c3-custom").value = CUR.m.c3;
    }
    $("#p-fixed").hidden = !CUR.fixed;
    $("#p-short-row").hidden = !p.quoteShort;
    $("#p-short").checked = !!S.short;
    $$('#p-colors input[type=radio]').forEach(r => { r.checked = r.value === CUR.c.c; });
    $("#p-custom").value = CUR.c.c;
    /* Logos */
    const logos = S.els.filter(e => e.type === "img");
    $("#l-list").innerHTML = logos.map(logoCard).join("");
    $("#l-none").hidden = logos.length > 0;
    $("#l-extra").hidden = !S.extra.length;
    $("#l-extra-list").innerHTML = S.extra.map(x => `<li>${esc(x.name)}</li>`).join("");
    /* Textes */
    const texts = S.els.filter(e => e.type === "txt");
    $("#t-list").innerHTML = texts.map(textCard).join("");
    $("#t-none").hidden = texts.length > 0;
    $("#t-numbers").hidden = !TPL.views.dos;
    $("#st-count").textContent = S.els.length ? `${S.els.length} élément${S.els.length > 1 ? "s" : ""}` : "";
  }
  /* Textes en couleur automatique : lisibles sur la couleur du produit, tant que le client n'a pas choisi la leur */
  function autoColors() { const col = contrastOn(CUR.c.c); S.els.forEach(e => { if (e.type === "txt" && e.autoColor) e.color = col; }); }
  function renderAll() {
    build();
    autoColors();
    renderStage();
    renderThumbs();
    renderPanel();
    placeHits();
  }
  /* Événements du panneau (délégation) */
  const panel = $("#st-panel");
  panel.addEventListener("click", e => {
    const b = e.target.closest("[data-act]"); if (!b || b.tagName === "INPUT") return;
    const card = b.closest(".st-card"), el = card && S.els.find(x => x.id === card.dataset.id);
    const act = b.dataset.act;
    if (act === "select" && el) { select(S.sel === el.id ? null : el.id); if (S.sel) { const c = panel.querySelector(`.st-card[data-id="${el.id}"] .st-card-h`); c && c.focus(); } return; }
    if (!el) return;
    if (act === "zone") { const z = TPL.zones.find(z => z.id === b.dataset.zone); putInZone(el, z); live(`${describeEl(el)} placé sur ${z.label.toLowerCase()}.`); }
    else if (act === "bigger") setWidth(el, dims(el).w * 1.12);
    else if (act === "smaller") setWidth(el, dims(el).w / 1.12);
    else if (act === "rotl") el.rot = (el.rot || 0) - 15;
    else if (act === "rotr") el.rot = (el.rot || 0) + 15;
    else if (act === "rot0") el.rot = 0;
    else if (act === "dup") return duplicate(el.id);
    else if (act === "front") return raise(el.id, true);
    else if (act === "back") return raise(el.id, false);
    else if (act === "del") return removeEl(el.id);
    else return;
    keepInside(el); renderAll(); save();
    const again = panel.querySelector(`.st-card[data-id="${el.id}"] [data-act="${act}"]${act === "zone" ? `[data-zone="${b.dataset.zone}"]` : ""}`);
    again && again.focus();
  });
  panel.addEventListener("input", e => {
    const t = e.target, card = t.closest(".st-card"), el = card && S.els.find(x => x.id === card.dataset.id);
    if (t.id === "p-custom") { S.color = t.value.toUpperCase(); renderAll(); save(); $("#p-custom").focus(); return; }
    if (t.id === "p-c2-custom" || t.id === "p-c3-custom") { S[t.id.slice(2, 4)] = t.value.toUpperCase(); renderAll(); save(); $(`#${t.id}`).focus(); return; }
    if (!el) return;
    if (t.dataset.act === "text") {
      el.text = t.value.slice(0, 40) || " ";
      build(); renderStage(); renderThumbs();
      const h = card.querySelector(".st-cn b"); if (h) h.textContent = `« ${el.text} »`;
      save();
    } else if (t.dataset.act === "color" && t.type === "color") { el.color = t.value.toUpperCase(); el.autoColor = false; renderAll(); save(); const n = panel.querySelector(`.st-card[data-id="${el.id}"] input[type=color][data-act="color"]`); n && n.focus(); }
  });
  panel.addEventListener("change", e => {
    const t = e.target, card = t.closest(".st-card"), el = card && S.els.find(x => x.id === card.dataset.id);
    if (t.name === "p-color") { S.color = t.value; renderAll(); save(); $(`#p-colors input[value="${t.value}"]`).focus(); return; }
    if (t.name === "p-c2" || t.name === "p-c3") { S[t.name.slice(2)] = t.value; renderAll(); save(); $(`input[name="${t.name}"][value="${t.value}"]`).focus(); return; }
    if (t.name === "p-motif") { setMotif(t.value); $(`#p-motifs input[value="${t.value}"]`).focus(); return; }
    if (t.id === "p-short") { S.short = t.checked; syncProductSelect(); renderAll(); save(); $("#p-short").focus(); return; }
    if (!el) return;
    const act = t.dataset.act;
    if (act === "font") { el.font = t.value; ensureFont(t.value); }
    else if (act === "color" && t.type === "radio") { el.color = t.value; el.autoColor = false; }
    else if (act === "stroke") el.stroke = t.checked;
    else if (act === "strokeColor") el.strokeColor = t.value;
    else if (act === "keyed") el.keyed = t.checked;
    else return;
    renderAll(); save();
    const sel = t.type === "radio" ? `input[name="${t.name}"][value="${t.value}"]` : `[data-act="${act}"]`;
    const again = panel.querySelector(`.st-card[data-id="${el.id}"] ${sel}`); again && again.focus();
  });
  $("#l-file").addEventListener("change", e => { const files = [...e.target.files]; e.target.value = ""; if (files.length) addFiles(files); });
  $("#t-add").addEventListener("submit", e => {
    e.preventDefault();
    const val = $("#t-new").value.trim() || "VOTRE TEXTE";
    const el = { id: newId(), type: "txt", text: val.slice(0, 40), font: "teko", color: contrastOn(CUR.c.c), autoColor: true, stroke: false, strokeColor: tok("--kit-black").toUpperCase(), fs: 40, view: S.view, cx: 0, cy: 0, rot: 0 };
    ensureFont("teko");
    addEl(el, freeZone(S.view, ["poitrine", "haut-dos", "centre-dos", "ventre", "centre", "coeur", "anticoeur"]));
    $("#t-new").value = "";
  });
  $("#t-numbers").addEventListener("click", () => {
    ensureFont("teko");
    const col = contrastOn(CUR.c.c), zs = zonesOf("dos");
    const zn = zs.find(z => z.id === "haut-dos") || zs[0], zc = zs.find(z => z.id === "centre-dos") || zs[0];
    const base = { type: "txt", font: "teko", color: col, autoColor: true, stroke: false, strokeColor: tok("--kit-black").toUpperCase(), rot: 0, view: "dos", cx: 0, cy: 0 };
    const name = { ...base, id: newId(), text: "NOM", fs: 40 }, num = { ...base, id: newId(), text: "10", fs: 120 };
    S.els.push(name, num);
    putInZone(name, zn); putInZone(num, zc);
    S.sel = num.id; S.view = "dos";
    renderAll(); save();
    live("Nom et numéro ajoutés au dos. Modifiez le texte dans la carte de chaque élément.");
  });
  $("#st-thumbs").addEventListener("click", e => { const b = e.target.closest(".st-thumb"); if (!b) return; S.view = b.dataset.view; if (selEl() && selEl().view !== S.view) S.sel = null; renderAll(); const n = $(`.st-thumb[data-view="${S.view}"]`); n && n.focus(); live(`Vue de ${TPL.names[S.view].toLowerCase()}.`); });
  $("#st-bar").addEventListener("click", e => { const b = e.target.closest("[data-bar]"); const el = selEl(); if (!b || !el) return; if (b.dataset.bar === "dup") duplicate(el.id); else removeEl(el.id); });

  /* ---------- Produit ---------- */
  const optMap = {};
  PRODUCTS.forEach(p => (p.quoteAs || [p.name]).forEach((n, i) => { optMap[n] = { pid: p.id, short: p.quoteShort ? p.quoteShort[i] : false }; }));
  function fillProductSelect() {
    $("#p-product").innerHTML = DATA.cats.map(c => {
      const items = PRODUCTS.filter(p => p.cat === c.id);
      return items.length ? `<optgroup label="${esc(c.name)}">${items.flatMap(p => p.quoteAs || [p.name]).map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join("")}</optgroup>` : "";
    }).join("");
  }
  const syncProductSelect = () => { $("#p-product").value = optionName(); };
  $("#p-product").addEventListener("change", async e => {
    const m = optMap[e.target.value]; if (!m) return;
    if (m.pid === S.pid) { S.short = m.short; renderAll(); save(); return; }
    await flush();
    await loadProduct(m.pid, m.short);
  });
  $("#p-colors").innerHTML = swatchRadios("p-color", null);
  $("#p-c2s").innerHTML = swatchRadios("p-c2", null);
  $("#p-c3s").innerHTML = swatchRadios("p-c3", null);
  /* Vignettes des designs : la silhouette du maillot dans les couleurs d'origine de chaque motif */
  $("#p-motifs").innerHTML = MOTIFS.map(m => {
    const [c1, c2, c3] = m.cols ? m.cols.map(t => tok(t)) : [tok("--kit-white")];
    const g = `pm-${m.id}`, trim = m.cols ? c2 : mix(c1, "#000000", .28);
    return `<label class="st-motif"><input type="radio" name="p-motif" value="${m.id}"><span><svg viewBox="0 0 400 440" aria-hidden="true"><defs><clipPath id="${g}-c"><path d="${S_TEE}"/></clipPath>${m.id === "degrade" ? motifGrad(`${g}-m`, c1, c2) : ""}</defs><g clip-path="url(#${g}-c)"><rect width="400" height="440" fill="${c1}"${m.cols ? "" : ' class="pm-uni"'}/>${m.cols ? motifSvg(m.id, c1, c2, c3, `${g}-m`) : ""}<path d="M165 26C180 50 220 50 235 26" fill="none" stroke="${trim}" stroke-width="14"/></g><path d="${S_TEE}" fill="none" stroke="${mix(c1, "#000000", .35)}" stroke-width="6"/></svg>${m.label}</span></label>`;
  }).join("");
  /* Un design prêt remet ses couleurs d'origine ; Uni garde la couleur de fond actuelle */
  function setMotif(id) {
    const m = motifOf(id);
    S.motif = m.id;
    if (m.cols) [S.color, S.c2, S.c3] = m.cols.map(t => tok(t).toUpperCase());
    renderAll(); save();
    live(m.cols ? `Design ${m.label.toLowerCase()} appliqué. Changez ses couleurs juste en dessous.` : "Maillot uni.");
  }

  /* ---------- Mémoire du visuel (par produit) ---------- */
  let saveT = null;
  const serial = () => ({ pid: S.pid, short: S.short, color: S.color, motif: S.motif, c2: S.c2, c3: S.c3, els: S.els.map(e => ({ ...e })), files: Object.fromEntries(Object.entries(S.files).map(([k, f]) => [k, { blob: f.file, name: f.name }])), extra: S.extra.map(x => ({ blob: x.file, name: x.name })) });
  function save() { clearTimeout(saveT); saveT = setTimeout(flush, 350); updateUrl(); }
  async function flush() { clearTimeout(saveT); if (S.pid && window.IFSStore) await IFSStore.set(`design:${S.pid}`, serial()); }
  function updateUrl() { const u = new URL(location.href); u.searchParams.set("produit", S.pid); if (byId[S.pid].quoteShort) u.searchParams.set("short", S.short ? "1" : "0"); else u.searchParams.delete("short"); history.replaceState(null, "", u); }
  async function loadProduct(pid, short) {
    S.pid = pid; S.sel = null; S.view = "face"; S.els = []; S.files = {}; S.extra = []; S.color = null; S.motif = "uni"; S.c2 = null; S.c3 = null;
    S.short = typeof short === "boolean" ? short : (byId[pid].quoteShort ? byId[pid].quoteShort[0] : false);
    const saved = window.IFSStore ? await IFSStore.get(`design:${pid}`) : null;
    if (saved) {
      S.color = saved.color || null;
      S.motif = saved.motif || "uni"; S.c2 = saved.c2 || null; S.c3 = saved.c3 || null;
      if (typeof short !== "boolean") S.short = !!saved.short;
      for (const [k, f] of Object.entries(saved.files || {})) {
        try { const file = f.blob instanceof File ? f.blob : new File([f.blob], f.name, { type: f.blob.type }); S.files[k] = await loadFile(file); S.files[k].name = f.name; } catch (e) { /* fichier illisible : ignoré */ }
      }
      S.extra = (saved.extra || []).map(x => ({ file: x.blob instanceof File ? x.blob : new File([x.blob], x.name, { type: x.blob.type }), name: x.name }));
      S.els = (saved.els || []).filter(e => e.type === "txt" || S.files[e.src]);
      S.els.filter(e => e.type === "txt").forEach(e => ensureFont(e.font));
    }
    syncProductSelect();
    renderAll(); updateUrl();
    document.title = `Personnaliser : ${byId[pid].name} | IFS`;
  }
  $("#st-reset").addEventListener("click", async e => {
    const b = e.currentTarget;
    if (b.dataset.confirm !== "1") { b.dataset.confirm = "1"; b.textContent = "Confirmer : tout effacer"; setTimeout(() => { b.dataset.confirm = ""; b.textContent = "Tout effacer"; }, 4000); return; }
    b.dataset.confirm = ""; b.textContent = "Tout effacer";
    S.els = []; S.files = {}; S.extra = []; S.sel = null; S.color = null; S.motif = "uni"; S.c2 = null; S.c3 = null;
    renderAll(); await flush(); live("Visuel effacé.");
  });

  /* ---------- Export : face et dos côte à côte, joint au devis ---------- */
  async function drawSvg(ctx, inner, x, y, w, h) {
    const doc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TPL.vb[0]} ${TPL.vb[1]}" width="${w}" height="${h}">${inner}</svg>`;
    const url = URL.createObjectURL(new Blob([doc], { type: "image/svg+xml" }));
    try { ctx.drawImage(await loadImg(url), x, y, w, h); } finally { URL.revokeObjectURL(url); }
  }
  async function exporter() {
    build();
    await document.fonts.ready;
    const views = Object.keys(TPL.views), [W, H] = TPL.vb, k = 820 / H, vw = W * k, gap = 60, pad = 40;
    const cw = Math.round(pad * 2 + views.length * vw + (views.length - 1) * gap), ch = Math.round(820 + pad * 2 + 70);
    const cv = document.createElement("canvas"); cv.width = cw; cv.height = ch;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = tok("--paper"); ctx.fillRect(0, 0, cw, ch);
    for (let i = 0; i < views.length; i++) {
      const v = views[i], x0 = pad + i * (vw + gap), y0 = pad;
      await drawSvg(ctx, defs("x", v) + under("x", v), x0, y0, vw, 820);
      ctx.save();
      ctx.translate(x0, y0); ctx.scale(k, k);
      const clip = new Path2D();
      TPL.views[v].shapes.forEach(([d, dx = 0, dy = 0]) => clip.addPath(new Path2D(d), new DOMMatrix().translate(dx, dy)));
      ctx.clip(clip);
      for (const el of S.els.filter(e => e.view === v)) {
        ctx.save();
        ctx.translate(el.cx, el.cy); ctx.rotate((el.rot || 0) * Math.PI / 180);
        if (el.type === "img") {
          const f = S.files[el.src], d = dims(el);
          ctx.drawImage(el.keyed && f.keyed ? f.keyed : f.img, -d.w / 2, -d.h / 2, d.w, d.h);
        } else {
          const m = metrics(el), f = fontOf(el.font);
          ctx.font = fontCss(f, el.fs); ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
          if (el.stroke) { ctx.lineJoin = "round"; ctx.lineWidth = m.sw; ctx.strokeStyle = el.strokeColor; ctx.strokeText(el.text, m.dx, m.base); }
          ctx.fillStyle = el.color; ctx.fillText(el.text, m.dx, m.base);
        }
        ctx.restore();
      }
      ctx.restore();
      await drawSvg(ctx, defs("x", v) + over("x", v), x0, y0, vw, 820);
      ctx.fillStyle = tok("--ink"); ctx.font = `700 26px "Hanken Grotesk", Arial, sans-serif`; ctx.textAlign = "center";
      ctx.fillText(TPL.names[v].toUpperCase(), x0 + vw / 2, y0 + 820 + 44);
    }
    ctx.fillStyle = tok("--text-2"); ctx.font = `400 17px "Hanken Grotesk", Arial, sans-serif`; ctx.textAlign = "left";
    ctx.fillText(`${optionName()} · aperçu indicatif, couleurs et placement validés sur le BAT officiel`, pad, ch - 18);
    return new Promise(res => cv.toBlob(res, "image/jpeg", .86));
  }
  function describe() {
    build();
    const lines = [`${optionName()}, ${colorsText(true)}.`];
    for (const v of Object.keys(TPL.views)) {
      const els = S.els.filter(e => e.view === v); if (!els.length) continue;
      lines.push(`${TPL.names[v]} : ` + els.map(el => {
        const z = nearestZone(el), pct = Math.round(dims(el).w / TPL.vb[0] * 100), rot = Math.round(el.rot || 0);
        const what = el.type === "img" ? `logo ${S.files[el.src].name}${el.keyed ? " (fond blanc retiré)" : ""}` : `texte « ${el.text} » en ${fontOf(el.font).label}, ${colorName(el.color)}${el.stroke ? `, contour ${colorName(el.strokeColor)}` : ""}`;
        return `${what}, zone ${z.label.toLowerCase()}, ${pct} % de la largeur${rot ? `, tourné de ${rot}°` : ""}`;
      }).join(" ; ") + ".");
    }
    if (S.extra.length) lines.push(`Fichiers joints sans aperçu : ${S.extra.map(x => x.name).join(", ")}.`);
    lines.push("Aperçu indicatif, à valider sur le BAT.");
    return lines.join("\n");
  }
  $("#st-quote").addEventListener("click", async e => {
    const b = e.currentTarget, msg = $("#st-quote-msg");
    b.disabled = true; msg.textContent = "Préparation de l'aperçu…";
    try {
      await flush();
      const preview = await exporter();
      const used = [...new Set(S.els.filter(x => x.type === "img").map(x => x.src))].map(k => S.files[k]).filter(Boolean);
      const files = [...used.map(f => ({ blob: f.file, name: f.name })), ...S.extra.map(x => ({ blob: x.file, name: x.name }))];
      const rec = { pid: S.pid, option: optionName(), short: S.short, preview, placement: describe(), files, at: Date.now() };
      await IFSStore.set("devis", rec);
      const back = await IFSStore.get("devis");
      if (!back || back.at !== rec.at) throw new Error("stockage");
      location.href = "index.html#devis-visuel";
    } catch (err) {
      b.disabled = false;
      const url = await exporter().then(bl => URL.createObjectURL(bl)).catch(() => "");
      msg.innerHTML = `Votre navigateur bloque l'enregistrement local. ${url ? `<a href="${url}" download="apercu-ifs.jpg">Téléchargez l'aperçu</a> et joignez-le à votre demande de devis.` : ""}`;
    }
  });

  /* ---------- Démarrage ---------- */
  const params = new URLSearchParams(location.search);
  const back = params.get("retour");
  if (back === "devis") { $("#st-back").href = "index.html#devis"; $("#st-back").textContent = "Retour au devis"; }
  fillProductSelect();
  const pid0 = byId[params.get("produit")] ? params.get("produit") : PRODUCTS[0].id;
  const sh = params.get("short");
  if (back !== "devis") $("#st-back").href = `index.html#fiche-${pid0}`;
  loadProduct(pid0, sh === "1" ? true : sh === "0" ? false : undefined).then(() => document.documentElement.classList.add("st-ready"));
  window.addEventListener("pagehide", () => { flush(); });
  window.IFSStudio = { exporter, describe, state: S };
})();
