#!/usr/bin/env node
// Rendu « Prêts pour samedi » : HTML autonome, capture image par image, MP4 avec la voix, planche contact, contrôles.
//
//   node 2026-10-15_capture.mjs            tout, dans l'ordre
//   node 2026-10-15_capture.mjs --html     construit seulement le HTML
//
// Entrées : source/scene.html, timings.json, voix-off.mp3, polices npm (@fontsource).
// Sorties : 2026-10-15_contino-sport_prets-pour-samedi.html / .mp4, 2026-10-15_contino-sport_planche-contact.png.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const NOM = '2026-10-15_contino-sport_prets-pour-samedi';
const F_HTML = path.join(ICI, `${NOM}.html`);
const F_MP4 = path.join(ICI, `${NOM}.mp4`);
const F_PLANCHE = path.join(ICI, '2026-10-15_contino-sport_planche-contact.png');
const F_VOIX = path.join(ICI, 'voix-off.mp3');
const F_TIMINGS = path.join(ICI, 'timings.json');
const F_SOURCE = path.join(ICI, 'source', 'scene.html');

const FPS = 30, DUREE = 30, IMAGES = FPS * DUREE;
const DELAI_MS = 400;
const LOUDNORM = 'loudnorm=I=-14:TP=-1:LRA=11';
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'prets-pour-samedi-'));

const POLICES = [
  ['Archivo', 900, '@fontsource/archivo/files/archivo-latin-900-normal.woff2'],
  ['IBM Plex Sans', 400, '@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2'],
  ['IBM Plex Sans', 600, '@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2'],
];

const virgule = (x, n = 2) => x.toFixed(n).replace('.', ',');

function ffmpeg(args, { entree } = {}) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostdin', ...args], { encoding: 'utf8', input: entree, maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error(`ffmpeg a échoué :\n${r.stderr.slice(-2000)}`);
  return r.stderr;
}
const jsonLoudnorm = (log) => JSON.parse(log.slice(log.lastIndexOf('{'), log.lastIndexOf('}') + 1));

// ---------- Voix : décalage de 0,4 s, normalisation en deux passes, durée 30 s ----------
function chaineAudio() {
  // Voix mono recopiée sur deux canaux avant la mesure : la normalisation porte sur le fichier stéréo final.
  const avant = `pan=stereo|c0=c0|c1=c0,adelay=${DELAI_MS}:all=1,apad=whole_dur=${DUREE}`;
  const mesure = jsonLoudnorm(ffmpeg(['-i', F_VOIX, '-af', `${avant},${LOUDNORM}:print_format=json`, '-f', 'null', '-']));
  const filtre = `${avant},${LOUDNORM}:measured_I=${mesure.input_i}:measured_TP=${mesure.input_tp}:measured_LRA=${mesure.input_lra}:measured_thresh=${mesure.input_thresh}:offset=${mesure.target_offset}:linear=true:print_format=json,aresample=48000`;
  return { mesure, filtre };
}

// ---------- HTML autonome ----------
function construireHtml(filtre) {
  const css = POLICES.map(([famille, graisse, fichier]) => {
    const b64 = fs.readFileSync(require.resolve(fichier)).toString('base64');
    return `@font-face{font-family:"${famille}";font-style:normal;font-weight:${graisse};font-display:block;src:url(data:font/woff2;base64,${b64}) format("woff2")}`;
  }).join('\n');
  const timings = JSON.parse(fs.readFileSync(F_TIMINGS, 'utf8'));

  // Piste de 30 s déjà décalée et normalisée : le currentTime de l'audio est directement le temps de la vidéo.
  const mp3 = path.join(TMP, 'voix-30s.mp3');
  ffmpeg(['-y', '-i', F_VOIX, '-af', filtre, '-t', String(DUREE), '-c:a', 'libmp3lame', '-b:a', '160k', mp3]);
  const audio = 'data:audio/mpeg;base64,' + fs.readFileSync(mp3).toString('base64');

  let html = fs.readFileSync(F_SOURCE, 'utf8');
  const remplacer = (motif, valeur) => {
    if (!html.includes(motif)) throw new Error(`Marqueur absent du gabarit : ${motif}`);
    html = html.replace(motif, () => valeur);
  };
  remplacer('/*__POLICES__*/', css);
  remplacer('/*__TIMINGS__*/null/*__FIN_TIMINGS__*/', JSON.stringify(timings));
  remplacer("'__AUDIO__'", JSON.stringify(audio));
  fs.writeFileSync(F_HTML, html);
  console.log(`HTML : ${path.basename(F_HTML)} (${(html.length / 1e6).toFixed(2)} Mo)`);
  return timings;
}

