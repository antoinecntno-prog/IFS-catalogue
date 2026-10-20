"""Bande-son originale du film vertical Contino Sport : musique et bruitages, synthétisés de zéro.

Morceau hip-hop/pop à 105 BPM en sol mineur, écrit pour ce film : groove à coupures sèches en fin de
chaque deuxième mesure, 808 avec glissandos, motif de cloche. Les repères visuels sont en tête de la
partie « repères du film ». Sortie : assets/audio/musique.m4a et assets/audio/bruitages.m4a.
Usage : python3 outils/son.py
"""
import os
import subprocess
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR = 44100
DUREE = 60.0
BPM = 105
B = 60 / BPM          # un temps
M = 4 * B             # une mesure
N = int(SR * DUREE)
rng = np.random.default_rng(1105)

ICI = os.path.dirname(os.path.abspath(__file__))
SORTIE = os.path.join(ICI, "..", "assets", "audio")



def t_(n):
    return np.arange(n) / SR


def env_exp(n, tau):
    return np.exp(-t_(n) / tau)


def lp(x, f, order=2):
    return sosfilt(butter(order, min(f, SR / 2 - 100) / (SR / 2), "low", output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f / (SR / 2), "high", output="sos"), x)


def bp(x, f1, f2, order=2):
    return sosfilt(butter(order, [f1 / (SR / 2), min(f2, SR / 2 - 100) / (SR / 2)], "band", output="sos"), x)


def saw(freq, n, phase=0.0):
    ph = (phase + freq * t_(n)) % 1.0
    return 2 * ph - 1


