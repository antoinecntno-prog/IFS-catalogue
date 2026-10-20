// Generates compositions/s01-mur.html (static markup for the product wall) from site/donnees.js.
// Usage : node outils/mur.js   (écrit compositions/s01-mur.html)
const fs = require("fs");
const path = require("path");
const ROOT = "/home/user/IFS-catalogue";
const PROJ = ROOT + "/video/2026-10-20_promo-contino-sport-9x16";
const src = fs.readFileSync(ROOT + "/site/donnees.js", "utf8");
const DATA = new Function(src + ";return DATA;")();
const imgs = fs.readdirSync(PROJ + "/assets/img").map((f) => f.replace(".webp", ""));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const price = (n) => n.toFixed(2).replace(".", ",");
const unitOf = (p) => p.tables[0].unit.replace("€ HT / ", "").split(" (")[0];
const metaOf = (p) => p.sub || (p.specs[0] ? p.specs[0][1] : "");
const minOf = (p) => { const m = p.entry.txt.match(/dès (.+)$/); return m ? "Dès " + m[1] : ""; };

// Photos excluded by the brief: basketball jerseys and bob (none shipped anyway).
const EXCL = new Set(["basket-double", "basket-simple", "bob"]);
const prods = DATA.products.filter((p) => !EXCL.has(p.id) && imgs.includes(p.id) && p.tables[0].q === "pcs");

