"""Moteur de sound design des pubs vidéo Contino Sport.

Tout le son sort de ce code (synthèse) ou des 19 bruitages Pixabay livrés avec HyperFrames
(licence Pixabay : usage commercial, sans attribution). La musique est composée et synthétisée ici :
elle appartient au projet et reste libre de droits pour la publicité.

Le tampon est circulaire : une traîne qui dépasse la fin revient au début, la boucle Meta reste sans couture.
"""
import json
import subprocess
import wave
from pathlib import Path

import numpy as np
from scipy import signal

SR = 48000
PIXABAY = Path.home() / ".claude/skills/media-use/audio/assets/sfx"

# ---------------------------------------------------------------- outils de base


def n_ech(d):
    return int(round(d * SR))


def temps(d):
    return np.arange(n_ech(d)) / SR


def note(nom):
    """Fréquence d'une note (« A4 », « C#5 », « F#2 »)."""
    noms = {"C": -9, "D": -7, "E": -5, "F": -4, "G": -2, "A": 0, "B": 2}
    base = noms[nom[0]]
    reste = nom[1:]
    if reste.startswith("#"):
        base += 1
        reste = reste[1:]
    elif reste.startswith("b"):
        base -= 1
        reste = reste[1:]
    octave = int(reste)
    return 440.0 * 2 ** ((base + (octave - 4) * 12) / 12)


def filtre(x, kind, fc, ordre=2):
    """Filtre de Butterworth (passe-bas, passe-haut ou passe-bande)."""
    if kind == "bp":
        sos = signal.butter(ordre, [max(20, fc[0]), min(SR / 2 - 100, fc[1])], btype="bandpass", fs=SR, output="sos")
    else:
        sos = signal.butter(ordre, min(SR / 2 - 100, max(20, fc)), btype="lowpass" if kind == "lp" else "highpass", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=-1)


