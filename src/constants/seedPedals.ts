import type { IdentifyPedalResponse } from '../types'

// Pedais pré-reconhecidos — usados como fallback imediato antes de chamar a IA.
// A chave é o nome do modelo em lowercase, sem espaços extras.
export const SEED_PEDALS: Record<string, IdentifyPedalResponse> = {
  'ibanez tube screamer mini': {
    recognized: true,
    brand: 'Ibanez',
    model: 'Tube Screamer Mini',
    type: 'overdrive',
    color: '#3f8f4a',
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
    color: '#3f8f4a',
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
    color: '#3f8f4a',
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
    color: '#2f6b4a',
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
    color: '#2f6b4a',
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
    color: '#b9c0c4',
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
    color: '#1e1e1e',
    knobs: [],
    switches: [],
  },
  'cry baby': {
    recognized: true,
    brand: 'Dunlop',
    model: 'GCB95 Cry Baby Wah',
    type: 'wah',
    color: '#1e1e1e',
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
    color: '#3a7ec0',
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
    color: '#b9b6ad',
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
    color: '#b9b6ad',
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
      { name: 'Drive',     min: 0, max: 10, default: 5 },
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
    color: '#c9b688',
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
    color: '#232323',
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
    color: '#ededed',
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
    color: '#3f454a',
    knobs: [],
    switches: [],
  },
  'boss ch-1': {
    recognized: true,
    brand: 'Boss',
    model: 'CH-1 Super Chorus',
    type: 'chorus',
    color: '#8fb8dd',
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
    color: '#b5312a',
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
    color: '#dcdcd4',
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
    color: '#8fbcc4',
    knobs: [
      { name: 'E.Level', min: 0, max: 10, default: 5 },
      { name: 'Tone',    min: 0, max: 10, default: 5 },
      { name: 'Time',    min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },

  // ─── TC Electronic ─────────────────────────────────────────────────────────
  'tc electronic forcefield': {
    recognized: true,
    brand: 'TC Electronic',
    model: 'Forcefield Compressor',
    type: 'compressor',
    color: '#7d8288',
    knobs: [
      { name: 'Sustain', min: 0, max: 10, default: 5 },
      { name: 'Attack',  min: 0, max: 10, default: 5 },
      { name: 'Level',   min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'tc electronic sub n up': {
    recognized: true,
    brand: 'TC Electronic',
    model: "Sub'N'Up Octaver",
    type: 'octaver',
    color: '#6b7075',
    knobs: [
      { name: 'Dry',   min: 0, max: 10, default: 5 },
      { name: 'Up',    min: 0, max: 10, default: 3 },
      { name: 'Sub',   min: 0, max: 10, default: 3 },
      { name: 'Sub 2', min: 0, max: 10, default: 0 },
      { name: 'Mode',  min: 1, max: 3, default: 1, step: 1, labels: ['Poly', 'TonePrint', 'Classic'] },
    ],
    switches: [],
  },
  'tc electronic dark matter': {
    recognized: true,
    brand: 'TC Electronic',
    model: 'Dark Matter Distortion',
    type: 'distortion',
    color: '#2c2f33',
    knobs: [
      { name: 'Gain',   min: 0, max: 10, default: 5 },
      { name: 'Bass',   min: 0, max: 10, default: 5 },
      { name: 'Treble', min: 0, max: 10, default: 5 },
      { name: 'Level',  min: 0, max: 10, default: 5 },
    ],
    switches: [{ name: 'Voice', default: false }],
  },
  'tc electronic 3rd dimension': {
    recognized: true,
    brand: 'TC Electronic',
    model: '3rd Dimension Chorus',
    type: 'chorus',
    // sem knobs: 4 botões de preset de chorus
    knobs: [],
    switches: [
      { name: '1', default: true },
      { name: '2', default: false },
      { name: '3', default: false },
      { name: '4', default: false },
    ],
  },
  'tc electronic afterglow': {
    recognized: true,
    brand: 'TC Electronic',
    model: 'Afterglow Chorus',
    type: 'chorus',
    color: '#b8bdbe',
    knobs: [
      { name: 'Rate',  min: 0, max: 10, default: 5 },
      { name: 'Depth', min: 0, max: 10, default: 5 },
      { name: 'Mix',   min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
  'tc electronic flashback 2': {
    recognized: true,
    brand: 'TC Electronic',
    model: 'Flashback 2 Delay',
    type: 'delay',
    color: '#4e8f57',
    knobs: [
      { name: 'Delay',    min: 0, max: 10, default: 5 },
      { name: 'Feedback', min: 0, max: 10, default: 3 },
      { name: 'Level',    min: 0, max: 10, default: 5 },
      {
        name: 'Type', min: 1, max: 12, default: 1, step: 1,
        labels: ['2290', 'Analog', 'Tape', 'Dynamic', 'Mod', 'Crystal', 'Reverse', 'Lo-Fi', 'TP1', 'TP2', 'TP3', 'Looper'],
      },
      { name: 'Subdiv', min: 1, max: 3, default: 1, step: 1, labels: ['¼', '⅛·', '¼+⅛·'] },
    ],
    switches: [{ name: 'MASH', default: false }],
  },
  'tc electronic hall of fame 2': {
    recognized: true,
    brand: 'TC Electronic',
    model: 'Hall of Fame 2 Reverb',
    type: 'reverb',
    color: '#3d7d5a',
    knobs: [
      { name: 'Decay', min: 0, max: 10, default: 5 },
      { name: 'Tone',  min: 0, max: 10, default: 5 },
      { name: 'Level', min: 0, max: 10, default: 5 },
      {
        name: 'Type', min: 1, max: 11, default: 2, step: 1,
        labels: ['Room', 'Hall', 'Spring', 'Plate', 'Church', 'Mod', 'Lo-Fi', 'Shimmer', 'TP1', 'TP2', 'TP3'],
      },
    ],
    switches: [
      { name: 'Pre-Delay Long', default: false },
      { name: 'MASH', default: false },
    ],
  },
  'tc electronic june-60': {
    recognized: true,
    brand: 'TC Electronic',
    model: 'June-60 Chorus',
    type: 'chorus',
    color: '#9aa4ad',
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
    color: '#2f9fa0',
    knobs: [
      { name: 'Track 1',      min: 0, max: 10, default: 7 },
      { name: 'Track 2',      min: 0, max: 10, default: 7 },
      { name: 'Mic Input',    min: 0, max: 10, default: 5 },
      { name: 'Rhythm Level', min: 0, max: 10, default: 3 },
      { name: 'Track Sel',    min: 1, max: 2, default: 1, step: 1, labels: ['1', '2'] },
      {
        name: 'Rhythm Type', min: 1, max: 10, default: 3, step: 1,
        labels: ['Hi-Hat', 'Kick+HH', 'Rock 1', 'Rock 2', 'Pop', 'Funk', 'Shuffle', 'R&B', 'Latin', 'Perc'],
      },
      { name: 'Tempo',        min: 40, max: 250, default: 120, step: 1 },
      { name: 'Memory',       min: 1, max: 99, default: 1, step: 1 },
      { name: 'Loop FX Type', min: 1, max: 10, default: 1, step: 1 },
    ],
    switches: [
      { name: 'Rhythm',  default: false },
      { name: 'Loop FX', default: false },
      { name: 'Phantom', default: false },
    ],
  },

  // ─── Joyo ──────────────────────────────────────────────────────────────────
  'joyo jf-11': {
    recognized: true,
    brand: 'Joyo',
    model: 'JF-11 6 Band EQ',
    type: 'EQ',
    // sliders em dB (±18), não knobs
    knobs: [
      { name: '100 Hz',  min: -18, max: 18, default: 0, step: 1 },
      { name: '200 Hz',  min: -18, max: 18, default: 0, step: 1 },
      { name: '400 Hz',  min: -18, max: 18, default: 0, step: 1 },
      { name: '800 Hz',  min: -18, max: 18, default: 0, step: 1 },
      { name: '1.6 kHz', min: -18, max: 18, default: 0, step: 1 },
      { name: '3.2 kHz', min: -18, max: 18, default: 0, step: 1 },
    ],
    switches: [],
  },

  // ─── Harley Benton ─────────────────────────────────────────────────────────
  'harley benton american truetone': {
    recognized: true,
    brand: 'Harley Benton',
    model: 'American TrueTone',
    type: 'overdrive',
    knobs: [
      { name: 'Low',   min: 0, max: 10, default: 5 },
      { name: 'Mid',   min: 0, max: 10, default: 5 },
      { name: 'High',  min: 0, max: 10, default: 5 },
      { name: 'Level', min: 0, max: 10, default: 5 },
      { name: 'Voice', min: 0, max: 10, default: 5 },
      { name: 'Drive', min: 0, max: 10, default: 4 },
    ],
    switches: [],
  },

  // ─── Mooer ─────────────────────────────────────────────────────────────────
  'mooer trelicopter': {
    recognized: true,
    brand: 'Mooer',
    model: 'Trelicopter Tremolo',
    type: 'tremolo',
    knobs: [
      { name: 'Speed', min: 0, max: 10, default: 5 },
      { name: 'Depth', min: 0, max: 10, default: 5 },
      { name: 'Bias',  min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },

  // ─── Pro Co ────────────────────────────────────────────────────────────────
  'proto rat': {
    recognized: true,
    brand: 'Pro Co',
    model: 'RAT 2 Distortion',
    type: 'distortion',
    color: '#232323',
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
    color: '#d5721f',
    knobs: [
      { name: 'Level',  min: 0, max: 10, default: 5 },
      { name: 'Treble', min: 0, max: 10, default: 5 },
      { name: 'Bass',   min: 0, max: 10, default: 5 },
      { name: 'Gain',   min: 0, max: 10, default: 5 },
    ],
    switches: [{ name: 'Mode', default: false }],
  },
}

// Nomes alternativos → chave canónica em SEED_PEDALS
const SEED_ALIASES: Record<string, string> = {
  "sub'n'up": 'tc electronic sub n up',
  'tc electronic sub n up mini': 'tc electronic sub n up',
  'tc electronic flashback': 'tc electronic flashback 2',
  'flashback 2': 'tc electronic flashback 2',
  'hall of fame 2': 'tc electronic hall of fame 2',
  'forcefield': 'tc electronic forcefield',
  'dark matter': 'tc electronic dark matter',
  '3rd dimension': 'tc electronic 3rd dimension',
  'afterglow': 'tc electronic afterglow',
  'ts9': 'ibanez ts9 tube screamer',
  'ts808': 'ibanez ts808',
  'joyo 6 band eq': 'joyo jf-11',
  'jf-11': 'joyo jf-11',
  'american truetone': 'harley benton american truetone',
  'trelicopter': 'mooer trelicopter',
  'rc-30': 'boss rc-30',
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
  for (const [alias, key] of Object.entries(SEED_ALIASES)) {
    idx[normalize(alias)] ??= SEED_PEDALS[key]
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
