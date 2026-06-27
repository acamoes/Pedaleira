import type { IdentifyPedalResponse } from '../types'

// Pedais pré-reconhecidos — usados como fallback imediato antes de chamar a IA.
// A chave é o nome do modelo em lowercase, sem espaços extras.
export const SEED_PEDALS: Record<string, IdentifyPedalResponse> = {
  'ibanez tube screamer mini': {
    recognized: true,
    brand: 'Ibanez',
    model: 'Tube Screamer Mini',
    type: 'overdrive',
    knobs: [
      { name: 'Drive', min: 0, max: 10, default: 5 },
      { name: 'Tone',  min: 0, max: 10, default: 5 },
      { name: 'Level', min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'ibanez ts9 tube screamer': {
    recognized: true,
    brand: 'Ibanez',
    model: 'TS9 Tube Screamer',
    type: 'overdrive',
    knobs: [
      { name: 'Drive', min: 0, max: 10, default: 5 },
      { name: 'Tone',  min: 0, max: 10, default: 5 },
      { name: 'Level', min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'tube screamer': {
    recognized: true,
    brand: 'Ibanez',
    model: 'Tube Screamer',
    type: 'overdrive',
    knobs: [
      { name: 'Drive', min: 0, max: 10, default: 5 },
      { name: 'Tone',  min: 0, max: 10, default: 5 },
      { name: 'Level', min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'boss ds-1': {
    recognized: true,
    brand: 'Boss',
    model: 'DS-1 Distortion',
    type: 'distortion',
    color: '#d98a1f',
    knobs: [
      { name: 'Tone',  min: 0, max: 10, default: 5 },
      { name: 'Level', min: 0, max: 10, default: 5 },
      { name: 'Dist',  min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'ds-1': {
    recognized: true,
    brand: 'Boss',
    model: 'DS-1 Distortion',
    type: 'distortion',
    color: '#d98a1f',
    knobs: [
      { name: 'Tone',  min: 0, max: 10, default: 5 },
      { name: 'Level', min: 0, max: 10, default: 5 },
      { name: 'Dist',  min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'mxr carbon copy': {
    recognized: true,
    brand: 'MXR',
    model: 'Carbon Copy Analog Delay',
    type: 'delay',
    knobs: [
      { name: 'Mix',   min: 0, max: 10, default: 3 },
      { name: 'Regen', min: 0, max: 10, default: 3 },
      { name: 'Delay', min: 0, max: 10, default: 5 },
    ],
    switches: [{ name: 'Mod', default: false }],
  },
  'carbon copy': {
    recognized: true,
    brand: 'MXR',
    model: 'Carbon Copy Analog Delay',
    type: 'delay',
    knobs: [
      { name: 'Mix',   min: 0, max: 10, default: 3 },
      { name: 'Regen', min: 0, max: 10, default: 3 },
      { name: 'Delay', min: 0, max: 10, default: 5 },
    ],
    switches: [{ name: 'Mod', default: false }],
  },
  'strymon bigsky': {
    recognized: true,
    brand: 'Strymon',
    model: 'BigSky Reverb',
    type: 'reverb',
    knobs: [
      { name: 'Mix',    min: 0, max: 10, default: 5 },
      { name: 'Decay',  min: 0, max: 10, default: 5 },
      { name: 'Pre',    min: 0, max: 10, default: 3 },
      { name: 'Tone',   min: 0, max: 10, default: 5 },
      { name: 'Speed',  min: 0, max: 10, default: 5 },
      { name: 'Depth',  min: 0, max: 10, default: 5 },
    ],
    switches: [{ name: 'Infinite', default: false }],
  },
  'dunlop cry baby': {
    recognized: true,
    brand: 'Dunlop',
    model: 'GCB95 Cry Baby Wah',
    type: 'wah',
    knobs: [],
    switches: [],
  },
  'cry baby': {
    recognized: true,
    brand: 'Dunlop',
    model: 'GCB95 Cry Baby Wah',
    type: 'wah',
    knobs: [],
    switches: [],
  },
  'boss bd-2': {
    recognized: true,
    brand: 'Boss',
    model: 'BD-2 Blues Driver',
    type: 'overdrive',
    color: '#3a7ec0',
    knobs: [
      { name: 'Level', min: 0, max: 10, default: 5 },
      { name: 'Tone',  min: 0, max: 10, default: 5 },
      { name: 'Gain',  min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'bd-2': {
    recognized: true,
    brand: 'Boss',
    model: 'BD-2 Blues Driver',
    type: 'overdrive',
    knobs: [
      { name: 'Level', min: 0, max: 10, default: 5 },
      { name: 'Tone',  min: 0, max: 10, default: 5 },
      { name: 'Gain',  min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'electro-harmonix big muff': {
    recognized: true,
    brand: 'Electro-Harmonix',
    model: 'Big Muff Pi',
    type: 'fuzz',
    knobs: [
      { name: 'Volume',    min: 0, max: 10, default: 5 },
      { name: 'Tone',      min: 0, max: 10, default: 5 },
      { name: 'Sustain',   min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'big muff': {
    recognized: true,
    brand: 'Electro-Harmonix',
    model: 'Big Muff Pi',
    type: 'fuzz',
    knobs: [
      { name: 'Volume',    min: 0, max: 10, default: 5 },
      { name: 'Tone',      min: 0, max: 10, default: 5 },
      { name: 'Sustain',   min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'ibanez ts808': {
    recognized: true,
    brand: 'Ibanez',
    model: 'TS808 Tube Screamer',
    type: 'overdrive',
    color: '#3f8f4a',
    knobs: [
      { name: 'Overdrive', min: 0, max: 10, default: 5 },
      { name: 'Tone',      min: 0, max: 10, default: 5 },
      { name: 'Level',     min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'klon centaur': {
    recognized: true,
    brand: 'Klon',
    model: 'Centaur',
    type: 'overdrive',
    color: '#caa64a',
    knobs: [
      { name: 'Gain',    min: 0, max: 10, default: 4 },
      { name: 'Treble',  min: 0, max: 10, default: 5 },
      { name: 'Output',  min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'fulltone ocd': {
    recognized: true,
    brand: 'Fulltone',
    model: 'OCD Overdrive',
    type: 'overdrive',
    knobs: [
      { name: 'Volume', min: 0, max: 10, default: 5 },
      { name: 'Drive',  min: 0, max: 10, default: 5 },
      { name: 'Tone',   min: 0, max: 10, default: 5 },
    ],
    switches: [{ name: 'HP/LP', default: false }],
  },
  'proco rat 2': {
    recognized: true,
    brand: 'Pro Co',
    model: 'RAT 2 Distortion',
    type: 'distortion',
    knobs: [
      { name: 'Distortion', min: 0, max: 10, default: 5 },
      { name: 'Filter',     min: 0, max: 10, default: 5 },
      { name: 'Volume',     min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'electro-harmonix soul food': {
    recognized: true,
    brand: 'Electro-Harmonix',
    model: 'Soul Food',
    type: 'overdrive',
    color: '#c9c2b0',
    knobs: [
      { name: 'Volume', min: 0, max: 10, default: 5 },
      { name: 'Treble', min: 0, max: 10, default: 5 },
      { name: 'Drive',  min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'walrus audio julia': {
    recognized: true,
    brand: 'Walrus Audio',
    model: 'Julia Chorus/Vibrato',
    type: 'chorus',
    color: '#2f5d8f',
    knobs: [
      { name: 'Rate',  min: 0, max: 10, default: 5 },
      { name: 'Depth', min: 0, max: 10, default: 5 },
      { name: 'Lag',   min: 0, max: 10, default: 5 },
      { name: 'D-V',   min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'strymon timeline': {
    recognized: true,
    brand: 'Strymon',
    model: 'Timeline Delay',
    type: 'delay',
    color: '#5a8a3a',
    knobs: [
      { name: 'Time',     min: 0, max: 10, default: 5 },
      { name: 'Repeats',  min: 0, max: 10, default: 4 },
      { name: 'Mix',      min: 0, max: 10, default: 4 },
      { name: 'Filter',   min: 0, max: 10, default: 5 },
      { name: 'Grit',     min: 0, max: 10, default: 3 },
      { name: 'Speed',    min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'eventide h9': {
    recognized: true,
    brand: 'Eventide',
    model: 'H9 Multi-Effect',
    type: 'reverb',
    knobs: [
      { name: 'Mix',    min: 0, max: 10, default: 5 },
      { name: 'P1',     min: 0, max: 10, default: 5 },
      { name: 'P2',     min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'jhs morning glory': {
    recognized: true,
    brand: 'JHS',
    model: 'Morning Glory Overdrive',
    type: 'overdrive',
    color: '#d8d2c0',
    knobs: [
      { name: 'Volume', min: 0, max: 10, default: 5 },
      { name: 'Drive',  min: 0, max: 10, default: 5 },
      { name: 'Tone',   min: 0, max: 10, default: 5 },
    ],
    switches: [{ name: 'Bright', default: false }],
  },
  'wampler tumnus': {
    recognized: true,
    brand: 'Wampler',
    model: 'Tumnus Overdrive',
    type: 'overdrive',
    color: '#caa64a',
    knobs: [
      { name: 'Gain',   min: 0, max: 10, default: 4 },
      { name: 'Tone',   min: 0, max: 10, default: 5 },
      { name: 'Level',  min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'mxr phase 90': {
    recognized: true,
    brand: 'MXR',
    model: 'Phase 90',
    type: 'phaser',
    color: '#e08a1e',
    knobs: [
      { name: 'Speed', min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'boss re-2': {
    recognized: true,
    brand: 'Boss',
    model: 'RE-2 Space Echo',
    type: 'delay',
    color: '#c98a3a',
    knobs: [
      { name: 'Repeat Rate', min: 0, max: 10, default: 5 },
      { name: 'Intensity',   min: 0, max: 10, default: 4 },
      { name: 'Echo',        min: 0, max: 10, default: 4 },
      { name: 'Reverb',      min: 0, max: 10, default: 3 },
    ],
    switches: [],
  },
  'tc electronic polytune 3': {
    recognized: true,
    brand: 'TC Electronic',
    model: 'PolyTune 3 Tuner',
    type: 'tuner',
    knobs: [],
    switches: [],
  },
  'boss ch-1': {
    recognized: true,
    brand: 'Boss',
    model: 'CH-1 Super Chorus',
    type: 'chorus',
    knobs: [
      { name: 'EQ',    min: 0, max: 10, default: 5 },
      { name: 'Rate',  min: 0, max: 10, default: 5 },
      { name: 'Depth', min: 0, max: 10, default: 5 },
      { name: 'Level', min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'mxr dyna comp': {
    recognized: true,
    brand: 'MXR',
    model: 'Dyna Comp Compressor',
    type: 'compressor',
    knobs: [
      { name: 'Output',     min: 0, max: 10, default: 5 },
      { name: 'Sensitivity', min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'boss dd-3': {
    recognized: true,
    brand: 'Boss',
    model: 'DD-3 Digital Delay',
    type: 'delay',
    knobs: [
      { name: 'E.Level', min: 0, max: 10, default: 5 },
      { name: 'F.Back',  min: 0, max: 10, default: 3 },
      { name: 'D.Time',  min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'boss rv-6': {
    recognized: true,
    brand: 'Boss',
    model: 'RV-6 Reverb',
    type: 'reverb',
    knobs: [
      { name: 'E.Level', min: 0, max: 10, default: 5 },
      { name: 'Tone',    min: 0, max: 10, default: 5 },
      { name: 'Time',    min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },

  // ─── TC Electronic ─────────────────────────────────────────────────────────
  'tc electronic afterglow': {
    recognized: true,
    brand: 'TC Electronic',
    model: 'Afterglow Chorus',
    type: 'chorus',
    knobs: [
      { name: 'Speed', min: 0, max: 10, default: 5 },
      { name: 'Depth', min: 0, max: 10, default: 5 },
      { name: 'Level', min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'tc electronic hall of fame 2': {
    recognized: true,
    brand: 'TC Electronic',
    model: 'Hall of Fame 2 Reverb',
    type: 'reverb',
    knobs: [
      { name: 'Decay', min: 0, max: 10, default: 5 },
      { name: 'Tone',  min: 0, max: 10, default: 5 },
      { name: 'Level', min: 0, max: 10, default: 5 },
    ],
    switches: [{ name: 'MASH', default: false }],
  },
  'tc electronic dark matter': {
    recognized: true,
    brand: 'TC Electronic',
    model: 'Dark Matter Distortion',
    type: 'distortion',
    knobs: [
      { name: 'Drive',   min: 0, max: 10, default: 5 },
      { name: 'Level',   min: 0, max: 10, default: 5 },
      { name: 'Bass',    min: 0, max: 10, default: 5 },
      { name: 'Treble',  min: 0, max: 10, default: 5 },
    ],
    switches: [{ name: 'Voice', default: false }],
  },
  'tc electronic sub n up mini': {
    recognized: true,
    brand: 'TC Electronic',
    model: "Sub'N'Up Mini Octaver",
    type: 'octaver',
    knobs: [
      { name: 'Dry',  min: 0, max: 10, default: 5 },
      { name: 'Up',   min: 0, max: 10, default: 3 },
      { name: 'Sub',  min: 0, max: 10, default: 3 },
    ],
    switches: [],
  },
  'tc electronic flashback': {
    recognized: true,
    brand: 'TC Electronic',
    model: 'Flashback Delay',
    type: 'delay',
    knobs: [
      { name: 'Delay',    min: 0, max: 10, default: 5 },
      { name: 'Feedback', min: 0, max: 10, default: 3 },
      { name: 'Level',    min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'tc electronic forcefield': {
    recognized: true,
    brand: 'TC Electronic',
    model: 'Forcefield Compressor',
    type: 'compressor',
    knobs: [
      { name: 'Comp',  min: 0, max: 10, default: 5 },
      { name: 'Level', min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'tc electronic june-60': {
    recognized: true,
    brand: 'TC Electronic',
    model: 'June-60 Chorus',
    type: 'chorus',
    knobs: [
      { name: 'Rate',  min: 0, max: 10, default: 5 },
      { name: 'Depth', min: 0, max: 10, default: 5 },
      { name: 'Mix',   min: 0, max: 10, default: 5 },
    ],
    switches: [
      { name: 'I',  default: true },
      { name: 'II', default: false },
    ],
  },

  // ─── Boss ──────────────────────────────────────────────────────────────────
  'boss rc-30': {
    recognized: true,
    brand: 'Boss',
    model: 'RC-30 Loop Station',
    type: 'looper',
    knobs: [
      { name: 'Track 1', min: 0, max: 10, default: 7 },
      { name: 'Track 2', min: 0, max: 10, default: 7 },
      { name: 'Rhythm',  min: 0, max: 10, default: 3 },
    ],
    switches: [],
  },

  // ─── Pro Co ────────────────────────────────────────────────────────────────
  'proto rat': {
    recognized: true,
    brand: 'Pro Co',
    model: 'RAT 2 Distortion',
    type: 'distortion',
    knobs: [
      { name: 'Distortion', min: 0, max: 10, default: 5 },
      { name: 'Filter',     min: 0, max: 10, default: 5 },
      { name: 'Volume',     min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },

  // ─── Behringer ─────────────────────────────────────────────────────────────
  'behringer sf300': {
    recognized: true,
    brand: 'Behringer',
    model: 'SF300 Super Fuzz',
    type: 'fuzz',
    knobs: [
      { name: 'Level',  min: 0, max: 10, default: 5 },
      { name: 'Treble', min: 0, max: 10, default: 5 },
      { name: 'Bass',   min: 0, max: 10, default: 5 },
      { name: 'Gain',   min: 0, max: 10, default: 5 },
    ],
    switches: [{ name: 'Mode', default: false }],
  },
}

/** Normaliza um nome para comparação tolerante (ignora espaços, hífens, etc.). */
function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

// Índice normalizado: "Boss CH 1" e "boss ch-1" mapeiam para a mesma entrada.
const NORMALIZED_INDEX: Record<string, IdentifyPedalResponse> = (() => {
  const idx: Record<string, IdentifyPedalResponse> = {}
  for (const [key, pedal] of Object.entries(SEED_PEDALS)) {
    idx[normalize(key)] = pedal
    // também indexa por "marca + modelo" para tolerar nomes completos
    idx[normalize(`${pedal.brand} ${pedal.model}`)] = pedal
  }
  return idx
})()

/** Procura o pedal nos seeds, tolerante a espaços/hífens/maiúsculas. */
export function findSeedPedal(name: string): IdentifyPedalResponse | null {
  return NORMALIZED_INDEX[normalize(name)] ?? null
}

/** Lista de pedais reconhecidos (deduplicada) para o dropdown do modal. */
export const SEED_PEDAL_LIST: Array<{ key: string; label: string }> = (() => {
  const seen = new Map<string, { key: string; label: string }>()
  for (const [key, pedal] of Object.entries(SEED_PEDALS)) {
    const label = `${pedal.brand} ${pedal.model}`
    const existing = seen.get(label)
    // mantém a chave mais descritiva (mais longa) como referência canónica
    if (!existing || key.length > existing.key.length) {
      seen.set(label, { key, label })
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.label.localeCompare(b.label))
})()
