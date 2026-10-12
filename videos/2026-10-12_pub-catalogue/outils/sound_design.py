"""Sound design de la pub « Le carnet » : musique composée pour la grille de poses, bruitages calés sur le mouvement.

Usage : python3 outils/sound_design.py <reperes.json>
Le fichier de repères vient de outils/reperes.js (feutre, ballon et caméra échantillonnés à 120 Hz, contacts, produits).
Sorties : assets/audio/mix.wav (lu par la composition), stems musique et bruitages en m4a pour retoucher le mix.
"""
import subprocess
import sys
from pathlib import Path

import numpy as np

ICI = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ICI.parent / "son"))
from moteur import (SR, Piste, charge_pixabay, charge_reperes, coche, couinement_surligneur, ecrit_wav, feutre, filtre,  # noqa: E402
                    limiteur, loudness, note, page, pince, rebond_papier, ressort, stereo, tinte_metal, tissu)
from musique import compose  # noqa: E402

TEMPS = 60 / 128
DUREE = 64 * TEMPS
SORTIE = ICI / "assets" / "audio"
TMP = Path("/tmp/son-catalogue")
CIBLE_LUFS = -14.0
TP = lambda n: n * TEMPS  # noqa: E731

PLAN = [
    ("F#m", "intro"),                  # m1  0 à 4    accroche, set, étiquette
    ("D", "intro+montee"),             # m2  4 à 8    tote bag ; montée vers le groove
    ("A", "plein+impact"),             # m3  8 à 12   contact du sweat, dos du 3
    ("E", "plein"),                    # m4  12 à 16  grand saut à 15
    ("F#m", "plein+lead"),             # m5  16 à 20  haut du 3, fouetté vers le 0
    ("D", "plein+lead+impact_leger"),  # m6  20 à 24  contact de l'écharpe, bob
    ("A", "plein+lead"),               # m7  24 à 28  côté droit du 0
    ("E", "plein+lead+inverse"),       # m8  28 à 32  cymbale inversée vers le contact du temps 30
    ("F#m", "plein+lead+montee"),      # m9  32 à 36  rafale
    ("D", "pause+impact+montee"),      # m10 36 à 40  30/30, recul
    ("A", "plein+impact+lead"),        # m11 40 à 44  « produits, prix en ligne »
    ("E", "cta"),                      # m12 44 à 48  sortie des cartons, bon
    ("F#m", "cta"),                    # m13 48 à 52
    ("D", "cta"),                      # m14 52 à 56  dribble à 52
    ("A", "cta+impact_leger"),         # m15 56 à 60  le ballon appuie sur le bouton
    ("E", "cta+fin"),                  # m16 60 à 64  page à 60 ; filtre qui se ferme pendant la plongée
]
LEADS = {4: "e", 5: "f", 6: "e", 7: "f", 8: "e", 10: "e"}
# gamme pentatonique de la majeur : une note par photo en cadre, qui monte case après case et repart au début du « 0 »
PENTA = ["A4", "B4", "C#5", "E5", "F#5", "A5", "B5", "C#6", "E6", "F#6", "A6", "B6"]


def pic_pixabay(x):
    """Instant du maximum d'énergie d'un bruitage, pour caler sa crête sur l'image."""
    e = np.convolve(np.abs(x).sum(axis=0), np.ones(480) / 480, mode="same")
    return int(np.argmax(e)) / SR


def vitesse_papier(r):
    """Vitesse de la pointe par rapport au papier (px/s à l'écran), nulle quand le feutre est levé ou caché.
    La caméra est retirée : un travelling ne fait pas crisser le feutre."""
    f = np.array(r["feutre"], float)
    c = np.array(r["cam"], float)
    pas = r["pas"]
    monde = np.stack([c[:, 1] + (f[:, 0] - 540) / c[:, 0], c[:, 2] + (f[:, 1] - 960) / c[:, 0]], axis=1)
    v = np.zeros(len(f))
    v[1:] = np.hypot(*(monde[1:] - monde[:-1]).T) / pas * c[1:, 0]
    # le cercle du compteur est tracé à l'écran : vitesse écran directe
    t = np.array(r["t"])
    ecran = (t >= TP(36.25)) & (t <= TP(36.85))
    ve = np.zeros(len(f))
    ve[1:] = np.hypot(*(f[1:, :2] - f[:-1, :2]).T) / pas
    v[ecran] = ve[ecran]
    v[(f[:, 2] > 0.3) | (f[:, 3] == 0)] = 0
    return np.minimum(v, 6000)


