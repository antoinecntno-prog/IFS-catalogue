// Échantillonne les repères de mouvement d'une composition (feutre, ballon) pour le sound design.
// Usage : NODE_PATH=$(npm root -g) node outils/reperes.js <dossier> <sortie.json> [pas_en_s]
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const [root, sortie, pasArg] = process.argv.slice(2);
const pas = Number(pasArg || 1 / 120);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json' };
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  const f = path.join(root, u === '/' ? 'index.html' : u);
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); });
}).listen(0, async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', (e) => console.log('pageerror', e.message));
  await p.addInitScript(() => { window.__timelines = {}; });
  await p.goto(`http://127.0.0.1:${srv.address().port}/`);
  await p.waitForFunction(() => !!window.__reperes, null, { timeout: 20000 });
  const data = await p.evaluate((pas) => {
    const R = window.__reperes, out = { pas, duree: R.L.fin, t: [], feutreA: [], feutreB: [], ballon: [] };
    for (let t = 0; t <= R.L.fin + 1e-9; t += pas) {
      out.t.push(+t.toFixed(5));
      for (const k of ['feutreA', 'feutreB']) { const s = R[k](t); out[k].push([s.p.x, s.p.y, s.lift, s.vis === false ? 0 : 1]); }
      const bl = R.ballon(t), c = R.centreBallon(bl);
      out.ballon.push([c.x, c.y, bl.sigma, bl.k, bl.f || '', bl.h || 0]);
    }
    out.contacts = R.contacts.map((c) => ({ t: c.t, f: c.f, x: c.P.x, y: c.P.y }));
    out.accroche = R.accroche; out.L = R.L; out.ST_A = R.ST_A; out.H_A = R.H_A; out.PASS_B = R.PASS_B; out.COCHE = R.COCHE; out.ECRIT = R.ECRIT; out.nbLignes = R.nbLignes; out.finFlamme = R.finFlamme;
    return out;
  }, pas);
  fs.writeFileSync(sortie, JSON.stringify(data));
  console.log('repères', data.t.length, 'échantillons ->', sortie);
  await b.close(); srv.close();
});
