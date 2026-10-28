// Outils partagés par les compositions : interpolation monotone des relevés Apple et polygones de masque.
window.calque = (function () {
  // Interpolation monotone (Fritsch-Carlson) : une fonction pure du temps, sans état.
  function courbe(T, P) {
    const n = T.length, d = [], m = [];
    if (n === 1) return () => P[0];
    for (let i = 0; i < n - 1; i++) d.push((P[i + 1] - P[i]) / (T[i + 1] - T[i]));
    m.push(d[0]);
    for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2);
    m.push(d[n - 2]);
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
      const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
      if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
    }
    return (t) => {
      if (t <= T[0]) return P[0];
      if (t >= T[n - 1]) return P[n - 1];
      let i = 0;
      while (t > T[i + 1]) i++;
      const h = T[i + 1] - T[i], u = (t - T[i]) / h, u2 = u * u, u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * P[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * P[i + 1] + (u3 - u2) * h * m[i + 1];
    };
  }
  // Plusieurs valeurs suivies ensemble : chaque composante a sa courbe.
  function piste(T, cles) {
    const f = cles[0].map((_, j) => courbe(T, cles.map((c) => c[j])));
    return (t) => f.map((g) => g(t));
  }
  function polygone(xy) {
    const p = [];
    for (let i = 0; i < xy.length; i += 2) p.push(`${xy[i].toFixed(1)}px ${xy[i + 1].toFixed(1)}px`);
    return `polygon(${p.join(", ")})`;
  }
  // Biseau : bord gauche donné par ses abscisses en y = 0 et y = 600, bord droit par ses ordonnées en
  // x = 1000 et x = 1920. Le sommet est leur intersection, les rayons partent vers le haut et vers la droite.
  function biseau(gx0, gx600, dy1000, dy1920) {
    const ag = [gx0, 0], ug = [gx600 - gx0, 600];
    const ad = [1000, dy1000], ud = [920, dy1920 - dy1000];
    const det = ug[0] * -ud[1] + ud[0] * ug[1];
    const s = ((ad[0] - ag[0]) * -ud[1] + ud[0] * (ad[1] - ag[1])) / det;
    const S = [ag[0] + s * ug[0], ag[1] + s * ug[1]];
    const n = (v) => { const l = Math.hypot(v[0], v[1]); return [v[0] / l, v[1] / l]; };
    const g = n(ug[1] > 0 ? [-ug[0], -ug[1]] : ug), d = n(ud[0] > 0 ? ud : [-ud[0], -ud[1]]);
    const mi = n([g[0] + d[0], g[1] + d[1]]);
    const R = 8000 + Math.hypot(S[0] - 960, S[1] - 540);
    return polygone([S[0], S[1], S[0] + R * g[0], S[1] + R * g[1], S[0] + R * mi[0], S[1] + R * mi[1], S[0] + R * d[0], S[1] + R * d[1]]);
  }
  // Pilote une fonction du temps local depuis une timeline en pause : rendu identique à chaque recherche.
  function piloter(tl, debut, duree, f) {
    const proxy = { t: 0 };
    tl.fromTo(proxy, { t: 0 }, { t: duree, duration: duree, ease: "none", onUpdate: () => f(proxy.t) }, debut);
    f(0);
  }
  return { courbe, piste, polygone, biseau, piloter };
})();
