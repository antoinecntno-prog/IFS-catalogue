// Rend scene.html image par image (24 i/s, 1920 × 1080) puis encode en MP4 avec ffmpeg.
// Usage : node render.js <durée en s> [sortie.mp4] [début en s]
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');

const duree = parseFloat(process.argv[2] || '7.6');
const sortie = process.argv[3] || 'build/test.mp4';
const debut = parseFloat(process.argv[4] || '0');
const FPS = 24;

(async () => {
  fs.rmSync('build/frames', { recursive: true, force: true });
  fs.mkdirSync('build/frames', { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('http://localhost:8766/scene.html', { waitUntil: 'networkidle' });
  await p.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(i => i.decode()));
  });
  const n = Math.round(duree * FPS);
  for (let f = 0; f < n; f++) {
    await p.evaluate(t => window.render(t), debut + f / FPS);
    await p.screenshot({ path: `build/frames/${String(f).padStart(5, '0')}.png` });
  }
  await b.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', 'build/frames/%05d.png',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', sortie]);
  console.log(`${n} images, ${sortie}`);
})();
