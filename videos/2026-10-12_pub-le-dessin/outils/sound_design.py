"""Sound design de la pub « Le dessin » : musique composée pour la grille de poses, bruitages calés sur le mouvement.

Usage : python3 outils/sound_design.py <reperes.json>
Le fichier de repères vient de outils/reperes.js (positions du feutre et du ballon échantillonnées à 120 Hz).
Sorties : assets/audio/mix.wav (lu par la composition), stems musique et bruitages en m4a pour retoucher le mix.
"""
import subprocess
import sys
from pathlib import Path

import numpy as np

ICI = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ICI.parent / "son"))
from moteur import (SR, Piste, charge_pixabay, charge_reperes, cintre_crochet, coche, couinement_surligneur, ecrit_wav, feutre, filtre,  # noqa: E402
                    limiteur, loudness, n_ech, note, page, rebond_papier, ressort, stereo, tinte_metal, tissu, vitesse_feutre)
from musique import compose  # noqa: E402

TEMPS = 60 / 128
DUREE = 48 * TEMPS
SORTIE = ICI / "assets" / "audio"
TMP = Path("/tmp/son-le-dessin")
CIBLE_LUFS = -14.0

PLAN = [
    ("F#m", "intro"), ("D", "intro+montee"),
    ("A", "plein+impact"), ("E", "plein"), ("F#m", "plein+lead"), ("D", "plein+lead"),
    ("A", "pause+montee"),
    ("E", "plein+impact_leger"), ("F#m", "plein+lead+inverse"), ("D", "plein+lead"),
    ("A", "cta"), ("E", "cta+fin"),
]
LEADS = {4: "a", 5: "b", 8: "c", 9: "d"}


def pic_pixabay(x):
    """Instant du maximum d'énergie d'un bruitage, pour caler sa crête sur l'image."""
    e = np.convolve(np.abs(x).sum(axis=0), np.ones(480) / 480, mode="same")
    return int(np.argmax(e)) / SR


