/* Habillage sonore du showreel, synthétisé depuis cues.js : pulsation à 120 BPM, basse,
   nappe, et bruitages calés sur les repères de l'image. Écrit tmp/son.wav (48 kHz, stéréo, 16 bits). */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DUREE, BPM, SCENES, SONS } from "./cues.js";

const SR = 48000, N = Math.ceil((DUREE + 0.05) * SR);
const L = new Float32Array(N), R = new Float32Array(N);
const TAU = Math.PI * 2;
let graine = 11;
const alea = () => { graine = (graine * 1664525 + 1013904223) >>> 0; return graine / 4294967296 * 2 - 1; };

/* Filtre biquad (RBJ), coefficients recalculables en cours de route pour les balayages */
function biquad(type) {
  let b0, b1, b2, a1, a2, x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  const set = (f, q) => {
    const w = TAU * Math.min(f, SR * .45) / SR, c = Math.cos(w), al = Math.sin(w) / (2 * q);
    let n0, n1, n2;
    if (type === "lp") { n0 = (1 - c) / 2; n1 = 1 - c; n2 = n0; }
    else if (type === "hp") { n0 = (1 + c) / 2; n1 = -(1 + c); n2 = n0; }
    else { n0 = al; n1 = 0; n2 = -al; }
    const a0 = 1 + al; b0 = n0 / a0; b1 = n1 / a0; b2 = n2 / a0; a1 = -2 * c / a0; a2 = (1 - al) / a0;
  };
  const run = x => { const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x; y2 = y1; y1 = y; return y; };
  return { set, run };
}
function mix(i, v, pan = 0) {
  if (i < 0 || i >= N) return;
  const a = (pan + 1) * Math.PI / 4;
  L[i] += v * Math.cos(a); R[i] += v * Math.sin(a);
}
const at = t => Math.round(t * SR);

