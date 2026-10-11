"""Recale index.html sur minutage.json : objet T, durées racine, départs des bruitages, fondu de la musique, piste voix.

Usage : python3 outils/minutage.py   (depuis le dossier du projet)
Règles : le ballon du plan 6 se pose à T6 + 3,00 s ; la pose finale commence après la fin de la voix
et après la pose du ballon, puis tient HOLD secondes sans voix.
"""
import json, re, pathlib

HOLD = 1.25          # pose finale tenue sans voix
B1_CONTACT = 0.42    # contact du ballon à l'accroche
B2_CONTACT = 2.55    # contact du ballon sur le bouton, relatif à T6
B2_SETTLE = 3.00     # fin de la stabilisation du ballon, relatif à T6
FPS = 30

root = pathlib.Path(__file__).resolve().parent.parent
m = json.loads((root / "minutage.json").read_text())
p, v = m["plans"], m["voix"]
end_motion = max(v["voEnd"], p["s6"] + B2_SETTLE)
total = round((end_motion + HOLD) * FPS) / FPS
total = round(total, 3)
T = dict(p); T["total"] = total; T["final"] = round(end_motion, 3); T["v"] = v

html = (root / "index.html").read_text()
html = re.sub(r"(/\* MINUTAGE:DEBUT[^\n]*\n\s*const T = ).*?;\n", lambda mo: mo.group(1) + json.dumps(T, separators=(",", ":")) + ";\n", html, flags=re.S)

def set_attr(h, el_id, attr, val):
    pat = re.compile(r'(<(?:div|section|audio)[^>]*\bid="' + re.escape(el_id) + r'"[^>]*?\b' + attr + r'=")[^"]*(")')
    h2, n = pat.subn(lambda mo: mo.group(1) + str(val) + mo.group(2), h)
    assert n == 1, (el_id, attr, n)
    return h2

html = set_attr(html, "root", "data-duration", total)
html = set_attr(html, "stage", "data-duration", total)
html = set_attr(html, "musique", "data-duration", total)
fade = round(total - 0.8, 3)
lane = {"version": 1, "lanes": [{"target": "volume", "points": [{"t": 0, "v": 0.55}, {"t": fade, "v": 0.55}, {"t": total, "v": 0}]}]}
html = set_attr(html, "musique", "data-automation", json.dumps(lane, separators=(",", ":")).replace('"', "&quot;"))
html = set_attr(html, "sfx-ballon-contact", "data-start", B1_CONTACT)
html = set_attr(html, "sfx-ballon-reception", "data-start", round(p["s6"] + B2_CONTACT, 3))
html = set_attr(html, "sfx-bouton", "data-start", round(p["s6"] + B2_CONTACT + 0.02, 3))

# Voix off : un segment <audio> par plan, tous dans le groupe "voiceover" (carve de la musique contre le groupe)
import re as _re
html = _re.sub(r'\n\s*<audio id="vo-[^"]*"[^>]*></audio>', "", html)
if m.get("fichierVoix") and m.get("segmentsVoix"):
    tags = []
    for sgt in m["segmentsVoix"]:
        dur = round(sgt["a"] - sgt["de"], 3)
        tags.append(f'<audio id="{sgt["id"]}" src="{m["fichierVoix"]}" data-start="{sgt["place"]}" data-duration="{dur}" data-media-start="{sgt["de"]}" data-track-index="1" data-audio-group="voiceover"></audio>')
    html = html.replace('      <audio id="musique"', "".join("      " + x + "\n" for x in tags) + '      <audio id="musique"', 1)

(root / "index.html").write_text(html)
print(f"total {total} s, fin du mouvement {end_motion:.2f} s, pose finale tenue {total - end_motion:.2f} s")
