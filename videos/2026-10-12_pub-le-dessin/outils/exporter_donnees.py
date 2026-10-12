"""Écrit assets/donnees.js : tracés du dessin et repères des décors, chargés par index.html sans requête réseau."""
import json
from pathlib import Path

ICI = Path(__file__).resolve().parent.parent
dessin = json.loads((ICI / "assets" / "dessin.json").read_text())
decors = json.loads((ICI / "assets" / "decors.json").read_text())
for k in ("maillot", "short", "flamme_bord"):
    dessin[k].pop("d", None)
js = "window.DESSIN = " + json.dumps(dessin, separators=(",", ":")) + ";\nwindow.DECORS = " + json.dumps(decors, separators=(",", ":")) + ";\n"
(ICI / "assets" / "donnees.js").write_text(js)
print(len(js), "octets")
