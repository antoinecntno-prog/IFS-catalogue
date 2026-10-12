#!/bin/sh
# YAVG entre deux images fixes, même chaîne que le contrôle du brief (réduction en 270 x 480 puis différence en gris)
ffmpeg -loglevel info -i "$1" -i "$2" -filter_complex "[0]scale=270:480,format=gray[a];[1]scale=270:480,format=gray[b];[a][b]blend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG" -f null - 2>&1 | grep -o "YAVG=[0-9.]*"
