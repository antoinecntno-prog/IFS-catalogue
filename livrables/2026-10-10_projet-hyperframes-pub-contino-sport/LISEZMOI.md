# Pub Meta Contino Sport, set football, 9:16

Projet HyperFrames modifiable de la pub de 30 s au plus (1080 × 1920, 30 i/s).

## Fichiers

- `index.html` : la composition (six plans, ballon SVG, son). Tout le minutage vient de l'objet `T`, entre les marqueurs `MINUTAGE`.
- `minutage.json` : début de chaque plan et de chaque phrase de la voix off. Source unique du minutage.
- `outils/minutage.py` : reporte `minutage.json` dans `index.html` (objet `T`, durée totale, départs des bruitages, fondu de la musique, piste voix).
- `feuille-de-poses.md` : registres, canaux et poses clés du ballon.
- `assets/audio/` : musique ElevenLabs Music, bruitages ElevenLabs retravaillés ; `assets/audio/sources/` garde toutes les variantes générées.
- `assets/img/` : photos du catalogue, captures du studio en ligne, logo (264 px de large à la source, affiché à 400 px).

## Ajouter la voix off

1. Déposer le fichier de la voix dans `assets/audio/voix-off.mp3`.
2. Relever le début de chaque phrase (`npx hyperframes transcribe assets/audio/voix-off.mp3 --json`), puis remplir `voix`, `plans`, `fichierVoix`, `dureeVoix` dans `minutage.json`.
3. `python3 outils/minutage.py`, puis le carve de la musique sous la voix (`hyperframes-audio`), puis `npx hyperframes check`.
4. `npx hyperframes render --quality delivery --output <fichier>.mp4`.

## Commandes

```bash
npx hyperframes check
npx hyperframes snapshot . --at 0.6,5.9,9.6
npx hyperframes preview --background
npx hyperframes render --quality delivery --output pub.mp4
```
