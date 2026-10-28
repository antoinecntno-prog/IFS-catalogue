// Aperçu rapide : rend quelques instants de scene.html dans une planche contact.
// Usage : node apercu.js <sortie.png> <t1> <t2> ...
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
(async () => {
  const [sortie, ...ts] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('http://localhost:8766/scene.html', { waitUntil: 'networkidle' });
  await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode())); });
  const fichiers = [];
  for (const t of ts) {
    await p.evaluate(x => window.render(x), parseFloat(t));
    const f = `build/apercu-${t}.png`;
    await p.screenshot({ path: f });
    fichiers.push(f);
  }
  await b.close();
  execFileSync('python3', ['-I', '-c', `
import sys
from PIL import Image
fs = sys.argv[2:]
ims = [Image.open(f).resize((960, 540)) for f in fs]
cols = 2; rows = (len(ims) + 1) // 2
s = Image.new('RGB', (960 * cols, 540 * rows), (40, 40, 40))
for i, im in enumerate(ims): s.paste(im, ((i % cols) * 960, (i // cols) * 540))
s.save(sys.argv[1])`, sortie, ...fichiers]);
})();
