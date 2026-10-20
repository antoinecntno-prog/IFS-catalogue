"""Bande-son originale du film Contino Sport : musique et bruitages, synthétisés de zéro.

Grille : 105 BPM, 60 s. Les repères (taps, transitions, montées) sont les mêmes que les labels
de la timeline dans index.html. Sortie : assets/audio/musique.m4a et assets/audio/bruitages.m4a.
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

# Repères du montage (secondes), partagés avec index.html
DROP1 = 2 * M                  # 4.571 : logo
STOP_DEBUT, STOP_FIN = 20.0, 9 * M   # 20.000 à 20.571 : arrêt d'un temps
PAUSE = 18 * M                 # 41.143 : pause, suivi de commande
DROP2 = 22 * M                 # 50.286 : second départ
FIN = 25 * M                   # 57.143 : dernier impact
WHOOSH = [DROP1 - 0.25, 3 * M, 5 * M, 6 * M, 7 * M, 8 * M, 9 * M, 11 * M, 13 * M, 16 * M, PAUSE, DROP2, 24 * M]
TAPS = [10.29, 24.0, 29.0, 30.857, 32.0, 33.143, 34.286, 38.86, 40.0]
FRAPPE = [(37.43, 0)]   # (début, touches au-delà de trois) : la quantité « 100 »
ETAPES = [41.714, 43.429, 45.143, 46.857]
MONTAGE = [DROP2 + i * B for i in range(8)]


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


# --------------------------------------------------------------------------- musique

PROG = [  # une mesure par accord : la mineur, fa, do, sol
    ("A2", ["A3", "C4", "E4"]),
    ("F2", ["F3", "A3", "C4"]),
    ("C3", ["G3", "C4", "E4"]),
    ("G2", ["G3", "B3", "D4"]),
]
# Motif de lead sur deux mesures, grille de doubles croches (None = silence)
MOTIF = ["E5", None, "C5", None, "D5", "E5", None, "G5", None, "E5", None, "D5", "C5", None, "A4", None,
         "C5", None, "D5", None, "E5", None, "G5", "A5", None, "G5", None, "E5", "D5", None, "C5", None]


def section_actif(t):
    """Vrai quand le groove (kick, basse) joue."""
    if t < DROP1:
        return False
    if STOP_DEBUT <= t < STOP_FIN:
        return False
    if PAUSE <= t < DROP2:
        return False
    if t >= FIN:
        return False
    return True


def musique():
    m = np.zeros((2, N))
    drums = np.zeros((2, N))
    k = kick()
    side = np.ones(N)  # sidechain : la basse et les accords plongent sous le kick
    duck = 1 - 0.65 * env_exp(int(0.3 * SR), 0.08)

    nbeats = int(DUREE / B) + 1
    for i in range(nbeats):
        t = i * B
        if not section_actif(t):
            continue
        place(drums, k, t, 0.95)
        j = int(t * SR)
        side[j:j + len(duck)] = np.minimum(side[j:j + len(duck)], duck[: max(0, min(len(duck), N - j))])
        if i % 2 == 1:
            place(drums, clap(), t, 0.55, pan=0.05)
        place(drums, hat(open_=True), t + B / 2, 0.35, pan=0.25)
        for s in (1, 3):
            if t >= 11 * M:  # les doubles croches de charley arrivent avec les sports
                place(drums, hat(), t + s * B / 4, 0.28, pan=-0.3)

    # basse en croches, accords en nappes et stabs
    nbars = int(DUREE / M) + 1
    for bar in range(nbars):
        t0 = bar * M
        root, chord = PROG[bar % 4]
        for e in range(8):
            t = t0 + e * B / 2
            if section_actif(t):
                place(m, bass_note(hz(root) * (2 if e % 2 else 1), B / 2 * 0.9), t, 0.55)
        if section_actif(t0 + 0.01):
            # stabs sur le contretemps
            for e in (1, 3, 5, 6):
                t = t0 + e * B / 2
                if section_actif(t):
                    st = sum(supersaw(hz(n), B * 0.45, cutoff=3200, release=0.05) for n in chord) / 3
                    place(m, st, t, 0.32, pan=(-0.3 if e % 2 else 0.3))
        elif PAUSE <= t0 < DROP2:
            # pause : nappe large et arpège doux
            place(m, pad([hz(n) for n in chord] + [hz(chord[0]) / 2], M + 0.4, cutoff=1100), t0, 0.45)
            for e in range(8):
                note = chord[e % 3]
                f = hz(note) * (2 if e >= 4 else 1)
                place(m, pluck(f, 0.4, bright=2600), t0 + e * B / 2, 0.16, pan=(-0.5 if e % 2 else 0.5))

    m *= side
    # lead : motif original, du 3e couplet de sports jusqu'à la pause, puis au second départ
    for bar in range(nbars):
        t0 = bar * M
        if not (9 * M <= t0 < PAUSE or DROP2 <= t0 < FIN):
            continue
        half = (bar % 2) * 16
        for s in range(16):
            note = MOTIF[half + s]
            t = t0 + s * B / 4
            if note and section_actif(t):
                place(m, pluck(hz(note), 0.32), t, 0.2, pan=0.15)

    # intro : accords filtrés qui s'ouvrent, avec deux coupures sèches, et souffle qui monte
    intro = np.zeros((2, N))
    for e in range(16):
        t = e * B / 2
        if t in (6 * B / 2, 11 * B / 2):
            continue
        root, chord = PROG[(e // 8) % 4]
        cut = 500 * (5200 / 500) ** (e / 15)
        st = sum(supersaw(hz(n), B * 0.42, cutoff=cut, release=0.04) for n in chord) / 3
        place(intro, st, t, 0.3, pan=(-0.25 if e % 2 else 0.25))
    place(intro, noise_riser(DROP1 - 0.6, 400, 10000), 0.6, 0.5)
    place(intro, reverse_cymbal(1.2), DROP1 - 1.2, 0.6)

    # arrêt d'un temps à 20 s : souffle inversé qui relance
    place(m, reverse_cymbal(STOP_FIN - STOP_DEBUT + 0.05), STOP_DEBUT, 0.7)
    # breaks de batterie avant les changements de partie
    for tb in (16 * M - B,):
        for s in range(4):
            place(drums, snare_roll_hit(), tb + s * B / 4, 0.25 + 0.08 * s)
    # montée de la pause : souffle + roulement de caisse claire qui accélère
    place(m, noise_riser(DROP2 - 47.43, 300, 11000), 47.43, 0.55)
    tr = 48.0
    while tr < DROP2 - 0.25:
        prog = (tr - 48.0) / (DROP2 - 48.0)
        place(drums, snare_roll_hit(), tr, 0.12 + 0.3 * prog)
        tr += B / 2 if prog < 0.4 else (B / 4 if prog < 0.75 else B / 8)
    # fin : accord tenu qui s'éteint
    root, chord = PROG[0]
    place(m, pad([hz(n) for n in chord] + [hz(root)], 2.8, cutoff=2600), FIN, 0.5)

    mix = drums + m + intro
    mix = reverb(mix, 0.18)
    # fondu de sortie
    fade = np.clip((DUREE - t_(N)) / 1.6, 0, 1)
    mix *= fade
    return mix


# --------------------------------------------------------------------------- bruitages

def whoosh(dur=0.5, f0=250, f1=5000):
    n = int(dur * SR)
    s = bp_sweep(rng.standard_normal(n), f0, f1)
    bell = np.sin(np.pi * np.clip(t_(n) / dur, 0, 1)) ** 1.6
    return s * bell * 1.6


def tap():
    n = int(0.12 * SR)
    f = 520 + 700 * np.exp(-t_(n) / 0.012)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.03)
    click = hp(rng.standard_normal(n), 5000) * env_exp(n, 0.002) * 0.3
    return (s + click) * 0.8


def touche():
    n = int(0.03 * SR)
    return hp(rng.standard_normal(n), 3500) * env_exp(n, 0.004) * 0.5


def carillon():
    n = int(1.2 * SR)
    s = np.zeros(n)
    for note, d in (("E6", 0.0), ("B6", 0.09)):
        i = int(d * SR)
        f = hz(note)
        s[i:] += (np.sin(2 * np.pi * f * t_(n - i)) + 0.25 * np.sin(4 * np.pi * f * t_(n - i))) * env_exp(n - i, 0.35)
    return s * 0.35


def etape(i):
    n = int(0.9 * SR)
    f = hz(["A4", "C5", "E5", "A5"][i])
    s = np.sin(2 * np.pi * f * t_(n)) + 0.4 * np.sin(2 * np.pi * 2.01 * f * t_(n)) * env_exp(n, 0.05)
    return s * env_exp(n, 0.28) * 0.35


def bruitages():
    fx = np.zeros((2, N))
    for i, t in enumerate(WHOOSH):
        place(fx, whoosh(0.5, 220, 5500 if i % 2 else 4200), t - 0.25, 0.42, pan=(-0.4 if i % 2 else 0.4))
    for t in TAPS:
        place(fx, tap(), t, 0.55)
    g = np.random.default_rng(37)
    for t0, extra in FRAPPE:
        for k in range(3 + extra):
            place(fx, touche(), t0 + k * 0.11, 0.5, pan=g.uniform(-0.2, 0.2))
    place(fx, carillon(), 40.12, 0.6)
    for i, t in enumerate(ETAPES):
        place(fx, etape(i), t, 0.55, pan=-0.1 + 0.07 * i)
    for t in MONTAGE[1:]:
        place(fx, whoosh(0.22, 800, 7000), t - 0.11, 0.18, pan=(0.5 if int(t / B) % 2 else -0.5))
    place(fx, impact(1.0), DROP1, 0.75)
    place(fx, impact(0.9), DROP2, 0.75)
    place(fx, impact(0.8), FIN, 0.7)
    place(fx, tap(), STOP_FIN, 0.5)  # le flash qui relance après l'arrêt
    return reverb(fx, 0.12)


def ecrire(nom, x, peak=0.89):
    # crête ramenée à 1, saturation douce sur les seules pointes, puis crête finale
    x = x / max(1e-9, np.abs(x).max())
    x = np.tanh(x * 1.4) / np.tanh(1.4)
    x = x * peak
    # WAV de travail, puis AAC 256 kb/s : le dépôt garde un fichier léger
    wav = os.path.join(SORTIE, nom + ".wav")
    wavfile.write(wav, SR, (x.T * 32767).astype(np.int16))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-c:a", "aac", "-b:a", "256k",
                    os.path.join(SORTIE, nom + ".m4a")], check=True)
    os.remove(wav)


if __name__ == "__main__":
    os.makedirs(SORTIE, exist_ok=True)
    ecrire("musique", musique(), 0.89)
    ecrire("bruitages", bruitages(), 0.89)
    print("ok", os.path.abspath(SORTIE))