// Seeded PRNG (mulberry32) for a deterministic, varied order per column
function rng(seed) { return function () { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function shuffled(arr, seed) { const a = arr.slice(); const r = rng(seed); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

const COLS = 6, PER = 9;
const COLW = 386, GAP = 32, CARDH = 800, PITCH = CARDH + GAP;
const WALLW = COLS * COLW + (COLS - 1) * GAP;
const TOPS = [-120, -540, -300, -700, -60, -420];
// Hero products sit in the central columns near the start window
const HERO = ["set-football", "maillot-cyclisme", "running-ml", "echarpe", "hoodie", "chasuble"];

let used = new Set();
const cols = [];
for (let c = 0; c < COLS; c++) {
  const order = shuffled(prods, 7 + c * 131);
  const list = [];
  for (let k = 0; k < PER; k++) list.push(order[k % order.length]);
  cols.push(list);
}
// Avoid the same product side by side on the same row
for (let c = 1; c < COLS; c++) {
  for (let k = 0; k < PER; k++) {
    const rowL = Math.round((TOPS[c - 1] + k * PITCH) / PITCH);
    for (let kk = 0; kk < PER; kk++) {
      const rowR = Math.round((TOPS[c] + kk * PITCH) / PITCH);
      if (rowL === rowR && cols[c - 1][k].id === cols[c][kk].id && kk + 1 < PER) {
        const t = cols[c][kk]; cols[c][kk] = cols[c][kk + 1]; cols[c][kk + 1] = t;
      }
    }
  }
}

const seen = new Map();
function card(p, id) {
  const n = (seen.get(p.id) || 0) + 1; seen.set(p.id, n);
  const frag = n > 1 ? "#" + n : "";   // same file, distinct node (repeat on the wall)
  return `<div class="s01-card" id="${id}"><div class="s01-z"><div class="ui-card"><div class="ph"><img src="assets/img/${p.id}.webp${frag}" alt="" /></div><b>${esc(p.name)}</b><div class="sub">${esc(metaOf(p))}</div><div class="pr"><strong>${price(p.entry.price)}&nbsp;€</strong> HT / ${esc(unitOf(p))}</div><div class="pr s01-min">${esc(minOf(p))}</div></div></div></div>`;
}

let colsHtml = "";
for (let c = 0; c < COLS; c++) {
  const x = c * (COLW + GAP);
  colsHtml += `\n          <div class="s01-col" id="s01-col-${c}" style="left:${x}px;top:${TOPS[c]}px"><div class="s01-colin" id="s01-colin-${c}">` +
    cols[c].map((p, k) => card(p, `s01-c${c}-${k}`)).join("") + `</div></div>`;
}

const html = `<!doctype html>
<html lang="fr">
  <head><meta charset="UTF-8" /></head>
  <body>
    <template>
      <link rel="stylesheet" href="assets/kit.css" />
      <style>
        #root { position: absolute; inset: 0; overflow: hidden; background: #1A1320; }
        #s01-frame { position: absolute; inset: 0; transform-origin: 50% 46%; }
        #s01-cam { position: absolute; inset: 0; perspective: 2000px; perspective-origin: 50% 40%; }
        #s01-wall { position: absolute; left: 50%; top: -1500px; width: ${WALLW}px; height: 3500px; margin-left: -${WALLW / 2}px;
          transform-origin: 50% 2460px; overflow: hidden; }
        .s01-col { position: absolute; width: ${COLW}px; }
        .s01-colin { position: relative; width: ${COLW}px; }
        .s01-card { position: relative; width: ${COLW}px; height: ${CARDH}px; margin-bottom: ${GAP}px; background: #FFFFFF; border-radius: 22px; overflow: hidden;
          box-shadow: 0 18px 40px rgba(0,0,0,.35); }
        .s01-z { zoom: 2; width: ${COLW / 2}px; padding: 10px 10px 0; font: 400 16px/1.5 var(--body); color: var(--ink); }
        #s01-wall .ui-card b { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 38.4px; }
        #s01-wall .ui-card .sub { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 32.5px; }
        #s01-wall .ui-card .pr strong { margin-right: 2px; }
        #s01-wall .s01-min { margin-top: 3px; }
        #s01-vig { position: absolute; left: -120px; right: -120px; top: -120px; bottom: -120px; pointer-events: none;
          background: linear-gradient(180deg, rgba(26,19,32,.92) 5%, rgba(26,19,32,.55) 16%, rgba(26,19,32,0) 32%, rgba(26,19,32,0) 76%, rgba(26,19,32,.55) 95%); }
        #s01-dim { position: absolute; left: -120px; right: -120px; top: -120px; bottom: -120px; background: #1A1320; opacity: 0; pointer-events: none; }
        #s01-bandrot { position: absolute; left: -500px; top: 500px; width: 2080px; height: 740px; transform: rotate(-9deg); transform-origin: 50% 50%; }
        #s01-band { position: absolute; inset: 0; }
        #s01-bandbg { position: absolute; inset: 0; background: var(--magenta); box-shadow: 0 30px 80px rgba(0,0,0,.45); }
        #s01-bandline { position: absolute; left: 0; right: 0; bottom: -26px; height: 18px; background: var(--yellow); }
        #s01-txt { position: absolute; inset: 0; z-index: 2; display: flex; align-items: center; justify-content: center; }
        #s01-lines { display: block; }
        #s01-lines .mask { padding-top: 6px; margin-top: -6px; }
        #s01-lines .big { font-size: 130px; line-height: .9; white-space: nowrap; }
        #s01-lines .w { color: #FFFFFF; }
        #s01-lines .y { color: var(--yellow); }
        .s01-deco { position: absolute; }
        .deco.tri.s01-w { border-bottom-color: #FFFFFF; }
        .deco.ring.s01-w { border-color: #FFFFFF; }
        .deco.dot.s01-w { background: #FFFFFF; }
        .deco.plus.s01-w::before, .deco.plus.s01-w::after { background: #FFFFFF; }
      </style>
      <div id="root" data-composition-id="s01" data-width="1080" data-height="1920">
        <div id="s01-frame">
          <div id="s01-cam">
            <div id="s01-wall" data-layout-allow-overflow data-layout-ignore>${colsHtml}
            </div>
          </div>
          <div id="s01-vig" data-layout-allow-overflow></div>
          <div id="s01-dim" data-layout-allow-overflow></div>
          <div class="deco tri s01-deco" id="s01-d1" style="left:120px;top:420px" data-layout-allow-overflow data-layout-ignore></div>
          <div class="deco ring s01-w s01-deco" id="s01-d2" style="left:880px;top:300px" data-layout-allow-overflow data-layout-ignore></div>
          <div class="deco plus s01-deco" id="s01-d3" style="left:560px;top:250px" data-layout-allow-overflow data-layout-ignore></div>
          <div class="deco dot s01-w s01-deco" id="s01-d4" style="left:170px;top:1430px" data-layout-allow-overflow data-layout-ignore></div>
          <div class="deco bar s01-deco" id="s01-d5" style="left:840px;top:1330px" data-layout-allow-overflow data-layout-ignore></div>
          <div class="deco tri s01-w s01-deco" id="s01-d6" style="left:520px;top:1470px" data-layout-allow-overflow data-layout-ignore></div>
          <div id="s01-bandrot" data-layout-allow-overflow>
            <div id="s01-band">
              <div id="s01-bandbg"></div>
              <div id="s01-bandline"></div>
              <div id="s01-txt">
                <div id="s01-lines">
                  <div class="mask"><span class="big w" id="s01-w1">VOUS</span></div>
                  <div class="mask"><span class="big w" id="s01-w2">L'IMAGINEZ.</span></div>
                  <div class="mask"><span class="big y" id="s01-w3">NOUS</span></div>
                  <div class="mask"><span class="big y" id="s01-w4" data-layout-allow-occlusion>L'IMPRIMONS.</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <script>
        (function () {
          const tl = gsap.timeline({ paused: true });
          const B = 60 / 105, E = B / 2, BAR = 4 * B;
          const STOP = 4.43;          // musique : silence de 4,43 à 4,571
          const N = ${COLS};

          // Mur : caméra couchée qui se redresse lentement le long de l'axe long
          tl.fromTo("#s01-wall",
            { rotationX: 48, rotationZ: -24, x: -30, y: 120, z: -260 },
            { rotationX: 40, rotationZ: -17, x: 20, y: -60, z: 0, duration: 4.143, ease: "power1.out" }, 0);

          // Colonnes en sens contraires, de plus en plus vite (dérive constante + accélération)
          // (dérive linéaire assez forte pour que les sens contraires se lisent dès la première image)
          for (let c = 0; c < N; c++) {
            const up = c % 2 === 0;
            tl.fromTo("#s01-col-" + c, { y: up ? 0 : -820 }, { y: up ? -820 : 0, duration: STOP, ease: "none" }, 0);
            tl.fromTo("#s01-colin-" + c, { y: up ? 0 : -1900 }, { y: up ? -1900 : 0, duration: STOP, ease: "power3.in" }, 0);
          }

          // Punch-ins secs sur les temps 1, 2, 3 et 4 (le dernier avec l'arrivée de la bande) : la caméra monte en escalier
          const steps = [1.035, 1.07, 1.11, 1.15];
          tl.fromTo("#s01-cam", { scale: 1 }, { scale: steps[0], duration: 0.1, ease: "power4.out" }, B);
          for (let k = 1; k < steps.length; k++) {
            tl.to("#s01-cam", { scale: steps[k], duration: 0.1, ease: "power4.out" }, B * (k + 1));
          }

          // Bande d'encre magenta qui traverse en diagonale et arrive sur le temps 2,286
          // (accélération jusqu'au temps : la bande balaie le cadre sur les trois images d'avant et claque avec le punch-in
          // et le coup sourd de 2,286 ; en décélération elle couvrait l'écran dès 2,1, six images trop tôt)
          tl.fromTo("#s01-dim", { opacity: 0 }, { opacity: 0.42, duration: 0.4, ease: "power2.out" }, BAR - 0.286);
          tl.fromTo("#s01-band", { x: -2500 }, { x: -25, duration: 0.286, ease: "power2.in" }, BAR - 0.286);
          tl.to("#s01-band", { x: 25, duration: STOP - BAR, ease: "none" }, BAR);

          // Mots qui claquent sur les croches
          const words = ["#s01-w1", "#s01-w2", "#s01-w3", "#s01-w4"];
          words.forEach((w, i) => {
            const t = BAR + E * (i + 1);
            tl.fromTo(w, { yPercent: 105 }, { yPercent: 0, duration: 0.2, ease: "power4.out" }, t);
          });
          tl.fromTo("#s01-txt", { scale: 1.04 }, { scale: 1, duration: 0.2, ease: "power4.out" }, BAR + E);
          for (let i = 2; i <= 4; i++) {
            tl.to("#s01-txt", { keyframes: [{ scale: 1.04, duration: 0.03, ease: "none" }, { scale: 1, duration: 0.17, ease: "power4.out" }] }, BAR + E * i);
          }
          // Deux secousses plus légères sur les accords de l'intro (3,714 et 4,0, croches 5 et 6 après la bande) :
          // la phrase garde le pouls jusqu'au recul, sans secousse muette pendant le recul
          [BAR + E * 5, BAR + E * 6].forEach((t) => {
            tl.to("#s01-txt", { keyframes: [{ scale: 1.03, duration: 0.03, ease: "none" }, { scale: 1, duration: 0.11, ease: "power4.out" }] }, t);
          });

          // Éclat de formes depuis la bande, sur le temps
          const cx = 540, cy = 870;
          // [id, x, y, échelle, rotation, symétrique] : les anneaux et points dérivent, les autres tournent sur place
          const decos = [
            ["#s01-d1", 120, 420, 1.6, -40, false],
            ["#s01-d2", 880, 300, 1.5, 0, true],
            ["#s01-d3", 560, 250, 1.4, -30, false],
            ["#s01-d4", 170, 1430, 1.6, 0, true],
            ["#s01-d5", 840, 1330, 1.5, 20, false],
            ["#s01-d6", 520, 1470, 1.3, 30, false],
          ];
          decos.forEach(([id, x, y, s, r0, sym], i) => {
            const t0 = BAR + 0.02 * i, d = STOP - t0 - 0.55;
            if (sym) {
              tl.fromTo(id, { x: cx - x, y: cy - y, scale: 0 }, { x: 0, y: 0, scale: s, duration: 0.55, ease: "power3.out" }, t0);
              tl.to(id, { x: (x < cx ? -26 : 26), y: (y < cy ? -30 : 30), duration: d, ease: "none" }, t0 + 0.55);
            } else {
              tl.fromTo(id, { x: cx - x, y: cy - y, scale: 0, rotation: r0 - 90 }, { x: 0, y: 0, scale: s, rotation: r0, duration: 0.55, ease: "power3.out" }, t0);
              tl.to(id, { rotation: r0 + (i % 2 ? 45 : -45), duration: d, ease: "none" }, t0 + 0.55);
            }
          });

          // Recul à 0,97 juste avant le silence de 4,43, puis tout se fige jusqu'au départ
          tl.fromTo("#s01-frame", { scale: 1 }, { scale: 0.97, duration: 0.287, ease: "power3.out" }, STOP - 0.287);

          window.__timelines["s01"] = tl;
        })();
      </script>
    </template>
  </body>
</html>
`;
const out = process.argv[2] || PROJ + "/compositions/s01-mur.html";
fs.writeFileSync(out, html);
console.log("wrote", out, html.length, "bytes;", prods.length, "products");