def lp_sweep(x, f0, f1, block=512):
    """Passe-bas dont la coupure glisse de f0 à f1 (exponentiel), par blocs avec état conservé."""
    out = np.zeros_like(x)
    zi = None
    nb = int(np.ceil(len(x) / block))
    for i in range(nb):
        f = f0 * (f1 / f0) ** (i / max(nb - 1, 1))
        sos = butter(2, min(f, SR / 2 - 200) / (SR / 2), "low", output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        seg = x[i * block:(i + 1) * block]
        y, zi = sosfilt(sos, seg, zi=zi)
        out[i * block:i * block + len(seg)] = y
    return out


def bp_sweep(x, f0, f1, q=1.2, block=256):
    out = np.zeros_like(x)
    zi = None
    nb = int(np.ceil(len(x) / block))
    for i in range(nb):
        f = f0 * (f1 / f0) ** (i / max(nb - 1, 1))
        lo, hi = f / (1 + 1 / (2 * q)), min(f * (1 + 1 / (2 * q)), SR / 2 - 200)
        sos = butter(1, [lo / (SR / 2), hi / (SR / 2)], "band", output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        seg = x[i * block:(i + 1) * block]
        y, zi = sosfilt(sos, seg, zi=zi)
        out[i * block:i * block + len(seg)] = y
    return out


def place(buf, sig, t, gain=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N:
        return
    sig = sig[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, i:i + len(sig)] += sig * gain * l * 1.414
    buf[1, i:i + len(sig)] += sig * gain * r * 1.414


def reverb_ir(seconds, seed, damp=6000):
    g = np.random.default_rng(seed)
    n = int(seconds * SR)
    ir = g.standard_normal(n) * env_exp(n, seconds / 6.5)
    ir = lp(ir, damp)
    ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
    return ir / np.sqrt((ir ** 2).sum())


IR_L, IR_R = reverb_ir(2.2, 7), reverb_ir(2.2, 8)


def reverb(buf, wet):
    out = np.zeros_like(buf)
    out[0] = fftconvolve(buf[0], IR_L)[:N]
    out[1] = fftconvolve(buf[1], IR_R)[:N]
    return buf + out * wet


def hz(note):
    noms = {"C": -9, "C#": -8, "Db": -8, "D": -7, "D#": -6, "Eb": -6, "E": -5, "F": -4, "F#": -3,
            "Gb": -3, "G": -2, "G#": -1, "Ab": -1, "A": 0, "A#": 1, "Bb": 1, "B": 2}
    nom, octv = note[:-1], int(note[-1])
    return 440.0 * 2 ** ((noms[nom] + 12 * (octv - 4)) / 12)


# --------------------------------------------------------------------------- instruments

def kick():
    n = int(0.45 * SR)
    f = 46 + 110 * np.exp(-t_(n) / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * env_exp(n, 0.16)
    click = hp(rng.standard_normal(n), 3000) * env_exp(n, 0.004) * 0.25
    return np.tanh(1.6 * (s + click))


def clap():
    n = int(0.35 * SR)
    nz = bp(rng.standard_normal(n), 900, 3200)
    e = np.zeros(n)
    for k, d in enumerate([0.0, 0.011, 0.022]):
        i = int(d * SR)
        e[i:] += env_exp(n - i, 0.006 if k < 2 else 0.11)
    return nz * e * 0.9


def hat(open_=False):
    n = int((0.22 if open_ else 0.06) * SR)
    s = hp(rng.standard_normal(n), 7500, 4)
    return s * env_exp(n, 0.08 if open_ else 0.014) * (0.5 if open_ else 0.4)


def snare_roll_hit():
    n = int(0.12 * SR)
    return bp(rng.standard_normal(n), 1200, 6000) * env_exp(n, 0.03)


def bass_note(freq, dur):
    n = int(dur * SR)
    s = saw(freq, n) + 0.5 * np.sign(np.sin(2 * np.pi * freq / 2 * t_(n)))
    s = lp(s, 380) * np.minimum(1, t_(n) / 0.005) * np.minimum(1, (dur - t_(n)) / 0.02).clip(0)
    return s * 0.6


def supersaw(freq, dur, cutoff=2400, voices=5, spread=0.012, attack=0.01, release=0.08):
    n = int(dur * SR)
    s = np.zeros(n)
    for v in range(voices):
        det = 1 + spread * (v - (voices - 1) / 2) / ((voices - 1) / 2)
        s += saw(freq * det, n, phase=rng.random())
    s /= voices
    s = lp(s, cutoff)
    a = np.minimum(1, t_(n) / attack)
    r = np.clip((dur - t_(n)) / release, 0, 1)
    return s * a * r


def pluck(freq, dur=0.35, bright=4200):
    n = int(dur * SR)
    s = saw(freq, n) * 0.7 + 0.3 * np.sign(np.sin(2 * np.pi * freq * t_(n)))
    s = lp_sweep(s, bright, 500, block=256)
    return s * env_exp(n, dur / 3.2)


def pad(freqs, dur, cutoff=1400):
    s = sum(supersaw(f, dur, cutoff=cutoff, voices=7, spread=0.018, attack=0.6, release=0.9) for f in freqs)
    return s / len(freqs)


def noise_riser(dur, f0=300, f1=9000):
    n = int(dur * SR)
    s = lp_sweep(rng.standard_normal(n), f0, f1)
    return s * (t_(n) / dur) ** 2.2 * 0.55


def reverse_cymbal(dur):
    n = int(dur * SR)
    s = hp(rng.standard_normal(n), 4000) * env_exp(n, dur / 3)
    return s[::-1] * 0.5


def impact(size=1.0):
    n = int(2.4 * SR)
    f = 30 + 70 * np.exp(-t_(n) / 0.08)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.55)
    crash = hp(rng.standard_normal(n), 2500) * env_exp(n, 0.5) * 0.35
    body = bp(rng.standard_normal(n), 120, 900) * env_exp(n, 0.07) * 0.6
    return np.tanh((boom + crash + body) * 1.3) * size



# --------------------------------------------------------------------------- repères du film (secondes globales)
INTRO_SILENCE = (4.43, 2 * M)            # 4.430 à 4.571 : silence avant le premier départ
DROP1 = 2 * M                            # 4.571
STOP = (20.0, 9 * M)                     # 20.000 à 20.571 : arrêt et souffle inversé
COUPURE = 40.857                         # coup sourd puis silence avant la pause
PAUSE = 18 * M                           # 41.143
MONTEE = (45.714, 50.0)                  # souffle de montée de la pause
PRE_DROP2 = (50.0, 22 * M)               # silence avant le second départ
DROP2 = 22 * M                           # 50.286
FIN = 25 * M                             # 57.143 : impact final

# Repères visuels, relevés dans les scènes construites (temps globaux)
WHOOSH = [6.857, 11.429, 13.714, 15.9, 18.286, 25.143, 28.0, 34.286, 36.887, 54.857]
MONTANTS = [(6.286, 6.857), (10.571, 11.429), (24.286, 25.143), (29.143, 29.714), (38.286, 38.857), (50.0, 50.286)]
TAPS = [10.286, 24.0, 28.857, 30.286, 30.857, 31.143, 32.0, 32.857, 35.143, 36.0, 36.857, 39.429]
FRAPPE = [37.286, 37.429, 37.571, 37.714, 37.857]   # rafales de frappe de l'e-mail
COCHE = 40.0
ECLAIR = 39.479                          # cercle jaune qui remplit l'écran après l'envoi
ETAPES = [41.714, 43.429, 45.143, 46.857, 48.571]
MONTAGE = [DROP2 + i * B for i in range(8)]
PUNCH = [0.571, 1.143, 1.714, 2.286, 5.714, 9.714, 16.0, 20.571, 22.857, 25.143, 27.429, 28.571, 36.571, 37.143, 40.571]
MOTS = [2.571, 2.857, 3.143, 3.429, 20.857, 21.143, 22.0, 22.286, 26.0, 26.571, 27.143]   # mots qui claquent


# --------------------------------------------------------------------------- instruments propres à ce morceau

def kick_court():
    n = int(0.32 * SR)
    f = 52 + 140 * np.exp(-t_(n) / 0.02)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.09)
    click = hp(rng.standard_normal(n), 2500) * env_exp(n, 0.003) * 0.4
    return np.tanh(2.0 * (s + click))


def snare_claque():
    n = int(0.3 * SR)
    corps = np.sin(2 * np.pi * 190 * t_(n)) * env_exp(n, 0.03) * 0.5
    bruit = bp(rng.standard_normal(n), 1500, 7000) * env_exp(n, 0.07)
    return np.tanh(1.5 * (corps + bruit)) * 0.85


def charley(ouvert=False):
    n = int((0.25 if ouvert else 0.05) * SR)
    s = hp(rng.standard_normal(n), 8000, 4)
    return s * env_exp(n, 0.09 if ouvert else 0.012) * (0.45 if ouvert else 0.32)


def note_808(f0, dur, f1=None):
    """808 grave saturée, glissando vers f1 sur la fin de la note."""
    n = int(dur * SR)
    f = np.full(n, f0, dtype=float)
    if f1:
        g0 = int(n * 0.6)
        f[g0:] = f0 * (f1 / f0) ** np.linspace(0, 1, n - g0)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    env = np.minimum(1, t_(n) / 0.004) * np.clip((dur - t_(n)) / 0.03, 0, 1) * (0.55 + 0.45 * env_exp(n, 0.5))
    return np.tanh(2.4 * s * env) * 0.8


def cloche(freq, dur=0.6):
    """Petite cloche FM : timbre clair pour le motif."""
    n = int(dur * SR)
    tt = t_(n)
    mod = np.sin(2 * np.pi * freq * 3.5 * tt) * 2.2 * env_exp(n, 0.08)
    return np.sin(2 * np.pi * freq * tt + mod) * env_exp(n, dur / 3.5)


def stab(freqs, dur):
    s = sum(supersaw(f, dur, cutoff=2800, voices=5, spread=0.014, attack=0.004, release=0.05) for f in freqs)
    return s / len(freqs)


# --------------------------------------------------------------------------- écriture

# Sol mineur : sol m, mi bémol, si bémol, fa. Une mesure par accord.
PROG = [
    ("G1", ["G3", "Bb3", "D4"], "Bb1"),
    ("Eb1", ["G3", "Bb3", "Eb4"], None),
    ("Bb1", ["F3", "Bb3", "D4"], "C2"),
    ("F1", ["F3", "A3", "C4"], "G1"),
]
# Motif de cloche, deux mesures en doubles croches (None = silence) : écrit pour ce film
MOTIF = ["D5", None, None, "Bb4", None, "C5", "D5", None, "F5", None, "D5", None, "C5", None, "Bb4", None,
         "G4", None, None, "Bb4", None, "C5", None, "D5", None, None, "C5", None, "Bb4", None, "A4", None]


def groove_actif(t):
    if t < DROP1:
        return False
    for a, b in (STOP, (COUPURE, PAUSE), (PAUSE, PRE_DROP2[1])):
        if a <= t < b:
            return False
    if t >= FIN:
        return False
    return True


def coupe_de_fin_de_paire(t):
    """Coupure sèche d'une croche avant chaque mesure impaire du groove (fin de chaque deuxième mesure)."""
    bar = int(t // M)
    pos = t - bar * M
    return bar % 2 == 0 and pos >= M - B / 2 - 1e-6


def musique():
    drums = np.zeros((2, N))
    harm = np.zeros((2, N))
    lead = np.zeros((2, N))
    fx = np.zeros((2, N))
    k, sn = kick_court(), snare_claque()
    nbars = int(DUREE / M) + 1
    for bar in range(nbars):
        t0 = bar * M
        root, chord, glide = PROG[bar % 4]
        section_b = 9 * M <= t0 < PAUSE
        drop2 = DROP2 <= t0 < FIN
        for step in range(16):
            t = t0 + step * B / 4
            if not groove_actif(t) or coupe_de_fin_de_paire(t):
                continue
            # kick : 1, et de 2 (pas 7), pas 11 une mesure sur deux, pas 14 en fin de phrase
            if step in (0, 6) or (step == 10 and bar % 2) or (step == 13 and bar % 4 == 3):
                place(drums, k, t, 0.95)
            if step in (4, 12):
                place(drums, sn, t, 0.6, pan=0.04)
            if step == 15 and bar % 2 == 1:
                place(drums, sn, t, 0.18, pan=-0.1)
            # charleston : croches, doubles croches en partie B et au second départ, roulements en fin de paire
            if step % 2 == 0 or section_b or drop2:
                place(drums, charley(), t, 0.22 if step % 2 else 0.3, pan=-0.25)
            if step == 10 and bar % 2 == 0:
                place(drums, charley(ouvert=True), t, 0.3, pan=0.3)
        # roulement de charleston en triolets sur le dernier temps des mesures paires (avant la coupure)
        if groove_actif(t0) and bar % 2 == 1 and (section_b or drop2):
            for r in range(6):
                place(drums, charley(), t0 + 3 * B + r * B / 6, 0.18 + 0.03 * r, pan=-0.2)
        # 808 : une note par demi-mesure, glissando sur la dernière
        if groove_actif(t0 + 0.01):
            f = hz(root)
            place(harm, note_808(f, 2 * B * 0.95), t0, 0.9)
            end = M - (B / 2 if bar % 2 == 0 else 0)
            place(harm, note_808(f, end - 2 * B - 0.01, hz(glide) if glide else None), t0 + 2 * B, 0.85)
            # accords en stabs sur les contretemps, plus pleins au second départ
            for st in (2, 6, 10) + ((13,) if drop2 else ()):
                t = t0 + st * B / 4
                if groove_actif(t) and not coupe_de_fin_de_paire(t):
                    place(harm, stab([hz(n) for n in chord], B * 0.35), t, 0.26 if not drop2 else 0.33, pan=(-0.35 if st % 4 else 0.35))
            # nappe discrète sous le groove
            place(harm, pad([hz(n) for n in chord], M - 0.05, cutoff=900), t0, 0.12)
        elif PAUSE <= t0 < PRE_DROP2[1]:
            place(harm, pad([hz(n) for n in chord] + [hz(chord[0]) * 2], M + 0.5, cutoff=1300), t0, 0.42)
            for e in range(8):
                f = hz(chord[e % 3]) * (2 if e % 4 >= 2 else 1)
                place(lead, cloche(f, 0.7), t0 + e * B / 2 + B / 4, 0.12, pan=(-0.5 if e % 2 else 0.5))
        # motif de cloche en partie B et au second départ
        if section_b or drop2:
            half = (bar % 2) * 16
            for s in range(16):
                note = MOTIF[half + s]
                t = t0 + s * B / 4
                if note and groove_actif(t) and not coupe_de_fin_de_paire(t):
                    place(lead, cloche(hz(note), 0.5), t, 0.2, pan=0.18)

    # intro : accords filtrés au rythme du groove, souffle qui monte, silence, deux claquements
    intro = np.zeros((2, N))
    for bar in range(2):
        root, chord, _ = PROG[bar]
        for st in (0, 2, 6, 10, 12):
            t = bar * M + st * B / 4
            if t >= INTRO_SILENCE[0]:
                continue
            cut = 400 * (3800 / 400) ** (t / INTRO_SILENCE[0])
            s = sum(supersaw(hz(n), B * 0.32, cutoff=cut, release=0.03) for n in chord) / 3
            place(intro, hp(s, 180), t, 0.34, pan=(-0.3 if st % 4 else 0.3))
    place(fx, noise_riser(INTRO_SILENCE[0] - 0.2, 300, 11000), 0.2, 0.55)
    for t in (4.43 - 0.03, ):
        place(fx, snare_claque(), t, 0.4)
    # arrêt à 20 s : coup filtré puis souffle inversé
    place(fx, reverse_cymbal(STOP[1] - STOP[0] + 0.03), STOP[0], 0.75)
    root, chord, _ = PROG[0]
    place(fx, lp(pad([hz(n) for n in chord], STOP[1] - STOP[0], cutoff=800), 700), STOP[0], 0.4)
    # coupure avant la pause : coup sourd
    n = int(0.6 * SR)
    thud = np.sin(2 * np.pi * np.cumsum(45 + 60 * np.exp(-t_(n) / 0.03)) / SR) * env_exp(n, 0.12)
    place(fx, thud, COUPURE, 0.8)
    # montée de la pause : souffle et roulement de caisse claire qui accélère
    place(fx, noise_riser(MONTEE[1] - MONTEE[0], 300, 12000), MONTEE[0], 0.55)
    tr = 47.43
    while tr < MONTEE[1] - 0.05:
        prog = (tr - 47.43) / (MONTEE[1] - 47.43)
        place(drums, snare_roll_hit(), tr, 0.1 + 0.32 * prog)
        tr += B / 2 if prog < 0.35 else (B / 4 if prog < 0.7 else B / 8)
    # fin : accord tenu
    place(harm, pad([hz(n) for n in PROG[0][1]] + [hz("G2")], 2.8, cutoff=2400), FIN, 0.5)
    place(harm, note_808(hz("G1"), 1.8), FIN, 0.8)

    mix = drums + harm + lead + intro + fx
    mix = reverb(mix, 0.14)
    mix *= np.clip((DUREE - t_(N)) / 1.6, 0, 1)
    return mix


# --------------------------------------------------------------------------- bruitages

def whoosh(dur=0.5, f0=250, f1=5000):
    n = int(dur * SR)
    s = bp_sweep(rng.standard_normal(n), f0, f1)
    bell = np.sin(np.pi * np.clip(t_(n) / dur, 0, 1)) ** 1.6
    return s * bell * 1.6


def tap():
    n = int(0.12 * SR)
    f = 560 + 760 * np.exp(-t_(n) / 0.012)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.03)
    click = hp(rng.standard_normal(n), 5000) * env_exp(n, 0.002) * 0.3
    return (s + click) * 0.8


def touche():
    n = int(0.03 * SR)
    return hp(rng.standard_normal(n), 3500) * env_exp(n, 0.004) * 0.5


def coche():
    n = int(1.2 * SR)
    s = np.zeros(n)
    for note, d in (("D6", 0.0), ("A6", 0.09)):
        i = int(d * SR)
        f = hz(note)
        s[i:] += (np.sin(2 * np.pi * f * t_(n - i)) + 0.25 * np.sin(4 * np.pi * f * t_(n - i))) * env_exp(n - i, 0.35)
    return s * 0.35


def etape(i):
    n = int(0.9 * SR)
    f = hz(["G4", "Bb4", "D5", "F5", "G5"][i % 5])
    return cloche(f, 0.9) * 0.4


def punch():
    n = int(0.16 * SR)
    return lp(rng.standard_normal(n), 900) * env_exp(n, 0.03) * 0.6


def bruitages():
    out = np.zeros((2, N))
    for i, t in enumerate(WHOOSH):
        place(out, whoosh(0.5, 220, 5500 if i % 2 else 4200), t - 0.25, 0.4, pan=(-0.4 if i % 2 else 0.4))
    for t in TAPS:
        place(out, tap(), t, 0.55)
    for i, t0 in enumerate(FRAPPE):
        for k in range(4):
            place(out, touche(), t0 + k * 0.028, 0.42, pan=(-0.15 if (i + k) % 2 else 0.15))
    for a, b in MONTANTS:
        n = int((b - a) * SR)
        s = bp_sweep(rng.standard_normal(n), 300, 6500) * (t_(n) / (b - a)) ** 1.8
        place(out, s * 1.3, a, 0.38)
    for t in MOTS:
        place(out, punch(), t, 0.22)
    place(out, whoosh(0.3, 600, 6000), ECLAIR - 0.05, 0.4)
    place(out, coche(), COCHE, 0.6)
    for i, t in enumerate(ETAPES):
        place(out, etape(i), t, 0.6, pan=-0.12 + 0.06 * i)
    for t in MONTAGE[1:]:
        place(out, whoosh(0.22, 800, 7000), t - 0.11, 0.18, pan=(0.5 if int(t / B) % 2 else -0.5))
    for t in PUNCH:
        place(out, punch(), t, 0.4)
    place(out, impact(1.0), DROP1, 0.75)
    place(out, impact(0.9), DROP2, 0.75)
    place(out, impact(0.85), FIN, 0.7)
    place(out, tap(), STOP[1], 0.5)
    return reverb(out, 0.12)


def ecrire(nom, x, peak=0.89):
    x = x / max(1e-9, np.abs(x).max())
    x = np.tanh(x * 1.4) / np.tanh(1.4)
    x = x * peak
    wav = os.path.join(SORTIE, nom + ".wav")
    wavfile.write(wav, SR, (x.T * 32767).astype(np.int16))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-c:a", "aac", "-b:a", "256k",
                    os.path.join(SORTIE, nom + ".m4a")], check=True)
    os.remove(wav)


if __name__ == "__main__":
    os.makedirs(SORTIE, exist_ok=True)
    ecrire("musique", musique(), 0.8)
    ecrire("bruitages", bruitages(), 0.7)
    print("ok", os.path.abspath(SORTIE))
