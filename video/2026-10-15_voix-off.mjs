#!/usr/bin/env node
// Voix off « Prêts pour samedi » : génération ElevenLabs avec horodatage, puis calage des étapes.
//
//   node 2026-10-15_voix-off.mjs            génère voix-off.mp3 et voix-off_alignment.json, puis écrit timings.json
//   node 2026-10-15_voix-off.mjs --calage   recalcule timings.json depuis le voix-off_alignment.json présent
//
// La clé se lit dans la variable ELEVENLABS_API_KEY, part dans l'en-tête xi-api-key et ne s'écrit dans aucun fichier.
// Le calage lit deux formats d'alignement : la réponse de /with-timestamps (caractères horodatés)
// et une transcription horodatée par mot ({ "words": [...] }, format Scribe).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const FICHIER_MP3 = path.join(ICI, 'voix-off.mp3');
const FICHIER_ALIGNEMENT = path.join(ICI, 'voix-off_alignment.json');
const FICHIER_TIMINGS = path.join(ICI, 'timings.json');

const VOIX = 'V39sOJ41dGpHuQXfN0jv'; // « Antoine », clone français
const MODELES = ['eleven_v4', 'eleven_multilingual_v2'];
const VITESSES = [1.0, 1.08, 1.12];
const SEED = 20261015;
const REGLAGES = { stability: 0.5, similarity_boost: 0.85, style: 0.3 };

const DECALAGE = 0.4;   // la voix commence à 0,4 s dans la vidéo
const AVANCE = 0.2;     // chaque étape démarre 0,2 s avant son premier mot
const FIN_MAX = 26.5;   // dernier mot avant 26,5 s
const DUREE = 30;
const DUREE_MIN = { BAT: 4.5, defaut: 2.2 };

// Texte exact. Les balises repèrent les ancres et ne partent pas à l'API.
const TEXTE_BALISE = `[INTRO] Samedi, votre équipe entre sur le terrain.
[LOGO] Vous envoyez le logo, on dessine le maillot.
[COULEURS] La tenue prend vos couleurs.
[DESIGN] Ajoutez autant de teintes que vous voulez, même prix.
[BLASON] Le blason va côté cœur, [SPONSOR] le sponsor ressort sur chaque photo.
[NUMÉRO] Chaque joueur porte son numéro.
[BAT] On imprime quand vous dites oui.
[FINALE] Et samedi, ils ont fière allure. Vingt-cinq euros quatre-vingt-dix-neuf hors taxe le maillot et le short, dès trente ensembles.`;

// Sous-ancre de la fin : la carte du prix arrive avec ce mot.
const SOUS_ANCRE_PRIX = 'Vingt-cinq';

function decouper(texteBalise) {
  const mots = [];
  const ancres = [];
  for (const jeton of texteBalise.split(/\s+/).filter(Boolean)) {
    const balise = jeton.match(/^\[(.+)\]$/);
    if (balise) ancres.push({ id: balise[1], index: mots.length });
    else mots.push(jeton);
  }
  return { mots, ancres, texte: mots.join(' ') };
}

const normaliser = (m) => m.toLowerCase().normalize('NFC').replace(/[^\p{L}\p{N}-]/gu, '');

// Liste des mots horodatés, quel que soit le format de l'alignement.
function motsHorodates(alignement) {
  if (Array.isArray(alignement.words)) {
    return {
      format: 'transcription horodatée par mot (Scribe)',
      mots: alignement.words.filter((m) => m.type === 'word').map((m) => ({ texte: m.text, debut: m.start, fin: m.end })),
    };
  }
  const a = alignement.alignment || alignement.normalized_alignment;
  if (!a || !Array.isArray(a.characters)) throw new Error('Alignement illisible : ni "words" ni "alignment.characters".');
  const mots = [];
  let courant = null;
  a.characters.forEach((c, i) => {
    if (/\s/.test(c)) { courant = null; return; }
    if (!courant) { courant = { texte: '', debut: a.character_start_times_seconds[i], fin: 0 }; mots.push(courant); }
    courant.texte += c;
    courant.fin = a.character_end_times_seconds[i];
  });
  return { format: 'alignement par caractère de /with-timestamps', mots };
}