def bruitages(r, ancien=False):
    sfx = Piste(DUREE)
    pas = r["pas"]
    t = np.array(r["t"])
    L = r["L"]
    if ancien:
        # réglage livré le 12/10 : sert seulement à garder le niveau des autres bruitages
        for cle, g in (("feutreA", -8), ("feutreB", -9)):
            sfx.ajoute(stereo(feutre(vitesse_feutre(r, cle), pas, graine=41 if cle == "feutreA" else 43), 0.1, 0.4), 0, g)
        b = np.array([x[:2] for x in r["ballon"]], dtype=float)
        v = np.zeros(len(t))
        v[1:] = np.hypot(*(b[1:] - b[:-1]).T) / pas
        v[(t < r["ECRIT"][0]) | (t > r["ECRIT"][1])] = 0
        sfx.ajoute(stereo(feutre(np.minimum(v, 3000) * 0.8, pas, graine=45), 0.0, 0.4), 0, -9)
        v = np.where((t >= L["b09_prix"]) & (t <= 13.4), 1600.0, 0.0)
        sfx.ajoute(stereo(feutre(v, pas, graine=47), -0.1, 0.4), 0, -10)
    else:
        # feutre A (croquis et flamme de la boucle) et feutre B (passes de couleurs) : grain sourd, bas dans le mix.
        # L'écriture du logo et le contour de l'étiquette restent muets : la musique porte ces passages.
        for cle, g in (("feutreA", -19), ("feutreB", -21)):
            sfx.ajoute(stereo(feutre(vitesse_feutre(r, cle), pas, graine=41 if cle == "feutreA" else 43, aigu=3800, crepitement=0.25, chant=0.0), 0.1, 0.4), 0, g)

    # rebonds sur le papier et tintements sur les patères, lus dans les contacts de la composition
    gamme = ["A5", "B5", "C#6", "D6", "E6", "F#6", "G#6", "A6"]
    patere = 0
    for c in r["contacts"]:
        tc = c["t"]
        if c["f"] == "F":
            fort = 1.25 if abs(tc - L["b03_contact"]) < 1e-3 else (0.6 if tc > 16.4 else 1.0)
            sfx.ajoute(rebond_papier(fort, note("A4") if fort > 1 else note("E5")), tc, -4, pan=0.15)
        else:
            sfx.ajoute(tinte_metal(note(gamme[min(patere, 7)]), 0.9, graine=61 + patere), tc, -8, pan=0.2 - 0.05 * patere)
            patere += 1
    # atterrissages (fin d'un saut sans rebond) et frappe sur la dernière patère
    for tc, fort in ((1.8, 0.5), (4.4, 0.7), (5.6, 0.45)):
        sfx.ajoute(rebond_papier(fort, note("C#5")), tc, -6, pan=0.15)
    sfx.ajoute(tinte_metal(note("A6"), 1.4, graine=90), L["b07_rang"], -3, pan=0.3)
    sfx.ajoute(tinte_metal(note("A4"), 1.0, graine=91), L["b07_rang"], -8, pan=0.3)
    sfx.ajoute(tinte_metal(note("E6"), 0.6, graine=92), 13.05, -12, pan=0.3)
    # anticipations : petit ressort comprimé avant les grands sauts
    for ta in (2.81, 5.73, 10.48, 15.33):
        sfx.ajoute(ressort(0.22, 520, 300), ta, -20, pan=0.1)

    # sets qui tombent sur leur patère (un par temps), puis la rangée qui se balance
    for i, th in enumerate(r["accroche"]):
        sfx.ajoute(tissu(0.3, 81 + i), th - 0.3, -16, pan=-0.4 + 0.08 * i)
        sfx.ajoute(cintre_crochet(71 + i), th, -6, pan=-0.4 + 0.08 * i)
        if i < 8:
            sfx.ajoute(cintre_crochet(171 + i), L["b07_rang"] + 0.06 * (7 - i) + 0.05, -15 - 1.5 * (7 - i), pan=-0.4 + 0.08 * i)

    # transformation du dessin en tissu, envol du set, traversée vers le vestiaire
    sparkle = charge_pixabay("sparkle")
    sfx.ajoute(sparkle, L["b03_contact"] - 0.02, -9)
    sfx.ajoute(tissu(0.45, 88), L["b03_contact"], -12)
    sfx.ajoute(charge_pixabay("whoosh-short"), L["b04_envol"], -16)
    w = charge_pixabay("whoosh")
    sfx.ajoute(w, L["b04_envol"] + 0.6 + 0.35 - pic_pixabay(w), -13)
    wc = charge_pixabay("whoosh-cinematic")
    sfx.ajoute(wc, L["b05_vestiaire"] - 0.05 - pic_pixabay(wc), -9)
    sfx.ajoute(charge_pixabay("impact-bass-1"), L["b05_vestiaire"], -15)
    # logo signé, cartons, surligneur, coche, bouton
    sfx.ajoute(sparkle, r["ECRIT"][1] - 0.05, -12)
    pop = charge_pixabay("pop")
    for tp, g in ((13.4, -12), (14.6, -13), (16.4, -12), (17.8, -13), (L["b11_cta"] + 0.08, -16)):
        sfx.ajoute(pop, tp, g)
    sfx.ajoute(couinement_surligneur(0.3), 13.55, -9, pan=-0.2)
    clic_doux = charge_pixabay("click-soft")
    for tp in (15.4, 15.48, 18.38, 18.46):
        sfx.ajoute(clic_doux, tp, -18)
    sfx.ajoute(charge_pixabay("whoosh-short"), 15.55, -12)
    sfx.ajoute(pop, L["b10_maquette"], -7)
    sfx.ajoute(stereo(coche(), 0.2, 0.5), r["COCHE"][1] - 0.02, -6)
    sfx.ajoute(charge_pixabay("click"), L["b11_cta"], -7)
    sfx.ajoute(pop, L["b11_cta"] + 0.01, -11)
    # la page se soulève et tourne, le ballon repart vers le coin
    sfx.ajoute(stereo(page(0.85), 0.25, 0.8), L["b12_page"], -3)
    sfx.ajoute(ressort(0.38, 230, 820), L["b12_page"], -9, pan=0.3)
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