def filtre_variable(x, kind, fcs, bloc=64, ordre=2):
    """Filtre dont la coupure suit la courbe fcs (une valeur par échantillon), traité par blocs."""
    y = np.zeros_like(x)
    zi = None
    for i in range(0, len(x), bloc):
        fc = float(np.clip(fcs[min(i + bloc // 2, len(fcs) - 1)], 30, SR / 2 - 200))
        sos = signal.butter(ordre, fc, btype="lowpass" if kind == "lp" else "highpass", fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        y[i:i + bloc], zi = signal.sosfilt(sos, x[i:i + bloc], zi=zi)
    return y


def bruit(d, graine):
    return np.random.default_rng(graine).standard_normal(n_ech(d))


def scie(freq, t, phase=0.0):
    """Dent de scie à bande limitée (somme de partiels jusqu'à 12 kHz)."""
    y = np.zeros_like(t)
    k = 1
    while k * freq < 12000 and k < 60:
        y += ((-1) ** (k + 1)) * np.sin(2 * np.pi * k * freq * t + k * phase) / k
        k += 1
    return y * (2 / np.pi)


def carre(freq, t):
    y = np.zeros_like(t)
    k = 1
    while k * freq < 12000 and k < 60:
        y += np.sin(2 * np.pi * k * freq * t) / k
        k += 2
    return y * (4 / np.pi)


def env(d, a=0.005, decay=0.2, sustain=0.0, release=0.05, tenue=None):
    """Enveloppe attaque, décroissance exponentielle vers un palier, relâchement."""
    t = temps(d)
    e = np.where(t < a, t / max(a, 1e-6), sustain + (1 - sustain) * np.exp(-(t - a) / max(decay, 1e-6)))
    if tenue is not None:
        r = np.clip((t - tenue) / max(release, 1e-6), 0, 1)
        e = e * (1 - r)
    else:
        e[-n_ech(release):] *= np.linspace(1, 0, n_ech(release))
    return e


def stereo(x, pan=0.0, largeur=0.0, graine=0):
    """Mono vers stéréo : panoramique, et largeur par un léger décalage décorrélé."""
    g, d = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    gauche, droite = x * g * np.sqrt(2), x * d * np.sqrt(2)
    if largeur > 0:
        dec = int(0.004 * SR * largeur) + 1
        droite = np.concatenate([np.zeros(dec), droite[:-dec]]) * 0.9 + droite * 0.1
    return np.stack([gauche, droite])


def reponse_reverb(duree=1.4, predelay=0.012, sombre=6000, graine=7):
    t = temps(duree)
    rng = np.random.default_rng(graine)
    ir = np.stack([rng.standard_normal(len(t)), rng.standard_normal(len(t))]) * np.exp(-t / (duree / 6.5))
    ir = filtre(ir, "lp", sombre)
    ir = np.concatenate([np.zeros((2, n_ech(predelay))), ir], axis=1)
    return ir / np.sqrt((ir ** 2).sum() / 2)


def reverb(x, ir, mix=0.2):
    """Réverbération par convolution ; x stéréo (2, n). Rend un signal plus long (la traîne)."""
    w = np.stack([signal.fftconvolve(x[c], ir[c]) for c in range(2)])
    out = np.zeros_like(w)
    out[:, :x.shape[1]] = x * (1 - mix * 0.5)
    return out + w * mix


def charge_pixabay(nom, gain_db=0.0):
    brut = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(PIXABAY / f"{nom}.mp3"), "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
                          check=True, capture_output=True).stdout
    x = np.frombuffer(brut, dtype=np.float32).reshape(-1, 2).T.astype(np.float64)
    return x * 10 ** (gain_db / 20)


# ---------------------------------------------------------------- tampon circulaire


class Piste:
    def __init__(self, duree, circulaire=True):
        self.n = n_ech(duree)
        self.buf = np.zeros((2, self.n))
        self.circulaire = circulaire

    def ajoute(self, son, t, gain_db=0.0, pan=0.0):
        if son.ndim == 1:
            son = stereo(son, pan)
        son = son * 10 ** (gain_db / 20)
        i0 = int(round(t * SR)) % self.n if self.circulaire else int(round(t * SR))
        n = son.shape[1]
        if self.circulaire:
            idx = (np.arange(n) + i0) % self.n
            np.add.at(self.buf[0], idx, son[0])
            np.add.at(self.buf[1], idx, son[1])
        else:
            fin = min(self.n, i0 + n)
            if fin > i0:
                self.buf[:, i0:fin] += son[:, :fin - i0]

    def ajoute_piste(self, autre, gain_db=0.0):
        self.buf += autre.buf * 10 ** (gain_db / 20)


def ecrit_wav(chemin, x):
    x = np.clip(x, -1, 1)
    pcm = (x.T * 32767).astype("<i2")
    Path(chemin).parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(chemin), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def loudness(chemin):
    """LUFS intégré et crête vraie mesurés par ffmpeg (filtre ebur128)."""
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(chemin), "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    bloc = r[r.rfind("Summary:"):]
    lufs = float(bloc.split("I:")[1].split("LUFS")[0])
    crete = float(bloc.split("Peak:")[1].split("dBFS")[0])
    return lufs, crete


def limiteur(x, plafond_db=-2.0, anticipation=0.003, relache=0.06):
    """Limiteur à anticipation : gain requis par échantillon, filtre minimum sur la fenêtre d'anticipation,
    lissage qui reste sous le gain requis, puis relâchement exponentiel."""
    from scipy.ndimage import minimum_filter1d, uniform_filter1d

    plafond = 10 ** (plafond_db / 20)
    crete = np.max(np.abs(x), axis=0)
    requis = np.minimum(1.0, plafond / np.maximum(crete, 1e-9))
    L = max(3, n_ech(anticipation) | 1)
    g = minimum_filter1d(requis, size=2 * L + 1, mode="wrap")
    g = uniform_filter1d(g, size=L, mode="wrap")
    # relâchement : la remontée du gain suit une exponentielle (passe arrière puis avant pour rester symétrique)
    a = np.exp(-1 / (relache * SR))
    g = np.minimum(g, 1 - signal.lfilter([1 - a], [1, -a], 1 - g))
    return x * np.minimum(g, requis)


def ducking(x, temps_coups, profondeur_db=-7, duree=0.22, total=None):
    """Compression déclenchée par la grosse caisse (sidechain) : creuse x à chaque coup."""
    n = x.shape[-1] if total is None else total
    g = np.ones(n)
    t = temps(duree)
    creux = 1 - (1 - 10 ** (profondeur_db / 20)) * np.exp(-t / (duree / 3.5)) * np.clip(t / 0.004, 0, 1)
    for tc in temps_coups:
        i0 = n_ech(tc) % n
        idx = (np.arange(len(t)) + i0) % n
        g[idx] = np.minimum(g[idx], creux)
    return x * g


# ---------------------------------------------------------------- instruments


def grosse_caisse(force=1.0):
    t = temps(0.5)
    f = 46 + 120 * np.exp(-t / 0.032)
    corps = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.26)
    clic = filtre(bruit(0.5, 3), "hp", 2500) * np.exp(-t / 0.004) * 0.35
    return np.tanh((corps + clic) * 1.6 * force) * 0.9


def clap(graine=5):
    t = temps(0.45)
    b = filtre(bruit(0.45, graine), "bp", (900, 3200))
    e = np.zeros_like(t)
    for k, dt in enumerate([0.0, 0.009, 0.018, 0.029]):
        tt = t - dt
        e += np.where(tt >= 0, np.exp(-np.maximum(tt, 0) / (0.006 if k < 3 else 0.11)), 0)
    corps = np.sin(2 * np.pi * 220 * t) * np.exp(-t / 0.03) * 0.25
    return (b * e * 0.55 + corps)


def claquement_doigts(graine=9):
    t = temps(0.25)
    b = filtre(bruit(0.25, graine), "bp", (1800, 5500)) * np.exp(-t / 0.012)
    ping = np.sin(2 * np.pi * 1850 * t) * np.exp(-t / 0.02) * 0.2
    return (b + ping) * 0.8


def charleston(ouvert=False, graine=11):
    d = 0.32 if ouvert else 0.08
    t = temps(d)
    b = filtre(bruit(d, graine), "hp", 7500)
    metal = sum(np.sign(np.sin(2 * np.pi * f * t)) for f in (5410, 6230, 7110, 8340)) * 0.05
    return (b + metal) * np.exp(-t / (0.09 if ouvert else 0.018)) * 0.5


def maracas(graine=13):
    t = temps(0.09)
    b = filtre(bruit(0.09, graine), "bp", (5000, 11000))
    return b * np.clip(t / 0.012, 0, 1) * np.exp(-t / 0.03) * 0.35


def basse(freq, d, graine=0):
    t = temps(d)
    x = scie(freq, t) * 0.6 + np.sin(2 * np.pi * freq * t) * 0.8
    fc = 300 + 1100 * np.exp(-t / 0.06)
    x = filtre_variable(x, "lp", fc)
    return np.tanh(x * 1.4) * env(d, a=0.004, decay=0.25, sustain=0.6, release=0.03) * 0.55


def pince(freqs, d, brillance=1.0, graine=0):
    """Accord pincé (synthé « pluck ») : trois scies désaccordées par note, filtre qui se ferme."""
    t = temps(d)
    x = np.zeros_like(t)
    rng = np.random.default_rng(graine)
    for f in freqs:
        for det in (-0.07, 0.0, 0.08):
            x += scie(f * 2 ** (det / 12), t, phase=rng.uniform(0, 6.28))
    x /= max(1, len(freqs) * 2.2)
    fc = 500 + 5200 * brillance * np.exp(-t / 0.09)
    x = filtre_variable(x, "lp", fc)
    return x * env(d, a=0.002, decay=0.22, sustain=0.0, release=0.04)


def nappe(freqs, d, graine=0):
    t = temps(d)
    x = np.zeros_like(t)
    rng = np.random.default_rng(graine)
    for f in freqs:
        for det in (-0.12, -0.04, 0.05, 0.13):
            x += scie(f * 2 ** (det / 12), t, phase=rng.uniform(0, 6.28))
    x = filtre(x / (len(freqs) * 4), "lp", 1800)
    return x * env(d, a=0.35, decay=1.0, sustain=0.85, release=0.4, tenue=d - 0.4)


def marimba(freq, d=0.6):
    t = temps(d)
    x = np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.28)
    x += 0.35 * np.sin(2 * np.pi * freq * 3.93 * t) * np.exp(-t / 0.06)
    x += 0.12 * np.sin(2 * np.pi * freq * 9.6 * t) * np.exp(-t / 0.02)
    x += filtre(bruit(d, int(freq)), "bp", (1500, 5000)) * np.exp(-t / 0.004) * 0.15
    return x * np.clip(t / 0.002, 0, 1) * 0.6


def montee(d, graine=21):
    """Montée de bruit filtré (riser) qui culmine à la fin."""
    t = temps(d)
    u = t / d
    x = bruit(d, graine)
    x = filtre_variable(x, "lp", 400 + 9000 * u ** 2)
    ton = np.sin(2 * np.pi * np.cumsum(200 + 900 * u ** 2) / SR) * 0.25
    return (x * 0.5 + ton) * u ** 2.2


def cymbale_inversee(d, graine=23):
    t = temps(d)
    x = filtre(bruit(d, graine), "hp", 5000)
    return x * (t / d) ** 3 * 0.6


def impact(graine=31):
    t = temps(1.6)
    boom = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t / 0.08)) / SR) * np.exp(-t / 0.5)
    souffle = filtre(bruit(1.6, graine), "lp", 3000) * np.exp(-t / 0.15) * 0.4
    return np.tanh((boom + souffle) * 1.3) * 0.8


