/* Rendu image par image du showreel : Chromium (Playwright) positionne la timeline à chaque
   instant, capture la scène, et ffmpeg assemble la vidéo. Aucun enregistrement en temps réel.
   node rendu.mjs               rendu final : 60 i/s, flou de mouvement à 4 échantillons
   node rendu.mjs --brouillon   30 i/s, sans flou
   node rendu.mjs --stills 1.2,5.5   images fixes dans tmp/
   node rendu.mjs --de 10 --a 12     plage partielle */
import { chromium } from "playwright";
import ffmpeg from "ffmpeg-static";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile, mkdir, stat } from "node:fs/promises";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE = join(ICI, "..");
const arg = n => { const i = process.argv.indexOf(n); return i < 0 ? null : (process.argv[i + 1] ?? true); };
const brouillon = process.argv.includes("--brouillon");
const FPS = +(arg("--fps") || (brouillon ? 30 : 60));
const ECH = +(arg("--flou") || (brouillon ? 1 : 4));
const sortie = arg("--sortie") || join(RACINE, brouillon ? "showreel/tmp/brouillon.mp4" : "2026-09-29_showreel-catalogue-ifs.mp4");

/* Petit serveur statique : la page charge ../site/fonts et ../site/img */
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".webp": "image/webp", ".svg": "image/svg+xml", ".png": "image/png" };
const serveur = createServer(async (req, res) => {
  try {
    const p = join(RACINE, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!p.startsWith(RACINE)) throw 0;
    res.writeHead(200, { "content-type": TYPES[extname(p)] || "application/octet-stream" });
    res.end(await readFile(p));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => serveur.listen(0, "127.0.0.1", r));
const url = `http://127.0.0.1:${serveur.address().port}/showreel/index.html`;

const navigateur = await chromium.launch({ args: ["--font-render-hinting=none", "--disable-lcd-text", "--force-color-profile=srgb"] });
const page = await navigateur.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on("pageerror", e => { console.error("Erreur de page :", e.message); process.exit(1); });
page.on("console", m => { if (m.type() === "error") console.error("console :", m.text()); });
await page.goto(url);
await page.waitForFunction(() => window.__pret === true, null, { timeout: 60000 });
const DUREE = await page.evaluate(() => window.__duree);
/* Capture par le protocole Chromium : la scène occupe exactement la fenêtre de 1920 × 1080 */
const cdp = await page.context().newCDPSession(page);
const capture = async t => {
  await page.evaluate(x => window.__seek(x), t);
  const { data } = await cdp.send("Page.captureScreenshot", { format: "png", optimizeForSpeed: true });
  return Buffer.from(data, "base64");
};

const stills = arg("--stills");
if (stills) {
  await mkdir(join(ICI, "tmp"), { recursive: true });
  const { writeFile } = await import("node:fs/promises");
  for (const t of String(stills).split(",").map(Number)) {
    const f = join(ICI, "tmp", `still-${t.toFixed(2)}.png`);
    await writeFile(f, await capture(t));
    console.log(f);
  }
} else {
  const de = +(arg("--de") || 0), a = +(arg("--a") || DUREE);
  const n = Math.round((a - de) * FPS);
  await mkdir(dirname(sortie), { recursive: true });
  const son = join(ICI, "tmp", "son.wav");
  const avecSon = de === 0 && a === DUREE && await stat(son).then(() => true, () => false);
  /* Flou de mouvement : ECH captures réparties sur une demi-image (obturateur 180°), moyennées par tmix */
  const vf = (ECH > 1 ? `tmix=frames=${ECH},select='eq(mod(n\\,${ECH})\\,${ECH - 1})',setpts=N/${FPS}/TB,` : "") + "noise=alls=2:allf=t,format=yuv420p";
  const cmd = ["-y", "-hide_banner", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS * ECH), "-c:v", "png", "-i", "-",
    ...(avecSon ? ["-i", son] : []),
    "-vf", vf, "-r", String(FPS), "-c:v", "libx264", "-preset", brouillon ? "veryfast" : "slow", "-crf", brouillon ? "22" : "16", "-tune", "animation",
    "-profile:v", "high", "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
    ...(avecSon ? ["-c:a", "aac", "-b:a", "192k", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,apad", "-shortest"] : []),
    "-movflags", "+faststart", sortie];
  const ff = spawn(ffmpeg, cmd, { stdio: ["pipe", "inherit", "inherit"] });
  const fini = new Promise((ok, ko) => ff.on("close", c => c === 0 ? ok() : ko(new Error("ffmpeg " + c))));
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < ECH; k++) {
      const t = de + (i + (ECH > 1 ? k / (2 * ECH) : 0)) / FPS;
      const png = await capture(t);
      if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once("drain", r));
    }
    if (i % Math.round(FPS) === 0) process.stdout.write(`\r${i}/${n} images, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  ff.stdin.end();
  await fini;
  console.log(`\n${sortie}`);
}
await navigateur.close();
serveur.close();