// ---------- Navigateur ----------
async function navigateur() {
  const { chromium } = require('playwright');
  try {
    return await chromium.launch();
  } catch (e) {
    const candidats = [
      process.env.CHROMIUM_PATH,
      ...(fs.existsSync('/opt/pw-browsers') ? fs.readdirSync('/opt/pw-browsers').filter((d) => /^chromium-\d+$/.test(d)).map((d) => `/opt/pw-browsers/${d}/chrome-linux/chrome`) : []),
      '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    ].filter((p) => p && fs.existsSync(p));
    for (const executablePath of candidats) {
      try { console.log(`Chromium trouvé : ${executablePath}`); return await chromium.launch({ executablePath }); } catch {}
    }
    throw new Error('Aucun Chromium utilisable. Lancer : npx playwright install chromium');
  }
}

async function ouvrir(browser, erreurs) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
  page.on('pageerror', (e) => erreurs.push(String(e)));
  await page.goto(pathToFileURL(F_HTML).href + '?capture=1');
  await page.waitForFunction(() => window.__pret === true);
  await page.evaluate(() => document.fonts.ready);
  return page;
}
const image = (page, t) => page.evaluate((x) => window.renderAt(x), t).then(() =>
  page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1080 } }));

// ---------- Capture et assemblage ----------
async function capturer(page, filtre) {
  const ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-i', F_VOIX,
    '-map', '0:v', '-map', '1:a',
    '-af', filtre,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2',
    '-movflags', '+faststart', '-t', String(DUREE), F_MP4], { stdio: ['pipe', 'inherit', 'inherit'] });
  const fini = new Promise((ok, ko) => ff.on('close', (c) => (c === 0 ? ok() : ko(new Error(`ffmpeg ${c}`)))));

  const empreintes = [];
  const debut = Date.now();
  for (let i = 0; i < IMAGES; i++) {
    const png = await image(page, i / FPS);
    empreintes.push(crypto.createHash('sha1').update(png).digest('hex'));
    if (!ff.stdin.write(png)) await new Promise((ok) => ff.stdin.once('drain', ok));
    if (i % 150 === 149) console.log(`  ${i + 1} / ${IMAGES} images (${((Date.now() - debut) / 1000).toFixed(0)} s)`);
  }
  ff.stdin.end();
  await fini;

  let derniere = IMAGES - 1;
  while (derniere > 0 && empreintes[derniere - 1] === empreintes[IMAGES - 1]) derniere--;
  return derniere / FPS; // instant à partir duquel l'image ne bouge plus
}

