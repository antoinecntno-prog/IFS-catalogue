// Captures réelles du site pour les plans écran 13,1 à 18,2 s (site servi en local sur le port 8765).
const { chromium } = require('playwright');
const path = require('path');
const out = process.argv[2] || 'build';
const GLYPHE = path.resolve(__dirname, 'contino-m6/assets/c-sport-glyphe.png');
const TEXTE = '10 M, 12 L, 6 XL, noms et numéros au dos';

async function refuser(p) {
  const b = p.getByRole('button', { name: 'Refuser' });
  if (await b.isVisible().catch(() => false)) await b.click();
  await p.waitForTimeout(200);
}

(async () => {
  const b = await chromium.launch();
  const infos = {};

  // Studio, onglet Logos, avant et après le dépôt du logo, à l'échelle 2 pour les plans macro.
  const s = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2, colorScheme: 'light' });
  await s.goto('http://localhost:8765/personnaliser.html', { waitUntil: 'networkidle' });
  await refuser(s);
  await s.locator('label.st-motif', { hasText: 'Éclats' }).click();
  await s.locator('input[aria-label="Magenta"]').first().check({ force: true });
  await s.locator('#tb-logos').click();
  await s.waitForTimeout(300);
  await s.screenshot({ path: `${out}/studio-logos-vide.png` });
  await s.setInputFiles('#l-file', GLYPHE);
  await s.waitForTimeout(800);
  await s.screenshot({ path: `${out}/studio-logos-plein.png` });
  infos.studio = await s.evaluate(() => {
    const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [b.x, b.y, b.width, b.height]; };
    const prev = document.querySelector('#st-stage, .st-stage, .st-preview, svg');
    const imgs = [...document.querySelectorAll('img, image')].map(e => ({ tag: e.tagName, cls: e.getAttribute('class'), r: r(e) }));
    return { prev: prev && prev.id, imgs, panel: r(document.querySelector('#tab-logos')), liste: r(document.querySelector('#l-list')) };
  });
  // Macro sur la poitrine, à l'échelle 4 : logo sélectionné (poignées), puis désélectionné.
  const s4 = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 4, colorScheme: 'light' });
  await s4.goto('http://localhost:8765/personnaliser.html', { waitUntil: 'networkidle' });
  await refuser(s4);
  await s4.locator('label.st-motif', { hasText: 'Éclats' }).click();
  await s4.locator('input[aria-label="Magenta"]').first().check({ force: true });
  await s4.locator('#tb-logos').click();
  await s4.setInputFiles('#l-file', GLYPHE);
  await s4.waitForTimeout(800);
  const MACRO = { x: 600, y: 238, width: 430, height: 242 };
  await s4.screenshot({ path: `${out}/studio-macro-selection.png`, clip: MACRO });
  await s4.mouse.click(150, 600);
  await s4.waitForTimeout(300);
  await s4.screenshot({ path: `${out}/studio-macro.png`, clip: MACRO });

  // Formulaire de devis, étape 2, champ Précisions vide puis rempli (échelle 2 pour le recadrage serré).
  const d = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2, colorScheme: 'light' });
  await d.goto('http://localhost:8765/index.html', { waitUntil: 'networkidle' });
  await refuser(d);
  await d.locator('[data-quote]').first().click();
  await d.waitForTimeout(400);
  await d.locator('input[name="profil"][value="Club sportif"]').check({ force: true });
  await d.locator('#q-prod').selectOption({ index: 1 });
  await d.locator('input[name="quantite"][value="50 à 99"]').check({ force: true });
  await d.locator('#q-next').click();
  await d.waitForTimeout(400);
  const zone = d.locator('textarea[name="message"]');
  await zone.scrollIntoViewIfNeeded();
  await zone.focus();
  await d.waitForTimeout(200);
  await zone.type(TEXTE.slice(0, 17));
  await d.waitForTimeout(200);
  await d.screenshot({ path: `${out}/devis-debut.png` });
  await zone.type(TEXTE.slice(17));
  await d.waitForTimeout(200);
  await d.screenshot({ path: `${out}/devis-plein.png` });
  infos.devis = await d.evaluate((texte) => {
    const z = document.querySelector('textarea[name="message"]');
    const cs = getComputedStyle(z), b = z.getBoundingClientRect();
    const c = document.createElement('canvas').getContext('2d');
    c.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const x0 = b.x + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth);
    const y0 = b.y + parseFloat(cs.paddingTop) + parseFloat(cs.borderTopWidth);
    const xs = [...Array(texte.length + 1).keys()].map(k => +(x0 + c.measureText(texte.slice(0, k)).width).toFixed(1));
    return { zone: [b.x, b.y, b.width, b.height], y0, lh: cs.lineHeight, fs: cs.fontSize, ff: cs.fontFamily, xs };
  }, TEXTE);

  // Fiche produit du set football : ordinateur et téléphone.
  const f = await b.newPage({ viewport: { width: 1920, height: 1080 }, colorScheme: 'light' });
  await f.goto('http://localhost:8765/index.html', { waitUntil: 'networkidle' });
  await refuser(f);
  await f.locator('[data-open="set-football"]').first().click();
  await f.waitForTimeout(600);
  await f.screenshot({ path: `${out}/fiche-bureau.png` });
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, colorScheme: 'light', isMobile: true, hasTouch: true });
  await m.goto('http://localhost:8765/index.html', { waitUntil: 'networkidle' });
  await refuser(m);
  await m.locator('[data-open="set-football"]').first().click();
  await m.waitForTimeout(600);
  await m.screenshot({ path: `${out}/fiche-mobile.png` });
  infos.mobile = await m.evaluate(() => {
    const g = document.querySelector('#gal-track'); const b = g.getBoundingClientRect();
    return { galerie: [b.x, b.y, b.width, b.height], photos: [...g.querySelectorAll('img')].map(i => i.getAttribute('src')) };
  });
  console.log(JSON.stringify(infos, null, 1));
  await b.close();
})();