# ---------------------------------------------------------------- bruitages d'animation


def feutre(vitesses, pas, graine=41, aigu=6500, crepitement=1.0, chant=1.0):
    """Frottement du feutre sur le papier : bruit filtré dont l'intensité suit la vitesse de la pointe.
    vitesses : px/s échantillonnées tous les `pas` secondes (0 quand le feutre est levé).
    aigu : coupure haute du grain ; crepitement et chant : part des crépitements et du couinement des traits rapides."""
    d = len(vitesses) * pas
    t = temps(d)
    v = np.interp(t, np.arange(len(vitesses)) * pas, vitesses)
    a = np.clip(v / 900, 0, 1.4) ** 0.6
    a = filtre(a, "lp", 40)
    b = bruit(d, graine)
    grain = filtre(filtre(b, "bp", (1200, min(5200, aigu - 300))), "lp", aigu) * 0.7 + filtre(b, "bp", (450, 1200)) * 0.3
    # le grain du papier : petits crépitements dont la densité suit la vitesse
    rng = np.random.default_rng(graine + 1)
    cr = (rng.random(len(t)) < np.clip(v / 9000, 0, 0.08)) * rng.uniform(0.3, 1.0, len(t))
    cr = filtre(cr, "bp", (2500, 9000)) * 1.5 * crepitement
    # léger chant du feutre (le « couinement » des traits rapides)
    chant = np.sin(2 * np.pi * np.cumsum(900 + 0.6 * v) / SR) * np.clip((v - 1500) / 2500, 0, 1) * 0.04 * chant
    return (grain + cr + chant) * a * 0.5