/* ---------- Instruments ---------- */
function kick(t, g = 1) {
  const n = at(.42); let ph = 0;
  for (let k = 0; k < n; k++) {
    const s = k / SR, f = 42 + 110 * Math.exp(-s * 38);
    ph += TAU * f / SR;
    mix(at(t) + k, g * .9 * Math.sin(ph) * Math.exp(-s * 7.5) + g * .25 * alea() * Math.exp(-s * 160));
  }
}
function hat(t, g = .12, pan = .25) {
  const f = biquad("hp"); f.set(8000, .7);
  for (let k = 0; k < at(.05); k++) mix(at(t) + k, g * f.run(alea()) * Math.exp(-k / SR * 90), pan);
}
function basse(t, d, f, g = .32) {
  const n = at(d); let ph = 0;
  for (let k = 0; k < n; k++) {
    const s = k / SR; ph += TAU * f / SR;
    const env = Math.min(1, s * 60) * Math.exp(-s * 3.2) * (1 - Math.exp(-(d - s) * 40));
    mix(at(t) + k, g * env * (Math.sin(ph) + .25 * Math.sin(2 * ph)));
  }
}
function nappe(t, d, freqs, g = .05, ouverture = 900) {
  const n = at(d), f = [biquad("lp"), biquad("lp")];
  f.forEach(x => x.set(ouverture, .6));
  const ph = freqs.flatMap(fr => [[fr * .997, 0], [fr * 1.003, .4]]);
  for (let k = 0; k < n; k++) {
    const s = k / SR, env = Math.min(1, s / .25) * Math.min(1, (d - s) / .4);
    let l = 0, r = 0;
    ph.forEach((p, j) => { p[1] += p[0] / SR; const saw = 2 * (p[1] % 1) - 1; if (j % 2) r += saw; else l += saw; });
    mix(at(t) + k, g * env * f[0].run(l), -.6); mix(at(t) + k, g * env * f[1].run(r), .6);
  }
}
function souffle(t, d = .5, pan = 0, g = .4) {
  const f = biquad("bp"), n = at(d);
  for (let k = 0; k < n; k++) {
    const p = k / n;
    if (k % 32 === 0) f.set(250 + 3200 * Math.sin(Math.PI * p) ** 2, 1.5);
    const env = Math.sin(Math.PI * p) ** 2;
    mix(at(t) + k, g * env * f.run(alea()), pan * (2 * p - 1));
  }
}
function montee(t, d = .4, g = .35) {
  const f = biquad("bp"), n = at(d); let ph = 0;
  for (let k = 0; k < n; k++) {
    const p = k / n;
    if (k % 32 === 0) f.set(400 + 7000 * p * p, 2);
    ph += TAU * (200 + 900 * p * p) / SR;
    const env = p ** 2.2;
    mix(at(t) + k, g * env * (f.run(alea()) + .15 * Math.sin(ph)));
  }
}
function impact(t, g = 1) {
  kick(t, g);
  const f = biquad("lp"); f.set(1800, .7);
  for (let k = 0; k < at(.9); k++) {
    const s = k / SR;
    mix(at(t) + k, g * .5 * f.run(alea()) * Math.exp(-s * 6));
  }
  let ph = 0;
  for (let k = 0; k < at(1.2); k++) { const s = k / SR; ph += TAU * (30 + 60 * Math.exp(-s * 5)) / SR; mix(at(t) + k, g * .55 * Math.sin(ph) * Math.exp(-s * 2.6)); }
}
function blip(t, f, d = .12, g = .25, pan = 0, forme = "sin") {
  let ph = 0;
  for (let k = 0; k < at(d); k++) {
    const s = k / SR; ph += TAU * f / SR;
    const o = forme === "tri" ? 2 / Math.PI * Math.asin(Math.sin(ph)) : Math.sin(ph);
    mix(at(t) + k, g * o * Math.min(1, s * 800) * Math.exp(-s * 5 / d), pan);
  }
}
function clic(t, g = .5, pan = 0) {
  const f = biquad("bp"); f.set(2600, 3);
  for (let k = 0; k < at(.03); k++) mix(at(t) + k, g * 1.6 * f.run(alea()) * Math.exp(-k / SR * 260), pan);
  blip(t, 1400, .03, g * .25, pan);
}
function frappe(t, g = .4) {
  const f = biquad("bp"); f.set(3200 + 800 * alea(), 2.5);
  const pan = alea() * .3;
  for (let k = 0; k < at(.035); k++) mix(at(t) + k, g * 1.4 * f.run(alea()) * Math.exp(-k / SR * 180), pan);
}
function chute(t) {
  let ph = 0; const n = at(.42);
  for (let k = 0; k < n; k++) { const p = k / n; ph += TAU * (1500 * Math.pow(.2, p)) / SR; mix(at(t) + k, .1 * Math.sin(ph) * Math.min(1, p * 8) * (1 - p * .5)); }
}
function chaleur(t, d) {
  const f = biquad("hp"); f.set(3500, .8); const n = at(d);
  for (let k = 0; k < n; k++) { const p = k / n; mix(at(t) + k, .16 * Math.sin(Math.PI * p) * f.run(alea()) * (1 + .5 * Math.sin(k / SR * TAU * 38)), 2 * p - 1); }
  souffle(t, d, .6, .25);
}
function tampon(t) {
  impact(t, .8);
  const f = biquad("bp"); f.set(900, 1.2);
  for (let k = 0; k < at(.12); k++) mix(at(t) + k, 1.2 * f.run(alea()) * Math.exp(-k / SR * 40));
}
function brillance(t) {
  [1318.5, 1975.5, 2637, 3951].forEach((fr, i) => {
    let ph = 0;
    for (let k = 0; k < at(1.6); k++) { const s = k / SR; ph += TAU * fr / SR; mix(at(t + i * .06) + k, .045 * Math.sin(ph) * Math.exp(-s * 2.4) * (1 + .4 * Math.sin(s * TAU * 7 + i)), i % 2 ? .5 : -.5); }
  });
}

