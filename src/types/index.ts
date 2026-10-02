// ─── Primitivos do pedal ─────────────────────────────────────────────────────

export interface Knob {
  name: string
  min: number
  max: number
  default: number
  value: number
  step?: number      // passo discreto (ex.: 1 para seletores); omisso = contínuo (0.1)
  labels?: string[]  // nomes das posições de um seletor (labels[value - min])
  // Knob "de zonas" (ex.: Effect do THR5): cada zona ocupa 10 unidades, 0 = desligado.
  // value 16 com zones [Chorus, Flanger…] = Flanger com intensidade 6. max = zones.length * 10.
  zones?: string[]
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

// ─── Ligações (patch cables) ─────────────────────────────────────────────────

// Uma ligação é um cabo de uma SAÍDA para uma ENTRADA.
// Fichas identificadas por string: 'guitar' (saída), 'amp' (entrada),
// '<pedalId>:out' (saída de pedal), '<pedalId>:in' (entrada de pedal).
export interface Connection {
  from: string   // ficha de saída: 'guitar' | '<pedalId>:out'
  to: string     // ficha de entrada: 'amp' | '<pedalId>:in'
}

// ─── Amplificador ────────────────────────────────────────────────────────────

/** Desenho do amp na board (painel e aspeto fiéis ao modelo real). */
export type AmpLayout = 'frontman-10g' | 'katana-mini' | 'thr5' | 'generic'

export interface Amp {
  id: string
  modelName: string
  brand: string
  model: string
  layout: AmpLayout
  knobs: Knob[]
  switches: PedalSwitch[]
}

/** Entrada da base de dados local de amps (como IdentifyPedalResponse para pedais). */
export interface AmpData {
  brand: string
  model: string
  layout: AmpLayout
  knobs: Array<Omit<Knob, 'value'>>
  switches: Array<{ name: string; default: boolean }>
}

// ─── Setup completo ──────────────────────────────────────────────────────────

export interface PedalboardSetup {
  id: string
  name: string
  pedals: Pedal[]
  connections: Connection[]   // cadeia montada manualmente (guitarra→…→amp)
  amps: Amp[]                  // amps que o utilizador tem (os 3 dele por defeito)
  activeAmpId: string          // Amp ativo: onde a Cadeia termina
  song?: SetupSong             // música para a qual esta board está regulada
  createdAt: number
  updatedAt: number
}

/** A Música de um Setup (mostrada como "Artista — Música"). */
export interface SetupSong {
  artist: string
  title: string
}

// ─── Respostas JSON da IA ────────────────────────────────────────────────────

export interface IdentifyPedalResponse {
  recognized: boolean
  brand: string
  model: string
  type: EffectType
  knobs: Array<{ name: string; min: number; max: number; default: number; step?: number; labels?: string[] }>
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
  // amp escolhido para a música (fica ativo) e a sua regulação
  amp?: {
    ampId: string
    knobs: Record<string, number>
    switches?: Record<string, boolean>
  }
  notes: string
  missing: string[]
}

// ─── Estado da store ─────────────────────────────────────────────────────────

export interface TuneResult {
  response: TunePedalsResponse
  appliedAt: number
}
