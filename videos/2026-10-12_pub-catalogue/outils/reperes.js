// Échantillonne les repères de mouvement de la composition (feutre, ballon, caméra) pour le sound design et les contrôles.
// Usage : NODE_PATH=$(npm root -g) node outils/reperes.js <dossier> <sortie.json> [pas_en_s]
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const [root, sortie, pasArg] = process.argv.slice(2);
const pas = Number(pasArg || 1 / 120);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json', '.wav': 'audio/wav' };
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
  await p.waitForFunction(() => !!window.__reperes, null, { timeout: 30000 });
  const data = await p.evaluate((pas) => {
    const R = window.__reperes, out = { pas, duree: R.DUREE, temps: R.TEMPS, t: [], feutre: [], ballon: [], cam: [] };
    for (let t = 0; t < R.DUREE - 1e-9; t += pas) {
      out.t.push(+t.toFixed(5));
      const f = R.feutre(t);
      out.feutre.push([f.p.x, f.p.y, f.lift || 0, f.vis === false ? 0 : 1]);
      const bl = R.ballon(t);
      out.ballon.push([bl.centre.x, bl.centre.y, bl.k, bl.h, bl.s.type]);
      const c = R.cam(t);
      out.cam.push([c.s, c.x, c.y]);
    }
    out.contacts = R.contacts;
    out.produits = R.produits;
    out.traces = R.traces;
    out.BEATS = R.BEATS;
    return out;
  }, pas);
  fs.writeFileSync(sortie, JSON.stringify(data));
  console.log(sortie, data.t.length, 'échantillons,', data.contacts.length, 'contacts');
  await b.close(); srv.close();
});
