"""Compositeur des musiques de pub : groove pop électro à 128 BPM, mesures en 4/4, seize doubles croches par mesure.

Le plan est une liste de mesures (accord, sections). Sections reconnues :
intro (arpège pincé, maracas, claquements, grosse caisse légère), plein (groove complet), lead (motif de marimba),
pause (nappe tenue, sans grosse caisse), cta (groove sans motif), fin (deux temps pleins puis le filtre se ferme),
montee (riser jusqu'à la mesure suivante), impact (coup sur le premier temps), inverse (cymbale inversée vers le temps 3).
"""
import numpy as np

from scipy import signal

from moteur import (Piste, basse, charleston, clap, claquement_doigts, cymbale_inversee, ducking, filtre_variable, grosse_caisse,
                    impact, marimba, maracas, montee, nappe, note, pince, reponse_reverb, stereo)

ACCORDS = {
    "A": (["A3", "C#4", "E4"], "A2"),
    "E": (["E3", "G#3", "B3"], "E2"),
    "F#m": (["F#3", "A3", "C#4"], "F#2"),
    "D": (["D3", "F#3", "A3"], "D2"),
    "Bm": (["B2", "D3", "F#3"], "B1"),
    "C#m": (["C#3", "E3", "G#3"], "C#2"),
}
MOTIFS = {
    # double croche -> note
    "a": {0: "C#5", 3: "E5", 6: "F#5", 10: "E5", 12: "C#5"},
    "b": {0: "D5", 3: "C#5", 6: "A4", 10: "B4", 12: "A4"},
    "c": {0: "C#5", 3: "E5", 6: "F#5", 10: "A5", 12: "F#5", 14: "E5"},
    "d": {0: "D5", 3: "E5", 6: "F#5", 10: "A5", 12: "E5"},
}


