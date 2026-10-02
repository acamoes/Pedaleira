import type { AmpData } from '../types'

// Base de dados local de amplificadores. Os controlos seguem o painel real,
// pela ordem em que aparecem (da esquerda para a direita).
export const SEED_AMPS: Record<string, AmpData> = {
  'fender frontman 10g': {
    brand: 'Fender',
    model: 'Frontman 10G',
    layout: 'frontman-10g',
    knobs: [
      { name: 'Gain',   min: 0, max: 10, default: 5 },
      { name: 'Volume', min: 0, max: 10, default: 4 },
      { name: 'Treble', min: 0, max: 10, default: 6 },
      { name: 'Bass',   min: 0, max: 10, default: 5 },
    ],
    // botão "Over-drive Select" (entre o Gain e o Volume no painel)
    switches: [{ name: 'Overdrive', default: false }],
  },
  'boss katana-mini': {
    brand: 'Boss',
    model: 'Katana-Mini',
    layout: 'katana-mini',
    knobs: [
      { name: 'Amp Type',    min: 1, max: 3, default: 3, step: 1, labels: ['Brown', 'Crunch', 'Clean'] },
      { name: 'Gain',        min: 0, max: 10, default: 4 },
      { name: 'Volume',      min: 0, max: 10, default: 4 },
      { name: 'Bass',        min: 0, max: 10, default: 5 },
      { name: 'Middle',      min: 0, max: 10, default: 5 },
      { name: 'Treble',      min: 0, max: 10, default: 5 },
      { name: 'Delay Time',  min: 0, max: 10, default: 3 },
      { name: 'Delay Level', min: 0, max: 10, default: 0 },
    ],
    switches: [],
  },
  'yamaha thr5': {
    brand: 'Yamaha',
    model: 'THR5',
    layout: 'thr5',
    knobs: [
      { name: 'Amp',    min: 1, max: 5, default: 1, step: 1, labels: ['Clean', 'Crunch', 'Lead', 'Brit Hi', 'Modern'] },
      { name: 'Gain',   min: 0, max: 10, default: 3 },
      { name: 'Master', min: 0, max: 10, default: 5 },
      { name: 'Tone',   min: 0, max: 10, default: 5 },
      // knobs de zonas: o tipo de efeito e a intensidade num só knob, 0 = desligado
      { name: 'Effect',       min: 0, max: 40, default: 0, zones: ['Chorus', 'Flanger', 'Phaser', 'Tremolo'] },
      { name: 'Delay/Reverb', min: 0, max: 40, default: 0, zones: ['Delay', 'Delay/Rev', 'Spring', 'Hall'] },
      { name: 'Volume', min: 0, max: 10, default: 5 },
    ],
    switches: [],
  },
}

/** Os amps do utilizador — entram em todos os Setups novos. */
export const DEFAULT_AMP_KEYS = ['fender frontman 10g', 'boss katana-mini', 'yamaha thr5']

/** Amp genérico editável, para modelos que não estão na base de dados. */
export function genericAmp(name: string): AmpData {
  return {
    brand: '',
    model: name.trim() || 'Amplificador',
    layout: 'generic',
    knobs: [
      { name: 'Gain',   min: 0, max: 10, default: 5 },
      { name: 'Volume', min: 0, max: 10, default: 5 },
      { name: 'Bass',   min: 0, max: 10, default: 5 },
      { name: 'Middle', min: 0, max: 10, default: 5 },
      { name: 'Treble', min: 0, max: 10, default: 5 },
    ],
    switches: [],
  }
}

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

const INDEX: Record<string, AmpData> = (() => {
  const idx: Record<string, AmpData> = {}
  for (const [key, amp] of Object.entries(SEED_AMPS)) {
    idx[normalize(key)] = amp
    idx[normalize(amp.model)] = amp
    idx[normalize(`${amp.brand} ${amp.model}`)] = amp
  }
  return idx
})()

/** Procura o amp na base de dados (tolerante a espaços/hífens/maiúsculas). */
export function findSeedAmp(name: string): AmpData | null {
  return INDEX[normalize(name)] ?? null
}

export const SEED_AMP_LIST: Array<{ key: string; label: string }> = Object.entries(SEED_AMPS)
  .map(([key, a]) => ({ key, label: `${a.brand} ${a.model}` }))
  .sort((a, b) => a.label.localeCompare(b.label))