function calage() {
  const { mots, ancres } = decouper(TEXTE_BALISE);
  const alignement = JSON.parse(fs.readFileSync(FICHIER_ALIGNEMENT, 'utf8'));
  const { format, mots: horodates } = motsHorodates(alignement);

  if (horodates.length !== mots.length) {
    throw new Error(`L'alignement compte ${horodates.length} mots, le texte ${mots.length}.`);
  }
  mots.forEach((m, i) => {
    if (normaliser(m) !== normaliser(horodates[i].texte)) {
      throw new Error(`Mot ${i} différent : texte « ${m} », alignement « ${horodates[i].texte} ».`);
    }
  });

  const r3 = (x) => Math.round(x * 1000) / 1000;
  const etapes = ancres.map((a) => {
    const mot = horodates[a.index];
    return {
      id: a.id,
      premier_mot: mots[a.index],
      mot_alignement_s: r3(mot.debut),
      mot_video_s: r3(mot.debut + DECALAGE),
      debut_s: a.id === 'INTRO' ? 0 : r3(mot.debut + DECALAGE - AVANCE),
    };
  });
  etapes.forEach((e, i) => {
    const suivante = etapes[i + 1];
    e.duree_s = r3((suivante ? suivante.debut_s : DUREE) - e.debut_s);
    if (!['INTRO', 'FINALE'].includes(e.id)) {
      e.duree_min_s = DUREE_MIN[e.id] ?? DUREE_MIN.defaut;
      e.acceleree = e.duree_s < e.duree_min_s;
    }
  });

  const iPrix = mots.findIndex((m) => m === SOUS_ANCRE_PRIX);
  const prix = horodates[iPrix];

  // Phrases des sous-titres : une coupure à chaque balise et après chaque point.
  const coupures = new Set(ancres.map((a) => a.index));
  mots.forEach((m, i) => { if (/[.!?]$/.test(m) && i + 1 < mots.length) coupures.add(i + 1); });
  const debuts = [...coupures].sort((a, b) => a - b);
  const phrases = debuts.map((d, j) => {
    const f = (debuts[j + 1] ?? mots.length) - 1;
    return {
      texte: mots.slice(d, f + 1).join(' '),
      debut_s: r3(horodates[d].debut + DECALAGE),
      fin_mot_s: r3(horodates[f].fin + DECALAGE),
    };
  });

  const finVoix = r3(horodates[horodates.length - 1].fin + DECALAGE);
  const sortie = {
    note: 'Temps en secondes dans la vidéo. Début d’étape = début du premier mot dans l’alignement + 0,4 s (placement de la voix) - 0,2 s.',
    source_alignement: `voix-off_alignment.json, ${format}`,
    decalage_voix_s: DECALAGE,
    avance_s: AVANCE,
    duree_video_s: DUREE,
    fin_voix_s: finVoix,
    fin_voix_ok: finVoix < FIN_MAX,
    etapes,
    finale_prix: {
      id: 'FINALE_PRIX',
      premier_mot: SOUS_ANCRE_PRIX,
      mot_alignement_s: r3(prix.debut),
      mot_video_s: r3(prix.debut + DECALAGE),
      debut_s: r3(prix.debut + DECALAGE - AVANCE),
    },
    phrases: phrases.map((p) => ({ ...p, masquee: p.debut_s >= r3(prix.debut + DECALAGE - AVANCE) })),
  };
  fs.writeFileSync(FICHIER_TIMINGS, JSON.stringify(sortie, null, 2) + '\n');

  console.log(`timings.json écrit (${format}).`);
  for (const e of etapes) {
    const alerte = e.acceleree ? `  < ${e.duree_min_s} s : animation accélérée` : '';
    console.log(`  ${e.id.padEnd(9)} ${e.debut_s.toFixed(2).padStart(6)} s  (${e.premier_mot} à ${e.mot_video_s.toFixed(2)} s, durée ${e.duree_s.toFixed(2)} s)${alerte}`);
  }
  console.log(`  fin de la voix : ${finVoix.toFixed(2)} s ${finVoix < FIN_MAX ? '(avant 26,5 s)' : '(DÉPASSE 26,5 s)'}`);
  return sortie;
}

async function appeler(texte, modele, vitesse, cle) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOIX}/with-timestamps?output_format=mp3_44100_192`;
  const reponse = await fetch(url, {
    method: 'POST',
    headers: { 'xi-api-key': cle, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      text: texte,
      model_id: modele,
      voice_settings: { ...REGLAGES, speed: vitesse },
      seed: SEED,
    }),
  });
  const corps = await reponse.text();
  if (!reponse.ok) {
    const erreur = new Error(`ElevenLabs ${reponse.status} : ${corps.slice(0, 300)}`);
    erreur.statut = reponse.status;
    throw erreur;
  }
  return JSON.parse(corps);
}

async function generer() {
  const cle = process.env.ELEVENLABS_API_KEY;
  if (!cle) throw new Error('ELEVENLABS_API_KEY absente. Ajoute-la dans l’environnement, ou lance --calage sur un alignement existant.');
  const { texte } = decouper(TEXTE_BALISE);

  let modele = MODELES[0];
  for (const vitesse of VITESSES) {
    let brute;
    try {
      brute = await appeler(texte, modele, vitesse, cle);
    } catch (e) {
      if (modele === MODELES[0] && [400, 404, 422].includes(e.statut)) {
        console.log(`${modele} refusé (${e.statut}), passage à ${MODELES[1]}.`);
        modele = MODELES[1];
        brute = await appeler(texte, modele, vitesse, cle);
      } else throw e;
    }
    const fins = brute.alignment.character_end_times_seconds;
    const finVoix = fins[fins.length - 1] + DECALAGE;
    console.log(`Prise ${modele}, speed ${vitesse}, seed ${SEED} : dernier mot à ${finVoix.toFixed(2)} s dans la vidéo.`);

    fs.writeFileSync(FICHIER_MP3, Buffer.from(brute.audio_base64, 'base64'));
    // Réponse brute, alignement compris. L'audio part dans voix-off.mp3 pour garder le JSON lisible.
    const { audio_base64, ...reste } = brute;
    fs.writeFileSync(FICHIER_ALIGNEMENT, JSON.stringify({ ...reste, _prise: { modele, vitesse, seed: SEED, voix: VOIX } }, null, 2) + '\n');

    if (finVoix < FIN_MAX) return;
    console.log('La voix déborde de 26,5 s, nouvelle prise plus rapide.');
  }
  throw new Error('La voix déborde encore à speed 1.12 : raccourcir le texte n’est pas permis, à arbitrer.');
}

const seulementCalage = process.argv.includes('--calage');
try {
  if (!seulementCalage) await generer();
  calage();
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
