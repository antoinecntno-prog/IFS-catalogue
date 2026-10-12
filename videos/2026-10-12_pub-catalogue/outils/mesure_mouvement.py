"""Contrôle c) du brief : mesure des images figées dans diff.txt, produit par la commande ffmpeg tblend/signalstats du brief."""
import re
v=[float(x) for x in re.findall(r'YAVG=([0-9.]+)',open('diff.txt').read())]
fps=30; cta=(19.05,21.563); fig=[x<0.3 for x in v]
print('quasi figees %.1f %%' % (100*sum(fig)/len(v)))
run=best=0
for f in fig: run=run+1 if f else 0; best=max(best,run)
print('plus longue suite figee %.2f s' % (best/fps))
print('secondes figees hors CTA :',[s for s in range(len(v)//fps) if all(fig[s*fps:(s+1)*fps]) and not (cta[0]<=s and s+1<=cta[1])])
