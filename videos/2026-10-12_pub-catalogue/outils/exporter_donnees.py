"""Écrit assets/donnees.js pour la pub catalogue : catégories, produits, prix d'entrée réels et conditions,
icône du site (croquis au feutre), photo retenue et détourage. Source unique des chiffres : site/donnees.js."""
import json
import re
from pathlib import Path

ICI = Path(__file__).resolve().parent.parent
REPO = ICI.parent.parent


def prix_fr(v):
    return f"{v:.2f}".replace(".", ",")


def main():
    s = (REPO / "site" / "donnees.js").read_text()
    data = json.loads(s[s.index("{"): s.rindex("}") + 1])
    fiches = json.loads((ICI / "assets" / "produits.json").read_text())
    sprite = (ICI / "assets" / "icones-site.svg").read_text()
    icones = {m.group(1): (m.group(2), m.group(3)) for m in re.finditer(r'<symbol id="i-([a-z-]+)" viewBox="([^"]+)">(.*?)</symbol>', sprite, re.S)}
    produits = []
    for p in data["products"]:
        e = p.get("entry", {})
        f = fiches[p["id"]]
        q = re.search(r"dès (\d+) pcs", e.get("txt", ""))
        produits.append({
            "id": p["id"], "nom": p["name"], "cat": p["cat"], "icone": p["icon"],
            "prix": e.get("price"), "prixTxt": prix_fr(e["price"]) if e.get("price") is not None else None,
            "condition": e.get("txt"), "qteMin": int(q.group(1)) if q else None,
            "transport": p.get("transport"), "origine": p.get("origin"),
            "photo": f"assets/produits/{p['id']}.webp", "detoure": f"assets/produits/{p['id']}-detoure.png" if f["uni"] else None,
            "bbox": f.get("bbox"), "contour": f.get("contour"), "illustration": f["illustration"],
        })
    out = {
        "categories": [{"id": c["id"], "nom": c["name"], "sous": c.get("sub")} for c in data["cats"]],
        "produits": produits,
        "icones": {k: {"viewBox": v[0], "svg": v[1]} for k, v in icones.items()},
    }
    js = "window.CATALOGUE = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n"
    (ICI / "assets" / "donnees.js").write_text(js)
    print(len(produits), "produits,", len(icones), "icônes,", len(js), "octets")


if __name__ == "__main__":
    main()
