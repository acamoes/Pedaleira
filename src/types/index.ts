// ─── Primitivos do pedal ─────────────────────────────────────────────────────

export interface Knob {
  name: string
  min: number
  max: number
  default: number
  value: number
}

export interface PedalSwitch {
  name: string
  value: boolean
  default: boolean
}

// ─── Tipos de efeito ─────────────────────────────────────────────────────────

export type EffectType =
  | 'overdrive'
  | 'distortion'
  | 'fuzz'
  | 'delay'
  | 'reverb'
  | 'chorus'
  | 'flanger'
  | 'phaser'
  | 'tremolo'
  | 'compressor'
  | 'octaver'
  | 'wah'
  | 'EQ'
  | 'boost'
  | 'looper'
  | 'tuner'
  | 'unknown'

// ─── Pedal na board ──────────────────────────────────────────────────────────

export interface Pedal {
  id: string
  modelName: string
  brand: string
  model: string
  type: EffectType
  knobs: Knob[]
  switches: PedalSwitch[]
  enabled: boolean
  recognized: boolean
  color: string    // hex da cor do corpo do pedal; '' = cor de papel
  x: number        // posição livre no canvas (px)
  y: number
}

// ─── Setup completo ──────────────────────────────────────────────────────────

export interface PedalboardSetup {
  id: string
  name: string
  pedals: Pedal[]
  createdAt: number
  updatedAt: number
}

// ─── Respostas JSON da IA ────────────────────────────────────────────────────

export interface IdentifyPedalResponse {
  recognized: boolean
  brand: string
  model: string
  type: EffectType
  knobs: Array<{ name: string; min: number; max: number; default: number }>
  switches: Array<{ name: string; default: boolean }>
  color?: string   // cor default do corpo (hex), se conhecida
}

export interface TunePedalsResponse {
  song: string
  artist: string
  settings: Array<{
    pedalId: string
    enabled: boolean
    knobs: Record<string, number>
    switches?: Record<string, boolean>
  }>
  notes: string
  missing: string[]
}

// ─── Estado da store ─────────────────────────────────────────────────────────

export interface TuneResult {
  response: TunePedalsResponse
  appliedAt: number
}