def rebond_papier(force=1.0, hauteur_note=440.0):
    """Ballon dessiné qui rebondit sur le papier : « bop » qui descend d'une octave, petit choc sourd."""
    t = temps(0.3)
    f = hauteur_note * (0.5 + 0.5 * np.exp(-t / 0.035))
    bop = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.07)
    choc = np.sin(2 * np.pi * 85 * t) * np.exp(-t / 0.05) * 0.6
    papier = filtre(bruit(0.3, 51), "bp", (900, 4000)) * np.exp(-t / 0.01) * 0.3
    return (bop * 0.55 + choc + papier) * force * 0.7


def tinte_metal(freq, force=1.0, graine=61):
    """Ballon sur une patère chromée : partiels inharmoniques, petit clic d'impact."""
    t = temps(0.8)
    x = np.zeros_like(t)
    for k, (r, a, dec) in enumerate([(1, 1, 0.35), (2.76, 0.5, 0.18), (5.40, 0.3, 0.09), (8.93, 0.15, 0.05)]):
        x += a * np.sin(2 * np.pi * freq * r * t + k) * np.exp(-t / dec)
    clic = filtre(bruit(0.8, graine), "hp", 3000) * np.exp(-t / 0.003) * 0.4
    sourd = np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.03) * 0.3
    return (x * 0.35 + clic + sourd) * force