// ---------- Planche contact ----------
function instantsPlanche(T) {
  const a = Object.fromEntries(T.etapes.map((e) => [e.id, e.debut_s]));
  const d = Object.fromEntries(T.etapes.map((e) => [e.id, e.duree_s]));
  const prix = T.finale_prix.debut_s;
  const r = (x) => Math.round(x * FPS) / FPS;
  return [
    [0.5, 'INTRO', 'contours et titre'],
    [a.LOGO + 0.3 * d.LOGO, 'LOGO', 'enveloppe en vol'],
    [a.LOGO + 0.92 * d.LOGO, 'LOGO', 'logo reçu'],
    [a.COULEURS + 0.55 * d.COULEURS, 'COULEURS', 'versement'],
    [a.COULEURS + 0.97 * d.COULEURS, 'COULEURS', 'rempli'],
    [a.DESIGN + 0.42 * d.DESIGN, 'DESIGN', 'éclats'],
    [a.DESIGN + 0.97 * d.DESIGN, 'DESIGN', 'motif fini'],
    [a.BLASON + 0.9 * d.BLASON, 'BLASON', 'posé'],
    [a.SPONSOR + 0.9 * d.SPONSOR, 'SPONSOR', 'après le flash'],
    [a['NUMÉRO'] + 0.9 * d['NUMÉRO'], 'NUMÉRO', 'deux numéros'],
    [a.BAT + 0.52 * d.BAT, 'BAT', 'presse'],
    [a.BAT + 0.84 * d.BAT, 'BAT', 'avant « Et samedi »'],
    [a.FINALE + 0.4, 'FINALE', 'après « Et samedi »'],
    [prix + 1.9, 'FINALE', 'carte finale'],
    [29.9, 'FINALE', 'fin immobile'],
  ].map(([t, id, quoi]) => ({ t: r(t), id, quoi }));
}