# le feutre ne s'entend que sur les tracés qui comptent : l'accroche et les héros, les passes du bob, le cercle du compteur.
# Pendant la série d'un produit par temps, la musique et les notes de révélation portent le rythme.
FENETRES_FEUTRE = [(TP(63.2) - DUREE, TP(8)), (TP(20.9), TP(22.0)), (TP(36.2), TP(36.9)), (TP(63.2), DUREE + 1)]
GAIN_FEUTRE = -16
# réglage livré le 12/10 (feutre partout à -5 dB) : sert seulement à garder le niveau des autres bruitages
GAIN_FEUTRE_ANCIEN = -5


def masque_feutre(t, fondu=0.12):
    m = np.zeros_like(t)
    for a, b in FENETRES_FEUTRE:
        m = np.maximum(m, np.clip((t - a) / fondu, 0, 1) * np.clip((b - t) / fondu, 0, 1))
    return m


def bruitages(r, ancien=False):
    sfx = Piste(DUREE)
    pas = r["pas"]
    v = vitesse_papier(r)
    if ancien:
        sfx.ajoute(stereo(feutre(v, pas, graine=41), 0.1, 0.4), 0, GAIN_FEUTRE_ANCIEN)
    else:
        # grain plus sourd, sans crépitements secs ni couinement
        v = v * masque_feutre(np.array(r["t"]))
        sfx.ajoute(stereo(feutre(v, pas, graine=41, aigu=3800, crepitement=0.25, chant=0.0), 0.1, 0.4), 0, GAIN_FEUTRE)

    sparkle, pop, clic_doux, clic = (charge_pixabay(n) for n in ("sparkle", "pop", "click-soft", "click"))

    # contacts du ballon
    sfx.ajoute(rebond_papier(0.8), TP(1), -10, pan=0.3)
    sfx.ajoute(rebond_papier(1.0, 330), TP(2), -8, pan=-0.3)
    sfx.ajoute(sparkle, TP(2) - 0.02, -12)
    sfx.ajoute(tissu(0.45, 88), TP(2), -14)
    sfx.ajoute(rebond_papier(1.0, 392), TP(6), -9, pan=-0.15)
    sfx.ajoute(sparkle, TP(6) - 0.02, -13)
    sfx.ajoute(ressort(0.25, 260, 520), TP(6.25), -15)
    sfx.ajoute(rebond_papier(1.0, 440), TP(8), -9)
    sfx.ajoute(tissu(0.4, 89), TP(8), -14)
    for n, pan in ((15, -0.3), (20, 0.2)):
        sfx.ajoute(rebond_papier(1.1, 370), TP(n), -9, pan=pan)
        sfx.ajoute(sparkle, TP(n) - 0.02, -13)
    for n in (26, 30):
        sfx.ajoute(rebond_papier(0.9, 415), TP(n), -10, pan=0.35)
    # rafale : un ton plus haut à chaque saut
    for j, n in enumerate((33, 34, 35)):
        sfx.ajoute(rebond_papier(0.9, 440 * 2 ** (2 * j / 12)), TP(n), -9, pan=-0.1)
    # boxer et 30/30
    sfx.ajoute(charge_pixabay("impact-bass-1"), TP(36), -14)
    sfx.ajoute(tinte_metal(1760, 1.0, graine=90), TP(36), -14, pan=0.2)
    sfx.ajoute(rebond_papier(1.0, 494 * 2 ** (2 / 12)), TP(36), -9)
    sfx.ajoute(stereo(coche(), -0.3, 0.5), TP(36.85), -12)
    wc = charge_pixabay("whoosh-cinematic")
    sfx.ajoute(wc, TP(38.25) - pic_pixabay(wc), -17)
    sfx.ajoute(rebond_papier(0.8, 440), TP(40), -12, pan=0.2)
    sfx.ajoute(sparkle, TP(40), -14)
    # bon à détacher et bouton
    sfx.ajoute(stereo(page(0.4, 93), 0, 0.6), TP(46.5), -12)
    sfx.ajoute(rebond_papier(0.6, 494), TP(46.8), -12, pan=0.35)
    sfx.ajoute(clic, TP(47.6), -9)
    sfx.ajoute(pop, TP(47.6) + 0.01, -14)
    sfx.ajoute(rebond_papier(0.5, 494), TP(52), -14, pan=0.35)
    sfx.ajoute(clic, TP(56), -8)
    sfx.ajoute(rebond_papier(0.8, 392), TP(56), -12)
    sfx.ajoute(rebond_papier(0.6, 494), TP(57), -13, pan=0.35)
    sfx.ajoute(stereo(page(0.3, 94), 0, 0.6), TP(59.5), -14)
    # frappe du coin et tour de page
    sfx.ajoute(rebond_papier(1.1, 330), TP(60), -9, pan=0.3)
    sfx.ajoute(stereo(page(0.85), 0.25, 0.8), TP(60), -10)
    w = charge_pixabay("whoosh")
    sfx.ajoute(w, TP(62.5) - pic_pixabay(w), -14)

    # anticipations : ressort comprimé avant les grands sauts
    for n in (13.6, 18.5, 58.4):
        sfx.ajoute(ressort(0.32, 520, 300), TP(n), -14, pan=0.1)
    # fouettés : crête calée au milieu
    ws = charge_pixabay("whoosh-short")
    for n in (14.7, 19.6):
        sfx.ajoute(ws, TP(n) - pic_pixabay(ws), -13)
    # surligneur : prix des deux étiquettes et passes du bob
    for n in (2.5, 6.95, 21.0, 21.5):
        sfx.ajoute(couinement_surligneur(0.3, 101 + int(n * 10)), TP(n), -12, pan=-0.2)

    # révélations à un temps : tissu et pop pour un détouré, note pincée et clic doux pour une photo en cadre
    k_note, reparti = 0, False
    for p in sorted(r["produits"], key=lambda p: p["T"]):
        if p["n"] <= 3 or p["id"] == "bob":
            continue
        if not reparti and p["T"] >= TP(20) - 1e-6:
            k_note, reparti = 0, True  # la gamme repart au début du « 0 »
        if p["detoure"]:
            sfx.ajoute(tissu(0.3, 120 + p["n"]), p["T"] - 0.12, -14, pan=-0.2 + 0.015 * p["n"])
            sfx.ajoute(pop, p["T"], -16)
        else:
            f = note(PENTA[min(k_note, len(PENTA) - 1)])
            sfx.ajoute(stereo(pince([f, f * 2], 0.5, brillance=0.8, graine=p["n"]), -0.25 + 0.02 * p["n"], 0.3), p["T"], -15)
            sfx.ajoute(clic_doux, p["T"], -18)
            k_note += 1
    return sfx


