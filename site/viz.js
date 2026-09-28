/* Visualiseur : le produit dessiné, le logo du client posé dessus.
   Aperçu indicatif : les couleurs et le placement définitifs sont validés sur le BAT officiel.
   Le fichier du client reste dans le navigateur ; seul l'envoi de la demande le transmet. */
(() => {
  "use strict";

  /* ---------- Couleurs ---------- */
  const tok = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const hexRgb = h => { h = h.replace("#", ""); if (h.length === 3) h = [...h].map(c => c + c).join(""); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const rgbHex = a => "#" + a.map(v => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("");
  const mix = (a, b, t) => { const A = hexRgb(a), B = hexRgb(b); return rgbHex(A.map((v, i) => v + (B[i] - v) * t)); };
  const lum = h => { const [r, g, b] = hexRgb(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
  /* Teinte des coutures et bords-côtes : plus sombre que le fond, ou plus claire sur un fond très sombre */
  const ea = v => String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const trimOf = c => lum(c) < .05 ? mix(c, "#ffffff", .3) : mix(c, "#000000", .28);

  /* Pastilles : couleurs de club courantes, définies en jetons dans la page */
  const SWATCHES = [
    ["Blanc", "--kit-white"], ["Noir", "--kit-black"], ["Rouge", "--kit-red"], ["Bleu marine", "--kit-navy"],
    ["Bleu roi", "--kit-royal"], ["Vert", "--kit-green"], ["Jaune", "--kit-yellow"], ["Magenta", "--magenta"]
  ];
  const swatchList = () => SWATCHES.map(([name, t]) => ({ name, hex: tok(t).toUpperCase() }));

  /* ---------- Gabarits ----------
     Chaque gabarit donne sa boîte (vb), ses vues et ses zones d'impression.
     Une vue : shapes (silhouette, liste [chemin, dx, dy]), under (sous le logo), over (par-dessus : cols, poignets, ombres). */
  const S_TEE = "M165 26C180 44 220 44 235 26L292 44 372 104 340 164 302 142 304 420Q200 432 96 420L98 142 60 164 28 104 108 44Z";
  const S_TEE_LONG = "M165 26C180 44 220 44 235 26L292 44 336 80 392 300 356 310 304 150 304 420Q200 432 96 420L96 150 44 310 8 300 64 80 108 44Z";
  const S_SHORT = "M70 10H330L350 220H222L200 110L178 220H50Z";
  const WRIST = "M392 332 356 342 353 330 389 320ZM8 332 44 342 47 330 11 320Z";

  const T = {
    tshirt(p, c, k) {
      const long = p.sl === "long";
      const shape = long ? S_TEE_LONG : S_TEE;
      const cuffs = long ? "M392 300 356 310 353 298 389 288ZM8 300 44 310 47 298 11 288Z" : "M372 104 340 164 329 156 361 96ZM28 104 60 164 71 156 39 96Z";
      const zip = p.zip ? `<path d="M200 44V168" stroke="${c.t}" stroke-width="4"/><rect x="195" y="160" width="10" height="18" rx="2" fill="${c.t}"/>` : "";
      return {
        vb: [400, 440],
        views: {
          face: { shapes: [[shape]], over: `<path d="M165 26C180 50 220 50 235 26" fill="none" stroke="${c.t}" stroke-width="10"/><path d="${cuffs}" fill="${c.t}"/>${zip}` },
          dos: { shapes: [[shape]], over: `<path d="M165 26C185 36 215 36 235 26" fill="none" stroke="${c.t}" stroke-width="10"/><path d="${cuffs}" fill="${c.t}"/>` }
        },
        zones: [
          { id: "coeur", label: "Cœur", view: "face", x: 232, y: 88, w: 56, h: 56 },
          { id: "poitrine", label: "Poitrine", view: "face", x: 128, y: 100, w: 144, h: 120 },
          long ? { id: "manche", label: "Manche", view: "face", x: 320, y: 150, w: 32, h: 40 } : { id: "manche", label: "Manche", view: "face", x: 308, y: 92, w: 34, h: 40 },
          { id: "nom", label: "Haut du dos", view: "dos", x: 130, y: 62, w: 140, h: 48 },
          { id: "dos", label: "Dos", view: "dos", x: 120, y: 122, w: 160, h: 200 }
        ]
      };
    },
    tank(p, c) {
      const arm = `<path d="M110 30C108 70 100 110 68 128M290 30C292 70 300 110 332 128" fill="none" stroke="${c.t}" stroke-width="9"/>`;
      const body = neck => `M150 20${neck}L290 30C292 70 300 110 332 128L332 420Q200 434 68 420L68 128C100 110 108 70 110 30Z`;
      return {
        vb: [400, 440],
        views: {
          face: { shapes: [[body("C168 70 232 70 250 20")]], over: `<path d="M150 20C168 70 232 70 250 20" fill="none" stroke="${c.t}" stroke-width="9"/>${arm}` },
          dos: { shapes: [[body("C175 40 225 40 250 20")]], over: `<path d="M150 20C175 40 225 40 250 20" fill="none" stroke="${c.t}" stroke-width="9"/>${arm}` }
        },
        zones: [
          { id: "coeur", label: "Cœur", view: "face", x: 222, y: 104, w: 54, h: 54 },
          { id: "poitrine", label: "Poitrine", view: "face", x: 120, y: 130, w: 160, h: 130 },
          { id: "nom", label: "Haut du dos", view: "dos", x: 125, y: 62, w: 150, h: 48 },
          { id: "dos", label: "Dos", view: "dos", x: 110, y: 130, w: 180, h: 200 }
        ]
      };
    },
    hoodie(p, c) {
      const shape = "M150 44C150 4 250 4 250 44L300 54 344 92 392 332 356 342 306 172 306 420Q200 432 94 420L94 172 44 342 8 332 56 92 100 54Z";
      const hem = `<path d="M96 406Q200 420 304 406" fill="none" stroke="${c.t}" stroke-width="8"/><path d="${WRIST}" fill="${c.t}"/>`;
      return {
        vb: [400, 440],
        views: {
          face: { shapes: [[shape]], over: `<path d="M162 46C162 16 238 16 238 46C232 74 168 74 162 46Z" fill="${c.t}"/><path d="M186 70V128M214 70V128" stroke="${c.t}" stroke-width="3" stroke-linecap="round"/><path d="M126 300H274L292 392H108Z" fill="none" stroke="${c.t}" stroke-width="3"/>${hem}` },
          dos: { shapes: [[shape]], over: `<path d="M150 44C150 4 250 4 250 44C250 72 150 72 150 44Z" fill="none" stroke="${c.t}" stroke-width="3"/>${hem}` }
        },
        zones: [
          { id: "coeur", label: "Cœur", view: "face", x: 232, y: 104, w: 46, h: 46 },
          { id: "poitrine", label: "Poitrine", view: "face", x: 132, y: 136, w: 136, h: 116 },
          { id: "poche", label: "Poche", view: "face", x: 140, y: 312, w: 120, h: 60 },
          { id: "manche", label: "Manche", view: "face", x: 324, y: 180, w: 30, h: 40 },
          { id: "dos", label: "Dos", view: "dos", x: 115, y: 110, w: 170, h: 220 }
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
          face: { shapes: [[shape]], over: `${lines}<path d="M158 30H242L252 46Q200 64 148 46Z" fill="${c.t}"/><path d="M200 52V420" stroke="${c.t}" stroke-width="4"/>${hem}` },
          dos: { shapes: [[shape]], over: `${lines}<path d="M158 30H242L252 46Q200 52 148 46Z" fill="${c.t}"/>${hem}` }
        },
        zones: [
          { id: "coeur", label: "Cœur", view: "face", x: 222, y: 100, w: 56, h: 56 },
          { id: "droite", label: "Poitrine droite", view: "face", x: 122, y: 100, w: 56, h: 56 },
          { id: "manche", label: "Manche", view: "face", x: 324, y: 180, w: 30, h: 40 },
          { id: "dos", label: "Dos", view: "dos", x: 115, y: 90, w: 170, h: 220 }
        ]
      };
    },
    bib(p, c) {
      const body = neck => `M140 20${neck}L310 30V420H90V30Z`;
      const ties = `<path d="M90 250H70M310 250H330" stroke="${c.t}" stroke-width="8" stroke-linecap="round"/>`;
      return {
        vb: [400, 440],
        views: {
          face: { shapes: [[body("C160 64 240 64 260 20")]], over: `<path d="M140 20C160 64 240 64 260 20" fill="none" stroke="${c.t}" stroke-width="8"/>${ties}` },
          dos: { shapes: [[body("C165 40 235 40 260 20")]], over: `<path d="M140 20C165 40 235 40 260 20" fill="none" stroke="${c.t}" stroke-width="8"/>${ties}` }
        },
        zones: [
          { id: "centre", label: "Centre", view: "face", x: 118, y: 96, w: 164, h: 200 },
          { id: "coeur", label: "Cœur", view: "face", x: 226, y: 72, w: 46, h: 46 },
          { id: "dos", label: "Dos", view: "dos", x: 118, y: 70, w: 164, h: 240 }
        ]
      };
    },
    boxer(p, c) {
      return {
        vb: [400, 300],
        views: {
          face: {
            shapes: [["M60 30H340L352 262H222L200 150L178 262H48Z"]],
            under: `<path d="M60 30H340V70H60Z" fill="${c.t}"/>`,
            over: `<path d="M200 70C200 108 192 128 178 140" fill="none" stroke="${c.t}" stroke-width="3"/>`
          }
        },
        zones: [
          { id: "ceinture", label: "Ceinture", view: "face", x: 90, y: 38, w: 220, h: 24 },
          { id: "devant", label: "Devant", view: "face", x: 212, y: 84, w: 100, h: 60 },
          { id: "jambe", label: "Jambe", view: "face", x: 238, y: 160, w: 80, h: 70 }
        ]
      };
    },
    tote(p, c) {
      const handles = `<path d="M128 152C128 44 272 44 272 152" fill="none" stroke="${c.t}" stroke-width="16"/>`;
      const view = { shapes: [["M58 150H342L332 440H68Z"]], under: `${handles}<path d="M58 150H342V166H58Z" fill="${c.t}"/>`, over: p.fixed === "jute" ? `<path d="${hatch(58, 150, 342, 440)}" stroke="${c.t}" stroke-width="1" stroke-opacity=".35"/>` : "" };
      return {
        vb: [400, 460],
        views: p.fixed === "jute" ? { face: view } : { face: view, dos: view },
        zones: [
          { id: "centre", label: "Centre", view: "face", x: 92, y: 190, w: 216, h: 216 },
          ...(p.fixed === "jute" ? [] : [{ id: "dos", label: "Dos", view: "dos", x: 92, y: 190, w: 216, h: 216 }])
        ]
      };
    },
    drawstring(p, c) {
      const view = {
        shapes: [["M86 40H314V440H86Z"]],
        under: `<path d="M86 40H314V64H86Z" fill="${c.t}"/>`,
        over: `<path d="M98 52L66 440M302 52L334 440" stroke="${c.t}" stroke-width="5" stroke-linecap="round"/><circle cx="94" cy="424" r="7" fill="${c.t}"/><circle cx="306" cy="424" r="7" fill="${c.t}"/>`
      };
      return {
        vb: [400, 460],
        views: { face: view, dos: view },
        zones: [
          { id: "centre", label: "Centre", view: "face", x: 112, y: 96, w: 176, h: 300 },
          { id: "dos", label: "Dos", view: "dos", x: 112, y: 96, w: 176, h: 300 }
        ]
      };
    },
    pennant(p, c) {
      return {
        vb: [440, 240],
        views: { face: { shapes: [["M40 20L420 120L40 220Z"]], under: `<path d="M40 20H66V220H40Z" fill="${c.t}"/>` } },
        zones: [{ id: "centre", label: "Centre", view: "face", x: 84, y: 90, w: 180, h: 60 }]
      };
    },
    clubpennant(p, c, k) {
      let fringe = "";
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const ax = 44 + 106 * t, ay = 310 + 90 * t, bx = 150 + 106 * t, by = 400 - 90 * t;
        fringe += `M${ax} ${ay}l-10 14M${bx} ${by}l10 14`;
      }
      const view = {
        shapes: [["M44 40H256V310L150 400L44 310Z"]],
        over: `<path d="${fringe}" stroke="${c.t}" stroke-width="3" stroke-linecap="round"/><path d="M44 32L150 8L256 32" fill="none" stroke="${c.t}" stroke-width="2"/><path d="M20 34H280" stroke="${k.wood}" stroke-width="8" stroke-linecap="round"/><circle cx="16" cy="34" r="9" fill="${k.wood}"/><circle cx="284" cy="34" r="9" fill="${k.wood}"/>`
      };
      return {
        vb: [300, 440],
        views: { face: view, dos: view },
        zones: [
          { id: "centre", label: "Centre", view: "face", x: 72, y: 76, w: 156, h: 196 },
          { id: "dos", label: "Verso", view: "dos", x: 72, y: 76, w: 156, h: 196 }
        ]
      };
    },
    beachflag(p, c, k) {
      return {
        vb: [300, 540],
        views: { face: { shapes: [["M76 30C196 26 252 120 244 330L232 478H76Z"]], over: `<path d="M70 18V512" stroke="${k.metal}" stroke-width="8" stroke-linecap="round"/><path d="M36 520H104M70 512 48 532M70 512 92 532" stroke="${k.metal}" stroke-width="5" stroke-linecap="round"/>` } },
        zones: [
          { id: "centre", label: "Centre", view: "face", x: 96, y: 140, w: 124, h: 260 },
          { id: "haut", label: "Haut", view: "face", x: 96, y: 60, w: 120, h: 70 }
        ]
      };
    },
    bob(p, c) {
      return {
        vb: [400, 280],
        views: {
          face: {
            shapes: [["M122 150C122 64 160 34 200 34S278 64 278 150Z"], ["M40 172C84 138 316 138 360 172C318 210 82 210 40 172Z"]],
            under: `<path d="M122 130H278V152H122Z" fill="${c.t}"/>`,
            over: `<path d="M66 172C106 152 294 152 334 172" fill="none" stroke="${c.t}" stroke-width="2" stroke-dasharray="5 4"/>`
          }
        },
        zones: [{ id: "face", label: "Devant", view: "face", x: 150, y: 64, w: 100, h: 62 }]
      };
    },
    beanie(p, c) {
      let ribs = "";
      for (let x = 104; x <= 296; x += 12) ribs += `M${x} 244V316`;
      return {
        vb: [400, 360],
        views: {
          face: {
            shapes: [["M104 250C104 112 150 52 200 52S296 112 296 250Z"], ["M92 238H308V322H92Z"]],
            under: `<path d="M92 238H308V322H92Z" fill="${c.t}"/>`,
            over: `<path d="${ribs}" stroke="${c.c}" stroke-width="2" stroke-opacity=".35"/>`
          }
        },
        zones: [
          { id: "revers", label: "Revers", view: "face", x: 130, y: 252, w: 140, h: 56 },
          { id: "haut", label: "Haut", view: "face", x: 146, y: 118, w: 108, h: 88 }
        ]
      };
    },
    swimcap(p, c) {
      return {
        vb: [400, 300],
        views: { face: { shapes: [["M60 240C60 108 130 40 200 40S340 108 340 240C280 262 120 262 60 240Z"]], over: `<path d="M60 240C120 262 280 262 340 240" fill="none" stroke="${c.t}" stroke-width="3"/>` } },
        zones: [{ id: "cote", label: "Côté", view: "face", x: 120, y: 100, w: 160, h: 100 }]
      };
    },
    tube(p, c) {
      if (p.v === "arm") return {
        vb: [300, 480],
        views: { face: { shapes: [["M96 30H204L186 450H114Z"]], under: `<path d="M96 30H204L202 58H98Z" fill="${c.t}"/>` } },
        zones: [{ id: "centre", label: "Centre", view: "face", x: 112, y: 90, w: 76, h: 300 }]
      };
      if (p.v === "knee") return {
        vb: [300, 400],
        views: { face: { shapes: [["M70 40H230L220 360H80Z"]], under: `<path d="M70 40H230L229 64H71ZM76 336H224L220 360H80Z" fill="${c.t}"/>` } },
        zones: [{ id: "centre", label: "Centre", view: "face", x: 96, y: 90, w: 108, h: 220 }]
      };
      return {
        vb: [300, 440],
        views: { face: { shapes: [["M60 50H240V390H60Z"]], over: `<path d="M60 50C60 30 240 30 240 50C240 70 60 70 60 50Z" fill="${c.t}"/><path d="M60 390C60 410 240 410 240 390" fill="none" stroke="${c.t}" stroke-width="3"/>` } },
        zones: [{ id: "centre", label: "Centre", view: "face", x: 80, y: 90, w: 140, h: 260 }]
      };
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
      if (d === "towel" || d === "bandana" || d === "cushion") {
        const i = d === "cushion" ? 10 : 7;
        over = `<path d="${rect(x0 + i, y0 + i, W - 2 * i, H - 2 * i, Math.max(2, rx - i))}" fill="none" stroke="${c.t}" stroke-width="3"${d === "cushion" ? ' stroke-dasharray="6 5"' : ""}/>`;
      }
      if (d === "triangle") over = `<path d="M${x0 + 8} ${y0 + 6}H${x0 + W - 8}L${x0 + W / 2} ${y0 + H - 12}Z" fill="none" stroke="${c.t}" stroke-width="3"/>`;
      if (d === "scarf") {
        let f = "";
        for (let y = y0 + 2; y <= y0 + H - 2; y += 5) f += `M${x0} ${y}h-14M${x0 + W} ${y}h14`;
        over = `<path d="${f}" stroke="${c.t}" stroke-width="2"/>`;
      }
      if (d === "pouch") over = `<path d="M${x0 + 14} ${y0 + 9}H${x0 + W - 14}" stroke="${c.t}" stroke-width="4"/><rect x="${x0 + W - 30}" y="${y0 + 4}" width="12" height="18" rx="2" fill="${c.t}"/>`;
      if (d === "numbib") over = [[12, 12], [W - 12, 12], [12, H - 12], [W - 12, H - 12]].map(([a, b]) => `<circle cx="${x0 + a}" cy="${y0 + b}" r="5" fill="${k.hole}" stroke="${c.t}" stroke-width="1.5"/>`).join("");
      if (d === "flag") over = `<path d="M${x0 - 8} ${y0 - 10}V${y0 + H + 16}" stroke="${k.metal}" stroke-width="7" stroke-linecap="round"/>`;
      return {
        vb: [vw, vh],
        views: { face: { shapes: [[shape]], over } },
        zones: [
          d === "triangle"
            ? { id: "centre", label: "Centre", view: "face", x: x0 + W * .3, y: y0 + H * .12, w: W * .4, h: H * .38 }
            : { id: "centre", label: "Centre", view: "face", x: x0 + W * .2, y: y0 + H * .2, w: W * .6, h: H * .6 },
          { id: "plein", label: "Pleine surface", view: "face", x: x0, y: y0, w: W, h: H }
        ]
      };
    }
  };
  function hatch(x1, y1, x2, y2) { let d = ""; for (let x = x1 - (y2 - y1); x < x2; x += 9) d += `M${x} ${y2}L${x + (y2 - y1)} ${y1}`; return d; }
  /* Le short s'ajoute sous le haut pour les ensembles */
  function withShort(tpl, c) {
    const dy = tpl.vb[1] + 10;
    const band = `<path d="M68 10H332L334 36H66Z" fill="${c.t}" transform="translate(0 ${dy})"/>`;
    for (const v of Object.values(tpl.views)) { v.shapes = [...v.shapes, [S_SHORT, 0, dy]]; v.under = (v.under || "") + band; }
    tpl.zones.push({ id: "short", label: "Short", view: "face", x: 250, y: dy + 120, w: 70, h: 70 });
    tpl.vb = [tpl.vb[0], dy + 230];
    return tpl;
  }

  /* ---------- État partagé entre la fiche et le devis ---------- */
  const S = { products: {}, pid: null, short: false, color: null, colorName: "", view: "face", zone: null, zoneBy: {}, place: {}, file: null, img: null, keyedImg: null, keyed: false, canKey: false, msg: "", urls: [] };
  const mounts = [];
  let uidN = 0;
  const VIEW_LABEL = { face: "Face", dos: "Dos" };

  function consts() { return { wood: tok("--viz-wood"), metal: tok("--viz-metal"), jute: tok("--viz-jute"), shade: tok("--viz-shade"), hole: tok("--paper") }; }
  function current() {
    const p = S.products[S.pid];
    if (!p || !p.viz) return null;
    const k = consts();
    const fixed = p.viz.fixed === "jute";
    const color = fixed ? k.jute : (S.color || tok("--kit-white"));
    const c = { c: color, t: trimOf(color) };
    let tpl = T[p.viz.t](p.viz, c, k);
    if (p.quoteShort && S.short) tpl = withShort(tpl, c);
    if (!tpl.views[S.view]) S.view = "face";
    const zones = tpl.zones.filter(z => z.view === S.view);
    let zone = zones.find(z => z.id === S.zone) || zones.find(z => z.id === S.zoneBy[S.view]) || zones[0];
    S.zone = S.zoneBy[S.view] = zone.id;
    return { p, tpl, c, k, fixed, view: tpl.views[S.view], zones, zone };
  }
  const logoImg = () => (S.keyed && S.keyedImg) || S.img;
  function placement(cur) {
    const img = logoImg(); if (!img) return null;
    const z = cur.zone, a = img.naturalHeight / img.naturalWidth;
    const key = `${cur.p.id}|${S.short ? 1 : 0}|${S.view}|${z.id}`;
    const pl = S.place[key] || (S.place[key] = { cx: z.x + z.w / 2, cy: z.y + z.h / 2, s: .6 });
    const sMax = Math.min(1, z.h / (z.w * a)), sMin = Math.min(.12, sMax);
    pl.s = Math.min(sMax, Math.max(sMin, pl.s));
    const w = z.w * pl.s, h = w * a;
    pl.cx = Math.min(z.x + z.w - w / 2, Math.max(z.x + w / 2, pl.cx));
    pl.cy = Math.min(z.y + z.h - h / 2, Math.max(z.y + h / 2, pl.cy));
    return { pl, x: pl.cx - w / 2, y: pl.cy - h / 2, w, h, sMin, sMax };
  }

  /* ---------- Rendu SVG ---------- */
  function defs(uid, cur) {
    const shapes = cur.view.shapes.map(([d, dx = 0, dy = 0]) => `<path d="${d}"${dx || dy ? ` transform="translate(${dx} ${dy})"` : ""}/>`).join("");
    const z = cur.zone;
    return `<defs><clipPath id="${uid}-s">${shapes}</clipPath><clipPath id="${uid}-z"><rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}"/></clipPath>
      <linearGradient id="${uid}-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${cur.k.shade}" stop-opacity=".2"/><stop offset=".28" stop-color="${cur.k.shade}" stop-opacity="0"/><stop offset=".72" stop-color="${cur.k.shade}" stop-opacity="0"/><stop offset="1" stop-color="${cur.k.shade}" stop-opacity=".2"/></linearGradient></defs>`;
  }
  function layerUnder(uid, cur) {
    const [W, H] = cur.tpl.vb;
    return `<g clip-path="url(#${uid}-s)"><rect width="${W}" height="${H}" fill="${cur.c.c}"/>${cur.view.under || ""}</g>`;
  }
  function layerOver(uid, cur) {
    const [W, H] = cur.tpl.vb;
    const outline = cur.view.shapes.map(([d, dx = 0, dy = 0]) => `<path d="${d}" fill="none" stroke="${mix(cur.c.c, "#000000", .35)}" stroke-width="1.5"${dx || dy ? ` transform="translate(${dx} ${dy})"` : ""}/>`).join("");
    return `<g clip-path="url(#${uid}-s)">${cur.view.over || ""}<rect width="${W}" height="${H}" fill="url(#${uid}-g)"/></g>${outline}`;
  }
  const svgDoc = (cur, inner, w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cur.tpl.vb[0]} ${cur.tpl.vb[1]}" width="${w}" height="${h}">${inner}</svg>`;

  function colorName() {
    const cur = current(); if (!cur) return "";
    if (cur.fixed) return "jute naturel";
    const hex = cur.c.c.toUpperCase();
    const hit = swatchList().find(s => s.hex === hex);
    return hit ? hit.name.toLowerCase() : `personnalisée ${hex}`;
  }
  function stageLabel(cur) {
    const name = optionName(cur);
    return `Aperçu : ${name}, couleur ${colorName()}, vue ${VIEW_LABEL[S.view].toLowerCase()}${logoImg() ? `, logo sur la zone ${cur.zone.label.toLowerCase()}` : ", sans logo"}`;
  }
  function optionName(cur) {
    const p = cur.p;
    if (p.quoteAs && p.quoteShort) { const i = p.quoteShort.indexOf(!!S.short); if (i >= 0) return p.quoteAs[i]; }
    return p.name;
  }

  function renderStage(m, cur) {
    const uid = m.uid;
    const place = placement(cur);
    const img = logoImg();
    const logo = place ? `<g class="viz-logo"><g clip-path="url(#${uid}-s)"><g clip-path="url(#${uid}-z)"><image href="${img.src}" x="${place.x}" y="${place.y}" width="${place.w}" height="${place.h}" preserveAspectRatio="none"/></g></g></g>` : "";
    const z = cur.zone;
    const outline = place ? `<rect class="viz-zone" x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" fill="none" vector-effect="non-scaling-stroke"/>` : "";
    m.stage.innerHTML = `<svg viewBox="0 0 ${cur.tpl.vb[0]} ${cur.tpl.vb[1]}" role="group" aria-label="Aperçu du produit">${defs(uid, cur)}<g role="img" aria-label="${ea(stageLabel(cur))}">${layerUnder(uid, cur)}</g>${logo}${layerOver(uid, cur)}${outline}</svg>`;
    m.svg = m.stage.firstChild;
    m.image = m.stage.querySelector("image");
    /* Poignée HTML posée sur le logo : touch-action y est respecté, contrairement au SVG, et elle fait au moins 44 px */
    if (m.image) {
      m.stage.insertAdjacentHTML("beforeend", `<div class="viz-handle" tabindex="0" role="button" aria-label="${ea(`Logo, zone ${cur.zone.label}. Flèches pour le déplacer, touches plus et moins pour changer sa taille.`)}"></div>`);
      m.handle = m.stage.lastChild;
      positionHandle(m);
    } else m.handle = null;
  }
  function positionHandle(m) {
    if (!m.handle || !m.image) return;
    const sr = m.stage.getBoundingClientRect(), ir = m.image.getBoundingClientRect();
    const w = Math.max(44, ir.width), h = Math.max(44, ir.height);
    Object.assign(m.handle.style, { left: `${ir.left - sr.left + (ir.width - w) / 2}px`, top: `${ir.top - sr.top + (ir.height - h) / 2}px`, width: `${w}px`, height: `${h}px` });
  }

  function radios(name, items, checked, cls = "") {
    return items.map(it => `<label${cls}><input type="radio" form="viz-hors-formulaire" name="${name}" value="${it.id}"${it.id === checked ? " checked" : ""}><b>${it.label}</b></label>`).join("");
  }
  function renderControls(m, cur) {
    const q = s => m.el.querySelector(s);
    const views = Object.keys(cur.tpl.views);
    q('[data-row="view"]').hidden = views.length < 2;
    q('[data-row="view"] .pick').innerHTML = radios(`${m.uid}-view`, views.map(v => ({ id: v, label: VIEW_LABEL[v] })), S.view);
    const hasLogo = !!logoImg();
    q('[data-row="zone"]').hidden = !hasLogo;
    q('[data-row="zone"] .pick').innerHTML = radios(`${m.uid}-zone`, cur.zones, cur.zone.id);
    q('[data-row="size"]').hidden = !hasLogo;
    const place = placement(cur);
    if (place) { const r = q('[data-row="size"] input'); r.min = Math.round(place.sMin * 100); r.max = Math.round(place.sMax * 100); r.value = Math.round(place.pl.s * 100); }
    q('[data-row="color"]').hidden = cur.fixed;
    q('[data-row="fixed"]').hidden = !cur.fixed;
    const hex = cur.c.c.toUpperCase();
    m.el.querySelectorAll(`[name="${m.uid}-color"]`).forEach(r => { r.checked = r.value.toUpperCase() === hex; });
    q('[data-row="color"] input[type=color]').value = cur.c.c.length === 7 ? cur.c.c : "#ffffff";
    const sh = q('[data-row="short"]'); sh.hidden = !cur.p.quoteShort; sh.querySelector("input").checked = !!S.short;
    const bg = q('[data-row="bg"]'); bg.hidden = !S.canKey; bg.querySelector("input").checked = S.keyed;
    q(".viz-msg").textContent = S.msg;
  }
  function render() {
    const cur = current();
    mounts.forEach(m => {
      if (!m.el.isConnected) return;
      m.el.hidden = !cur;
      if (!cur) return;
      renderStage(m, cur);
      renderControls(m, cur);
    });
    notify();
  }
  function notify() { if (typeof api.onchange === "function") api.onchange({ pid: S.pid, short: S.short }); }

  /* ---------- Montage d'un visualiseur ---------- */
  function mount(el, opts = {}) {
    const uid = `viz${++uidN}`;
    const sw = swatchList().map(s => `<label class="viz-swatch" style="--c:${s.hex}"><input type="radio" form="viz-hors-formulaire" name="${uid}-color" value="${s.hex}" aria-label="${s.name}"><span></span></label>`).join("");
    el.innerHTML = `<div class="viz">
      <div class="viz-stage"></div>
      ${opts.afterStage || ""}
      <p class="viz-msg" aria-live="polite"></p>
      <div class="viz-ctl">
        <div class="viz-row" data-row="view"><span id="${uid}-lv">Vue</span><div class="pick" role="radiogroup" aria-labelledby="${uid}-lv"></div></div>
        <div class="viz-row" data-row="zone"><span id="${uid}-lz">Emplacement du logo</span><div class="pick" role="radiogroup" aria-labelledby="${uid}-lz"></div></div>
        <label class="viz-row" data-row="size"><span>Taille du logo</span><input type="range" form="viz-hors-formulaire" min="12" max="100" step="1" value="60"></label>
        <div class="viz-row" data-row="color"><span id="${uid}-lc">Couleur du produit</span><div class="viz-sw" role="radiogroup" aria-labelledby="${uid}-lc">${sw}<label class="viz-custom"><input type="color" form="viz-hors-formulaire" value="#ffffff" aria-label="Autre couleur"><span>Autre</span></label></div></div>
        <p class="viz-row viz-fixed" data-row="fixed">Couleur du sac selon le modèle choisi au devis.</p>
        <label class="viz-check" data-row="short"><input type="checkbox" form="viz-hors-formulaire"> Avec le short assorti</label>
        <label class="viz-check" data-row="bg"><input type="checkbox" form="viz-hors-formulaire"> Rendre transparent le fond blanc du logo</label>
      </div>
      <p class="viz-note"><b>Aperçu indicatif.</b> Les couleurs et le placement définitifs sont validés avec vous sur le BAT officiel, avant toute production.</p>
    </div>`;
    const m = { uid, el: el.firstElementChild, stage: el.querySelector(".viz-stage") };
    mounts.push(m);
    const ctl = m.el.querySelector(".viz-ctl");
    ctl.addEventListener("change", e => {
      const t = e.target;
      if (t.name === `${uid}-view`) { S.view = t.value; S.zone = null; }
      else if (t.name === `${uid}-zone`) S.zone = t.value;
      else if (t.name === `${uid}-color`) S.color = t.value;
      else if (t.type === "checkbox" && t.closest('[data-row="short"]')) S.short = t.checked;
      else if (t.type === "checkbox" && t.closest('[data-row="bg"]')) S.keyed = t.checked;
      else return;
      render();
      m.el.querySelector(`[name="${t.name}"]:checked, [name="${t.name}"]`)?.focus?.();
      if (t.type === "checkbox") t.closest("label").querySelector("input").focus();
    });
    ctl.addEventListener("input", e => {
      const t = e.target;
      if (t.type === "color") { S.color = t.value.toUpperCase(); render(); t.focus(); }
      if (t.type === "range") {
        const cur = current(), place = cur && placement(cur); if (!place) return;
        place.pl.s = t.value / 100; placement(cur); moveImage(cur);
      }
    });
    /* Glisser le logo, au doigt comme à la souris ; un appui dans la zone y amène le logo */
    let drag = null;
    const toSvg = (ev) => { const pt = m.svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; return pt.matrixTransform(m.svg.getScreenCTM().inverse()); };
    m.stage.addEventListener("pointerdown", ev => {
      if (!m.svg || !logoImg() || ev.button > 0) return;
      const cur = current(), place = placement(cur), p = toSvg(ev), z = cur.zone;
      const onLogo = ev.target.closest(".viz-handle, .viz-logo");
      const inZone = p.x >= z.x && p.x <= z.x + z.w && p.y >= z.y && p.y <= z.y + z.h;
      if (!onLogo && !inZone) return;
      ev.preventDefault();
      if (!onLogo) { place.pl.cx = p.x; place.pl.cy = p.y; }
      drag = { id: ev.pointerId, dx: place.pl.cx - p.x, dy: place.pl.cy - p.y };
      m.stage.setPointerCapture(ev.pointerId);
      m.stage.classList.add("dragging");
      placement(cur); moveImage(cur);
    });
    m.stage.addEventListener("pointermove", ev => {
      if (!drag || ev.pointerId !== drag.id) return;
      const cur = current(), place = placement(cur), p = toSvg(ev);
      place.pl.cx = p.x + drag.dx; place.pl.cy = p.y + drag.dy;
      placement(cur); moveImage(cur);
    });
    const end = ev => { if (!drag || (ev.pointerId !== undefined && ev.pointerId !== drag.id)) return; drag = null; m.stage.classList.remove("dragging"); };
    m.stage.addEventListener("pointerup", end);
    m.stage.addEventListener("pointercancel", end);
    m.stage.addEventListener("lostpointercapture", end);
    m.stage.addEventListener("keydown", ev => {
      if (!ev.target.closest(".viz-handle")) return;
      const cur = current(), place = placement(cur); if (!place) return;
      const step = (ev.shiftKey ? .1 : .02) * cur.zone.w;
      const k = ev.key;
      if (k === "ArrowLeft") place.pl.cx -= step; else if (k === "ArrowRight") place.pl.cx += step;
      else if (k === "ArrowUp") place.pl.cy -= step; else if (k === "ArrowDown") place.pl.cy += step;
      else if (k === "+" || k === "=") place.pl.s += .05; else if (k === "-" || k === "_") place.pl.s -= .05;
      else return;
      ev.preventDefault();
      placement(cur); moveImage(cur);
      const r = m.el.querySelector('[data-row="size"] input'); r.value = Math.round(place.pl.s * 100);
    });
    if (window.ResizeObserver) new ResizeObserver(() => positionHandle(m)).observe(m.stage);
    render();
    return m;
  }
  /* Déplacement sans tout redessiner : tous les visualiseurs suivent */
  function moveImage(cur) {
    const place = placement(cur); if (!place) return;
    mounts.forEach(m => {
      if (!m.image || !m.el.isConnected) return;
      m.image.setAttribute("x", place.x); m.image.setAttribute("y", place.y);
      m.image.setAttribute("width", place.w); m.image.setAttribute("height", place.h);
      const r = m.el.querySelector('[data-row="size"] input'); if (r) r.value = Math.round(place.pl.s * 100);
      positionHandle(m);
    });
  }

  /* ---------- Fichier du client ---------- */
  const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  function sizeSvg(txt) {
    const doc = new DOMParser().parseFromString(txt, "image/svg+xml");
    const svg = doc.documentElement;
    if (svg.nodeName.toLowerCase() !== "svg") throw new Error("svg");
    const vb = (svg.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
    const hasSize = /^\d/.test(svg.getAttribute("width") || "") && !/%$/.test(svg.getAttribute("width")) && /^\d/.test(svg.getAttribute("height") || "") && !/%$/.test(svg.getAttribute("height"));
    if (!hasSize) {
      const [w, h] = vb.length === 4 && vb[2] > 0 && vb[3] > 0 ? [vb[2], vb[3]] : [500, 500];
      const k = 1000 / Math.max(w, h);
      svg.setAttribute("width", Math.round(w * k)); svg.setAttribute("height", Math.round(h * k));
    }
    return new XMLSerializer().serializeToString(svg);
  }
  /* Fond blanc : on efface le blanc relié aux bords de l'image, les blancs intérieurs du logo restent */
  function keyWhite(img) {
    const k = Math.min(1, 1200 / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * k)), h = Math.max(1, Math.round(img.naturalHeight * k));
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    const ctx = cv.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    let data;
    try { data = ctx.getImageData(0, 0, w, h); } catch (e) { return null; }
    const px = data.data, white = i => px[i + 3] > 250 && Math.min(px[i], px[i + 1], px[i + 2]) > 236;
    const corners = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]];
    if (!corners.every(([x, y]) => white((y * w + x) * 4))) return null;
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
  async function setFile(file) {
    S.urls.forEach(u => URL.revokeObjectURL(u)); S.urls = [];
    Object.assign(S, { file: file || null, img: null, keyedImg: null, keyed: false, canKey: false, msg: "" });
    if (file) {
      const name = (file.name || "").toLowerCase(), type = file.type || "";
      const isSvg = type === "image/svg+xml" || name.endsWith(".svg");
      const raster = /^image\/(png|jpe?g|webp|gif)$/.test(type) || /\.(png|jpe?g|webp|gif)$/.test(name);
      if (!isSvg && !raster) S.msg = "Aperçu indisponible pour ce format : le fichier sera joint tel quel à la demande.";
      else {
        try {
          const url = URL.createObjectURL(isSvg ? new Blob([sizeSvg(await file.text())], { type: "image/svg+xml" }) : file);
          S.urls.push(url);
          S.img = await loadImg(url);
          if (!S.img.naturalWidth) throw new Error("vide");
          if (raster) {
            const keyedUrl = keyWhite(S.img);
            if (keyedUrl) { S.keyedImg = await loadImg(keyedUrl); S.canKey = true; S.keyed = true; }
          }
          S.msg = S.keyed ? "Fond blanc du logo rendu transparent. Décochez la case plus bas pour le garder." : "";
        } catch (e) {
          S.img = null;
          S.msg = "Ce fichier ne peut pas être affiché en aperçu : il sera joint tel quel à la demande.";
        }
      }
    }
    render();
  }

  /* ---------- Export de l'aperçu envoyé avec la demande ---------- */
  async function exporter() {
    const cur = current(), place = cur && placement(cur), img = logoImg();
    if (!place) return null;
    const [W, H] = cur.tpl.vb, k = Math.min(900 / W, 1200 / H);
    const cw = Math.round(W * k), ch = Math.round(H * k);
    const cv = document.createElement("canvas"); cv.width = cw; cv.height = ch;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = tok("--paper"); ctx.fillRect(0, 0, cw, ch);
    const draw = async inner => {
      const url = URL.createObjectURL(new Blob([svgDoc(cur, inner, cw, ch)], { type: "image/svg+xml" }));
      try { ctx.drawImage(await loadImg(url), 0, 0, cw, ch); } finally { URL.revokeObjectURL(url); }
    };
    const uid = "x";
    await draw(defs(uid, cur) + layerUnder(uid, cur));
    ctx.save();
    ctx.scale(k, k);
    const clip = new Path2D();
    cur.view.shapes.forEach(([d, dx = 0, dy = 0]) => clip.addPath(new Path2D(d), new DOMMatrix().translate(dx, dy)));
    ctx.clip(clip);
    ctx.beginPath(); ctx.rect(cur.zone.x, cur.zone.y, cur.zone.w, cur.zone.h); ctx.clip();
    ctx.drawImage(img, place.x, place.y, place.w, place.h);
    ctx.restore();
    await draw(defs(uid, cur) + layerOver(uid, cur));
    return new Promise(res => cv.toBlob(res, "image/jpeg", .88));
  }
  function describe() {
    const cur = current(); if (!cur) return "";
    const base = `${optionName(cur)}, couleur ${colorName()}`;
    const place = placement(cur);
    if (!place) return `${base}, sans logo positionné`;
    return `${base}, vue ${VIEW_LABEL[S.view].toLowerCase()}, emplacement ${cur.zone.label.toLowerCase()}, logo à ${Math.round(place.pl.s * 100)} % de la largeur de la zone${S.keyed ? ", fond blanc du logo retiré" : ""}. Aperçu indicatif, à valider sur le BAT.`;
  }

  const api = {
    init(products) { products.forEach(p => { S.products[p.id] = p; }); },
    mount,
    render,
    setProduct(pid, short) {
      if (S.pid !== pid) { S.view = "face"; S.zone = null; S.zoneBy = {}; }
      S.pid = pid;
      if (typeof short === "boolean") S.short = short;
      render();
    },
    setFile,
    clear() { setFile(null); },
    hasProduct: pid => !!(S.products[pid] && S.products[pid].viz),
    hasLogo: () => !!logoImg(),
    get state() { return { pid: S.pid, short: S.short, file: S.file }; },
    describe,
    exporter,
    onchange: null
  };
  window.IFSViz = api;
})();
