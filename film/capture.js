// Captures d'écran réelles du Studio (site servi en local sur le port 8765).
const { chromium } = require('playwright');
const out = process.argv[2] || 'build';

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, colorScheme: 'light' });
  await p.goto('http://localhost:8765/personnaliser.html', { waitUntil: 'networkidle' });
  const refuser = p.getByRole('button', { name: 'Refuser' });
  if (await refuser.isVisible()) await refuser.click();
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/studio-1-uni.png` });
  await p.locator('label.st-motif', { hasText: 'Éclats' }).click();
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/studio-2-eclats.png` });
  await p.locator('input[aria-label="Magenta"]').first().check({ force: true });
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/studio-3-magenta.png` });
  await p.locator('button.st-thumb', { hasText: 'Dos' }).click();
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/studio-4-dos.png` });
  await b.close();
})();