def m4a(wav, sortie):
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(wav), "-c:a", "aac", "-b:a", "192k", str(sortie)], check=True)


def main():
    r = charge_reperes(sys.argv[1])
    TMP.mkdir(parents=True, exist_ok=True)
    musique, _ = compose(PLAN, 128.0, LEADS)
    sfx = bruitages(r)
    # niveaux de départ : la musique porte, les bruitages passent devant aux moments clés.
    # Le gain des bruitages se calcule sur le réglage livré le 12/10 : baisser le feutre laisse les autres bruitages à leur niveau.
    ecrit_wav(TMP / "m.wav", limiteur(musique.buf * 0.5, -1.0))
    ecrit_wav(TMP / "s.wav", limiteur(bruitages(r, ancien=True).buf * 0.5, -1.0))
    lm, _ = loudness(TMP / "m.wav")
    ls, _ = loudness(TMP / "s.wav")
    gm = 10 ** ((-16.5 - lm) / 20) * 0.5
    gs = 10 ** ((-17.5 - ls) / 20) * 0.5
    # passe-haut à 28 Hz : l'infra-grave ne passe pas sur un téléphone et prend de la marge au limiteur
    mix = filtre(musique.buf * gm + sfx.buf * gs, "hp", 28)
    for _ in range(4):
        sortie = limiteur(mix, -2.0)
        ecrit_wav(TMP / "mix.wav", sortie)
        l, crete = loudness(TMP / "mix.wav")
        if abs(l - CIBLE_LUFS) < 0.3:
            break
        mix = mix * 10 ** ((CIBLE_LUFS - l) / 20)
    SORTIE.mkdir(parents=True, exist_ok=True)
    ecrit_wav(SORTIE / "mix.wav", sortie)
    ecrit_wav(TMP / "musique.wav", limiteur(musique.buf * gm, -2.0))
    ecrit_wav(TMP / "bruitages.wav", limiteur(sfx.buf * gs, -2.0))
    m4a(TMP / "musique.wav", SORTIE / "stem-musique.m4a")
    m4a(TMP / "bruitages.wav", SORTIE / "stem-bruitages.m4a")
    lf, cf = loudness(SORTIE / "mix.wav")
    print(f"musique seule {lm:.1f} LUFS avant gain, bruitages seuls {ls:.1f} LUFS avant gain")
    print(f"mix final : {lf:.1f} LUFS intégrés, crête vraie {cf:.1f} dBFS -> {SORTIE / 'mix.wav'}")


if __name__ == "__main__":
    main()