def cintre_crochet(graine=71):
    """Cintre en bois qui tombe sur le crochet : clic métal, coup de bois, petite résonance."""
    t = temps(0.4)
    rng = np.random.default_rng(graine)
    clic = filtre(bruit(0.4, graine), "bp", (2000, 6000)) * np.exp(-t / 0.006)
    bois = filtre(bruit(0.4, graine + 1), "bp", (450, 1100)) * np.exp(-t / 0.035) * 1.4
    f = rng.uniform(2900, 3400)
    anneau = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.12) * 0.08
    return (clic * 0.6 + bois + anneau) * 0.8


def tissu(d=0.32, graine=81):
    """Froissement de tissu qui tombe : bruit qui descend, battements rapides."""
    t = temps(d)
    u = t / d
    x = filtre_variable(bruit(d, graine), "lp", 6000 - 4500 * u)
    battement = 0.6 + 0.4 * np.sin(2 * np.pi * 23 * t)
    return x * battement * np.sin(np.pi * u) ** 1.5 * 0.4


def page(d=0.85, graine=91):
    """Feuille qui se soulève et tourne : crépitement du papier, souffle qui monte, claque finale."""
    t = temps(d)
    u = t / d
    souffle = filtre_variable(bruit(d, graine), "lp", 1200 + 7000 * u ** 2) * u ** 2 * 0.7
    rng = np.random.default_rng(graine)
    crep = (rng.random(len(t)) < 0.004 + 0.02 * u) * rng.uniform(0.2, 1, len(t))
    crep = filtre(crep, "bp", (1500, 7000)) * 2.5
    claque = np.where(u > 0.9, filtre(bruit(d, graine + 2), "bp", (300, 2500)) * np.exp(-(t - 0.9 * d) / 0.03), 0) * 0.8
    return souffle + crep * (0.3 + 0.7 * u) + claque


def ressort(d=0.35, f0=220, f1=760):
    """Départ élastique du ballon : glissando qui monte avec un vibrato."""
    t = temps(d)
    u = t / d
    f = f0 + (f1 - f0) * u ** 0.7 + 25 * np.sin(2 * np.pi * 18 * t)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * u) * 0.35


def couinement_surligneur(d=0.3, graine=101):
    """Surligneur qui couine sur le papier."""
    t = temps(d)
    f = 1350 + 120 * np.sin(2 * np.pi * 9 * t) + 200 * t / d
    ton = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.15
    frot = filtre(bruit(d, graine), "bp", (2500, 8000)) * 0.25
    return (ton + frot) * np.sin(np.pi * t / d) ** 0.8 * 0.7


def coche(graine=111):
    """Validation : deux notes claires en quinte."""
    t = temps(0.7)
    a = marimba(note("E6"), 0.7)
    b = np.concatenate([np.zeros(n_ech(0.07)), marimba(note("B6"), 0.7)[: n_ech(0.63)]])
    return (a * 0.6 + b * 0.7)


def charge_reperes(chemin):
    return json.loads(Path(chemin).read_text())


def vitesse_feutre(r, cle, seuil_lever=0.3):
    """Vitesse de la pointe (px/s) à chaque échantillon, nulle quand le feutre est levé ou caché."""
    pts = np.array(r[cle], dtype=float)
    pas = r["pas"]
    xy = pts[:, :2]
    v = np.zeros(len(pts))
    v[1:] = np.hypot(*(xy[1:] - xy[:-1]).T) / pas
    v[(pts[:, 2] > seuil_lever) | (pts[:, 3] == 0)] = 0
    v = np.minimum(v, 6000)
    return v