def compose(plan, bpm=128.0, motifs_lead=None):
    """Rend la musique en stéréo (2, n), en tampon circulaire de len(plan) mesures."""
    temps_s = 60.0 / bpm
    mesure = 4 * temps_s
    dc = temps_s / 4
    duree = len(plan) * mesure
    ir = reponse_reverb(1.6)
    drums, basses, harmonie, lead, fx, envois = (Piste(duree) for _ in range(6))
    coups = []
    motifs_lead = motifs_lead or {}
    for i, (accord, sections) in enumerate(plan):
        t0 = i * mesure
        notes, racine = ACCORDS[accord]
        freqs = [note(n) for n in notes]
        fr = note(racine)
        s = set(sections.split("+"))
        plein = bool(s & {"plein", "cta", "fin"})
        coupe_fin = "fin" in s  # temps 3 et 4 sans batterie, filtre qui se ferme
        # ---- batterie
        if plein:
            for k in (0, 4, 8, 12):
                if coupe_fin and k >= 8:
                    continue
                drums.ajoute(grosse_caisse(), t0 + k * dc, 0)
                coups.append(t0 + k * dc)
            for k in (4, 12):
                if coupe_fin and k >= 8:
                    continue
                c = clap(5 + i)
                drums.ajoute(c, t0 + k * dc, -5, pan=0.05)
                envois.ajoute(c, t0 + k * dc, -9)
            for k in range(16):
                ouvert = k % 4 == 2
                g = -12 if ouvert else (-17 if k % 2 else -20)
                drums.ajoute(charleston(ouvert, 11 + k + 16 * i), t0 + k * dc, g, pan=0.25 if k % 2 else -0.15)
        if "intro" in s:
            for k in (0, 8):
                drums.ajoute(grosse_caisse(0.7), t0 + k * dc, -6)
                coups.append(t0 + k * dc)
            for k in (4, 12):
                c = claquement_doigts(9 + k + i)
                drums.ajoute(c, t0 + k * dc, -6, pan=0.2)
                envois.ajoute(c, t0 + k * dc, -8)
            for k in range(16):
                drums.ajoute(maracas(13 + k + 16 * i), t0 + k * dc, -13 if k % 2 else -16, pan=-0.3)
        if "pause" in s:
            for k in (2, 6, 10, 14):
                drums.ajoute(charleston(False, 200 + k + i), t0 + k * dc, -18, pan=0.2)
            drums.ajoute(claquement_doigts(300 + i), t0 + 12 * dc, -8, pan=-0.2)
        # ---- basse
        if plein:
            pas = [0, 2, 6, 10, 14] if not coupe_fin else [0, 2, 6]
            for j, k in enumerate(pas):
                f = fr * (2 if k in (6, 14) else 1)
                b = basse(f, dc * (1.6 if k else 1.2), graine=i * 16 + k)
                basses.ajoute(b, t0 + k * dc, -3)
        if "pause" in s:
            basses.ajoute(basse(fr, mesure * 0.5), t0, -14)
        # ---- harmonie
        if plein:
            rythme = [0, 3, 6, 10, 12] if not coupe_fin else [0, 3, 6]
            for k in rythme:
                p = pince(freqs + [freqs[0] * 2], dc * 2.2, brillance=0.9, graine=i * 7 + k)
                harmonie.ajoute(stereo(p, 0, 1.0), t0 + k * dc, -9)
                envois.ajoute(stereo(p, 0, 1.0), t0 + k * dc, -14)
            if coupe_fin:
                # le filtre se ferme sur les temps 3 et 4 : nappe qui descend vers l'intro
                d = mesure / 2
                p = nappe(freqs, d + 0.3)
                p = filtre_variable(p, "lp", np.linspace(2200, 300, len(p)))
                harmonie.ajoute(stereo(p, 0, 1.0), t0 + 8 * dc, -10)
        if "intro" in s:
            arp = [freqs[0], freqs[1], freqs[2], freqs[0] * 2]
            for k in range(16):
                f = arp[k % 4] * (2 if k >= 8 and "montee" in s else 1)
                p = pince([f], dc * 1.4, brillance=0.55 + 0.03 * k, graine=100 + k + 16 * i)
                harmonie.ajoute(stereo(p, (k % 4 - 1.5) * 0.25), t0 + k * dc, -16 + (3 if k % 4 == 0 else 0))
                envois.ajoute(stereo(p, 0), t0 + k * dc, -18)
        if "pause" in s:
            p = nappe(freqs + [freqs[0] * 2], mesure + 0.4, graine=i)
            harmonie.ajoute(stereo(p, 0, 1.0), t0, -11)
            envois.ajoute(stereo(p, 0, 1.0), t0, -14)
        # ---- motif de marimba
        if "lead" in s:
            motif = motifs_lead.get(i, "a")
            for k, n in MOTIFS[motif].items():
                m = marimba(note(n), 0.7)
                lead.ajoute(stereo(m, 0.15, 0.6), t0 + k * dc, -7)
                envois.ajoute(stereo(m, 0.15, 0.6), t0 + k * dc, -11)
        # ---- effets de transition
        if "montee" in s:
            fx.ajoute(stereo(montee(mesure, 21 + i), 0, 1.0), t0, -11)
        if "impact" in s:
            fx.ajoute(stereo(impact(31 + i), 0, 0.5), t0, -7)
        if "impact_leger" in s:
            fx.ajoute(stereo(impact(41 + i), 0, 0.5), t0, -14)
        if "inverse" in s:
            d = 8 * dc
            fx.ajoute(stereo(cymbale_inversee(d, 51 + i), 0, 1.0), t0 + 8 * dc - d, -12)
            fx.ajoute(stereo(impact(61 + i), 0, 0.5), t0 + 8 * dc, -16)

    # sidechain : basse et harmonie se creusent sous la grosse caisse
    basses.buf = ducking(basses.buf, coups, -8, 0.24)
    harmonie.buf = ducking(harmonie.buf, coups, -5, 0.2)
    # réverbération commune, rendue en circulaire
    w = np.stack([signal.fftconvolve(envois.buf[c], ir[c]) for c in range(2)])
    rev = Piste(duree)
    rev.ajoute(w[:, : envois.n + ir.shape[1]], 0, 0)
    mix = Piste(duree)
    for p, g in ((drums, 0), (basses, 0), (harmonie, 0), (lead, 0), (fx, 0), (rev, -10)):
        mix.ajoute_piste(p, g)
    return mix, coups