/* ---------- Partition ---------- */
const BEAT = 60 / BPM;
const NOTES = [55, 43.65, 65.41, 49];  // la, fa, do, sol : une mesure de 2 s chacune
for (let b = Math.round(SCENES.impression / BEAT); b * BEAT < SCENES.fin - .01; b++) {
  const t = b * BEAT;
  kick(t, b % 4 === 0 ? .95 : .75);
  hat(t + BEAT / 2, .1);
  if (t >= SCENES.catalogue) { hat(t + BEAT / 4, .05, -.3); hat(t + 3 * BEAT / 4, .05, -.3); }
  const note = NOTES[Math.floor(t / 2) % 4];
  basse(t, BEAT * .95, note);
  basse(t + BEAT / 2, BEAT * .45, note, .18);
}
/* Nappes : ouverture du filtre qui monte au fil des scènes */
[[SCENES.encre + .45, 1.6, [110, 164.8, 220], 500], [SCENES.impression, 2.5, [110, 164.8, 220, 277.2], 700], [SCENES.catalogue, 2.5, [87.3, 130.8, 174.6, 220], 900],
 [SCENES.paliers, 3, [130.8, 196, 261.6, 329.6], 1100], [SCENES.studio, 4.5, [98, 146.8, 196, 246.9], 1300], [SCENES.devis, 3, [110, 164.8, 220, 277.2], 1500]]
  .forEach(([t, d, f, o]) => nappe(t, d, f, .035, o));
nappe(17.64, DUREE - 17.64, [110, 164.8, 220, 277.2, 329.6], .06, 2200);

const PALIER_NOTES = [1046.5, 1174.7, 1318.5, 1568, 1760];
let pi = 0;
for (const c of SONS) {
  switch (c.type) {
    case "chute": chute(c.t); break;
    case "impact": impact(c.t, c.g ?? 1); break;
    case "souffle": souffle(c.t - (c.d ?? .5) / 2, c.d, c.pan ?? 0); break;
    case "montee": montee(c.t, c.d); break;
    case "chaleur": chaleur(c.t, c.d); break;
    case "bascule": clic(c.t, .5 * c.g, .3); blip(c.t, 660 * (1 + c.g * .3), .09, .12, 0, "tri"); souffle(c.t - .08, .2, .4, .25); break;
    case "clic": clic(c.t, c.g ?? .5, c.pan ?? 0); break;
    case "tic": blip(c.t, 3200, .02, .1 * (c.g ?? .5) * 2, .2); break;
    case "frappe": frappe(c.t, c.g ?? .4); break;
    case "palier": blip(c.t, PALIER_NOTES[pi++ % 5], .18, .16 * (c.g ?? 1), 0, "tri"); break;
    case "pose": kick(c.t, .5 * c.g); clic(c.t, .4); break;
    case "valide": blip(c.t, 659.3, .25, .16, -.2, "tri"); blip(c.t + .1, 987.8, .4, .16, .2, "tri"); break;
    case "tampon": tampon(c.t); break;
    case "final": impact(c.t, 1.15); break;
    case "brillance": brillance(c.t); break;
  }
}

/* Fondu final, saturation douce, crête à -1 dBFS */
const fin = at(DUREE - .9);
for (let i = fin; i < N; i++) { const g = Math.max(0, 1 - (i - fin) / (N - fin)) ** 2; L[i] *= g; R[i] *= g; }
let crete = 0;
for (let i = 0; i < N; i++) { L[i] = Math.tanh(L[i] * 1.2); R[i] = Math.tanh(R[i] * 1.2); crete = Math.max(crete, Math.abs(L[i]), Math.abs(R[i])); }
const gain = Math.pow(10, -1 / 20) / crete;
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(L[i] * gain * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(R[i] * gain * 32767), 46 + i * 4); }
const sortie = join(dirname(fileURLToPath(import.meta.url)), "tmp", "son.wav");
await mkdir(dirname(sortie), { recursive: true });
await writeFile(sortie, buf);
console.log(sortie);