async function planche(browser, page, T) {
  const vues = [];
  for (const v of instantsPlanche(T)) {
    const png = await image(page, v.t);
    vues.push({ ...v, src: 'data:image/png;base64,' + png.toString('base64') });
  }
  const css = POLICES.map(([famille, graisse, fichier]) =>
    `@font-face{font-family:"${famille}";font-weight:${graisse};src:url(data:font/woff2;base64,${fs.readFileSync(require.resolve(fichier)).toString('base64')}) format("woff2")}`).join('');
  const cases = vues.map((v) => `<figure><img src="${v.src}"><figcaption><b>${virgule(v.t)} s</b> · ${v.id} · ${v.quoi}</figcaption></figure>`).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}
    body{margin:0;background:#fff;font-family:"IBM Plex Sans";color:#141016}
    main{display:grid;grid-template-columns:repeat(5,360px);gap:24px 20px;padding:28px}
    h1{grid-column:1/-1;margin:0 0 4px;font:900 30px/1 "Archivo"}
    figure{margin:0}img{display:block;width:360px;height:360px;border:2px solid #141016;border-radius:8px}
    figcaption{margin-top:8px;font-size:16px;font-weight:400}figcaption b{font-weight:600}</style></head>
    <body><main><h1>PRÊTS POUR SAMEDI · planche contact</h1>${cases}</main></body></html>`;
  const p = await browser.newPage({ viewport: { width: 1940, height: 800 }, deviceScaleFactor: 1 });
  await p.setContent(html);
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: F_PLANCHE, fullPage: true });
  await p.close();
  console.log(`Planche : ${path.basename(F_PLANCHE)}`);
  return vues;
}

// ---------- Contrôles ----------
async function controlesPage(page, T) {
  return page.evaluate(async (T) => {
    const res = {};
    const r = (sel) => { const b = document.querySelector(sel).getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; };
    // Sous-titres : une ligne, dans la toile
    res.legendes = T.phrases.filter((p) => !p.masquee).map((p) => {
      window.renderAt(p.debut_s + 0.3);
      const b = r('#legende');
      return { texte: document.querySelector('#legende').textContent, exact: document.querySelector('#legende').textContent === p.texte, x: Math.round(b.x), w: Math.round(b.w), h: Math.round(b.h), dans_toile: b.x >= 0 && b.x + b.w <= 1080 };
    });
    // Fin : boîtes des éléments, aucun chevauchement
    window.renderAt(29.9);
    const lignePas = (() => { const els = [...document.querySelectorAll('#etapes .pas')]; const a = els[0].getBoundingClientRect(), z = els[els.length - 1].getBoundingClientRect(); return { x: a.left, y: a.top, w: z.right - a.left, h: a.height }; })();
    const m = r('#contourMaillot'), sh = r('#contourShort');
    const ensemble = { x: Math.min(m.x, sh.x), y: m.y, w: Math.max(m.x + m.w, sh.x + sh.w) - Math.min(m.x, sh.x), h: sh.y + sh.h - m.y };
    const boites = { carte: r('#carte'), slogan: r('#slogan'), badge: r('#badge'), stepper: lignePas, ensemble, titre: r('#titre') };
    const inter = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
    const noms = Object.keys(boites), chev = [];
    for (let i = 0; i < noms.length; i++) for (let j = i + 1; j < noms.length; j++) if (inter(boites[noms[i]], boites[noms[j]])) chev.push(`${noms[i]} / ${noms[j]}`);
    res.fin = { boites, chevauchements: chev, carte_texte: document.querySelector('.contenu[data-k="7"]').innerText.replace(/\s+/g, ' ') };
    // Titre et contours à 0,5 s
    window.renderAt(0.5);
    res.a05 = { titre_opacite: +getComputedStyle(document.querySelector('#titre')).opacity, contour_maillot: +document.querySelector('#contourMaillot').getAttribute('stroke-dashoffset'), contour_short: +document.querySelector('#contourShort').getAttribute('stroke-dashoffset') };
    // Bouteilles : jamais sur le titre ni sur le sous-titre, image par image pendant COULEURS et DESIGN
    const zones = ['#titre', '#sous2'].map((s) => { const b = r(s); return { x: b.x - 4, y: b.y - 4, w: b.w + 12, h: b.h + 12 }; });
    let pire = null, contacts = 0;
    const e2 = T.etapes.find((x) => x.id === 'COULEURS'), e4 = T.etapes.find((x) => x.id === 'BLASON');
    for (let t = e2.debut_s; t <= e4.debut_s; t += 1 / 30) {
      window.renderAt(t);
      for (const id of ['#bouteilleM', '#bouteilleJ']) {
        const el = document.querySelector(id);
        if (el.getAttribute('display') === 'none') continue;
        const b = el.getBoundingClientRect();
        const bb = { x: b.left, y: b.top, w: b.width, h: b.height };
        for (const z of zones) {
          if (inter(bb, z)) contacts++;
          const marge = bb.y - (z.y + z.h);
          if (bb.x < z.x + z.w && z.x < bb.x + bb.w && (pire === null || marge < pire.marge)) pire = { t: +t.toFixed(3), id, marge: Math.round(marge) };
        }
      }
    }
    res.bouteilles = { contacts_titre: contacts, marge_verticale_min_px: pire };
    // Cartes : numéro d'étape au milieu de chaque étape
    const ids = ['LOGO', 'COULEURS', 'DESIGN', 'BLASON', 'SPONSOR', 'NUMÉRO', 'BAT'];
    res.cartes = ids.map((id) => {
      const e = T.etapes.find((x) => x.id === id);
      window.renderAt(e.debut_s + 0.6 * e.duree_s);
      const c = [...document.querySelectorAll('.contenu')].find((x) => x.style.display === 'block');
      return { id, texte: c.innerText.replace(/\s+/g, ' ').trim(), compteur: document.querySelector('#compteur').textContent };
    });
    return res;
  }, T);
}

// Saturation et remplissage mesurés sur les pixels capturés
async function pixels(page, mesures) {
  return page.evaluate(async (mesures) => {
    const out = [];
    for (const m of mesures) {
      const img = new Image(); img.src = m.src; await img.decode();
      const c = document.createElement('canvas'); c.width = 1080; c.height = 1080;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      out.push({ nom: m.nom, points: m.points.map(([x, y]) => {
        const [R, G, B] = g.getImageData(x, y, 1, 1).data;
        const mx = Math.max(R, G, B), mn = Math.min(R, G, B);
        return { x, y, rvb: [R, G, B], saturation: mx ? +((mx - mn) / mx).toFixed(3) : 0 };
      }) });
    }
    return out;
  }, mesures);
}

function sonde(fichier) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,codec_name,width,height,r_frame_rate,bit_rate,sample_rate', '-of', 'json', fichier], { encoding: 'utf8' });
  return JSON.parse(r.stdout);
}

function rechercheCle() {
  const cle = process.env.ELEVENLABS_API_KEY;
  const fichiers = [];
  const parcourir = (d) => {
    for (const n of fs.readdirSync(d, { withFileTypes: true })) {
      if (n.name === 'node_modules' || n.name.startsWith('.')) continue;
      const p = path.join(d, n.name);
      if (n.isDirectory()) parcourir(p); else fichiers.push(p);
    }
  };
  parcourir(ICI);
  const motif = /sk_[0-9a-f]{40,}/;
  const touches = fichiers.filter((f) => { const s = fs.readFileSync(f, 'latin1'); return (cle && s.includes(cle)) || motif.test(s); });
  return { fichiers: fichiers.length, cle_dans_env: Boolean(cle), fichiers_suspects: touches.map((f) => path.relative(ICI, f)) };
}

// ---------- Programme ----------
const { mesure, filtre } = chaineAudio();
const T = construireHtml(filtre);
if (process.argv.includes('--html')) process.exit(0);

const browser = await navigateur();
const erreurs = [];
const page = await ouvrir(browser, erreurs);
console.log(`Capture de ${IMAGES} images…`);
const immobileDepuis = await capturer(page, filtre);
const vues = await planche(browser, page, T);
const cp = await controlesPage(page, T);
const t = (id) => vues.find((v) => v.quoi === id).t;
const px = await pixels(page, [
  { nom: `fin de COULEURS (${virgule(T.etapes.find((e) => e.id === 'COULEURS').debut_s + 0.97 * T.etapes.find((e) => e.id === 'COULEURS').duree_s)} s)`, src: vues.find((v) => v.quoi === 'rempli').src, points: [[250, 292], [420, 300], [246, 600], [424, 600], [214, 760], [456, 760], [300, 700], [380, 700]] },
  { nom: `avant « Et samedi » (${virgule(t('avant « Et samedi »'))} s)`, src: vues.find((v) => v.quoi === 'avant « Et samedi »').src, points: [[262, 480], [300, 700]] },
  { nom: `après « Et samedi » (${virgule(t('après « Et samedi »'))} s)`, src: vues.find((v) => v.quoi === 'après « Et samedi »').src, points: [[262, 480], [300, 700]] },
]);
await browser.close();

const sondeMp4 = sonde(F_MP4);
const fort = jsonLoudnorm(ffmpeg(['-i', F_MP4, '-af', `${LOUDNORM}:print_format=json`, '-f', 'null', '-']));
const ecarts = T.etapes.filter((e) => e.id !== 'INTRO').map((e) => ({ id: e.id, avance_s: +(e.mot_video_s - e.debut_s).toFixed(3) }));

const rapport = {
  mp4: sondeMp4,
  loudnorm_mp4_lufs: +fort.input_i, true_peak_dbtp: +fort.input_tp,
  loudnorm_passe1: { entree_lufs: +mesure.input_i },
  fin_voix_s: T.fin_voix_s,
  avance_des_etapes: ecarts,
  image_fixe_depuis_s: +immobileDepuis.toFixed(3),
  bouteilles: cp.bouteilles,
  a_0_5_s: cp.a05,
  cartes: cp.cartes,
  legendes: cp.legendes,
  fin: cp.fin,
  pixels: px,
  erreurs_console: erreurs,
  cle_api: rechercheCle(),
};
console.log(JSON.stringify(rapport, null, 2));
fs.rmSync(TMP, { recursive: true, force: true });
