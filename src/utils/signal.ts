import type { EffectType, Pedal } from '../types'

// ─── Onda do pedal ───────────────────────────────────────────────────────────
// Modelo (só visual) do que UM pedal faz, isoladamente, a uma nota limpa de guitarra,
// conforme os seus knobs e seletores. Cada tipo usa a vista que melhor o explica:
//   'close' — dois ciclos da nota (forma de onda: clipping, oitavas, ganho)
//   'long'  — a nota inteira no tempo (ecos, cauda, modulação, compressão)
//   'freq'  — curva de resposta em frequência, em dB (EQ, wah)
// A entrada é sempre a mesma nota; só muda o zoom. Na vista 'long' a portadora é
// "comprimida" (poucos ciclos) para a forma ser legível — o envelope é que conta.

export type PedalWave =
  | { kind: 'close' | 'long'; input: number[]; output: number[] }   // amostras em [-1, 1]
  | { kind: 'freq'; output: number[]; rangeDb: number }             // dB ao longo de 50 Hz…8 kHz

const TWO_PI = Math.PI * 2
const N_CLOSE = 120
const N_LONG = 260
const N_FREQ = 120

// ─── A nota de guitarra ──────────────────────────────────────────────────────

const CLOSE_AMP = 0.5   // folga para ganho/boost se verem acima da referência
const LONG_CYCLES = 26  // ciclos visíveis da portadora numa janela 'long' (esquemático)
const NOTE_ATTACK = 0.01
const NOTE_TAU = 0.4    // decaimento da nota, em "segundos" da nota

// Zoom de cada vista 'long': quantos segundos da nota cabem na janela.
// A nota é sempre a mesma; só muda o zoom (ecos/cauda pedem janela longa,
// modulação pede janela curta onde a nota ainda está a soar).
const Z_SPACE = 3      // delay, reverb, looper
const Z_DYN = 1.5      // compressor
const Z_MOD = 0.4      // chorus, flanger, phaser, tremolo

/** Forma de uma corda: fundamental + harmónicos; `bright` < 1 escurece. */
function string(theta: number, bright = 1): number {
  return (Math.sin(theta) + 0.35 * bright * Math.sin(2 * theta) + 0.15 * bright * bright * Math.sin(3 * theta)) / 1.25
}

/** Envelope da nota tocada (ataque rápido, decaimento exponencial), `sec` em segundos da nota. */
function noteEnv(sec: number): number {
  if (sec < 0) return 0
  if (sec < NOTE_ATTACK) return sec / NOTE_ATTACK
  return Math.exp(-(sec - NOTE_ATTACK) / NOTE_TAU)
}

/** A nota na janela 'long' (t em [0,1]) com zoom `z`; `pitch` multiplica a frequência, `bright` o timbre. */
function note(t: number, z: number, pitch = 1, bright = 1): number {
  return noteEnv(t * z) * string(TWO_PI * LONG_CYCLES * pitch * t, bright)
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i / (n - 1))
const clamp1 = (v: number) => Math.max(-1, Math.min(1, v))

// ─── Leitura dos knobs ───────────────────────────────────────────────────────

/** Valor 0..1 do primeiro knob cujo nome bate (exato, depois parcial); `def` se não houver. */
function kv(p: Pedal, names: string[], def = 0.5): number {
  const ks = p.knobs.map((k) => ({ n: k.name.toLowerCase(), k }))
  const hit = names.map((n) => ks.find((x) => x.n === n)).find(Boolean)
    ?? names.map((n) => ks.find((x) => x.n.includes(n))).find(Boolean)
  if (!hit) return def
  const { k } = hit
  return Math.max(0, Math.min(1, (k.value - k.min) / (k.max - k.min || 1)))
}

/** Posição atual (nome) de um seletor "Type"/"Mode", se o pedal tiver um. */
export function selectorLabel(p: Pedal): string | null {
  const k = p.knobs.find((x) => x.labels?.length && /^(type|mode)$/i.test(x.name))
  return k?.labels?.[Math.round(k.value - k.min)] ?? null
}

const sw = (p: Pedal, name: string) => p.switches.find((s) => s.name.toLowerCase() === name)?.value ?? false

// ─── Filtros simples sobre arrays periódicos (vista 'close') ────────────────

/** Passa-baixo de 1 polo, periódico (2 passagens para assentar). `a` 0..1, 1 = sem filtro. */
function lowpass(x: number[], a: number): number[] {
  const y = new Array<number>(x.length)
  let s = x[x.length - 1]
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < x.length; i++) { s += a * (x[i] - s); y[i] = s }
  }
  return y
}

/** Tonalidade graves/agudos (0..1, 0.5 = neutro) por divisão passa-baixo / resto. */
function tilt(x: number[], bass: number, treble: number): number[] {
  const lo = lowpass(x, 0.35)
  return x.map((v, i) => lo[i] * (0.4 + bass * 1.2) + (v - lo[i]) * (0.2 + treble * 1.6))
}

// ─── Vistas por tipo ─────────────────────────────────────────────────────────

function closeInput(): number[] {
  return range(N_CLOSE).map((t) => CLOSE_AMP * string(TWO_PI * 2 * t))
}

function gainStage(p: Pedal, type: EffectType): number[] {
  const x = closeInput()
  const drive = kv(p, ['drive', 'gain', 'overdrive', 'dist', 'distortion', 'fuzz', 'sustain'], 0.5)
  const level = 0.4 + kv(p, ['level', 'volume', 'output'], 0.5) * 1.2
  const voice = kv(p, ['voice'], 0.5)

  let y: number[]
  if (type === 'overdrive') {
    // clipping suave e simétrico; Voice torna o joelho mais duro
    const g = 0.6 + drive * 4
    const k = g * (1 + voice * 1.5)
    y = x.map((v) => Math.tanh(k * v) / Math.tanh(k * CLOSE_AMP) * CLOSE_AMP)
  } else if (type === 'distortion') {
    // clipping duro, ligeiramente assimétrico
    // limiar desce com o ganho; topos planos e cantos vivos
    const th = CLOSE_AMP * (0.75 - drive * 0.6)
    y = x.map((v) => Math.max(-th * 1.15, Math.min(th, v)) / th * CLOSE_AMP)
  } else {
    // fuzz: quase quadrada, com o topo a "afundar" um pouco
    const g = 6 + drive * 40
    y = x.map((v) => Math.tanh(g * v) * (0.85 + 0.15 * Math.abs(v) / CLOSE_AMP) * CLOSE_AMP)
  }

  const tone = kv(p, ['tone', 'treble', 'filter', 'high'], -1)
  const bass = kv(p, ['bass', 'low'], -1)
  if (bass >= 0 || p.knobs.some((k) => /^mid$/i.test(k.name))) {
    y = tilt(y, bass >= 0 ? bass : 0.5, tone >= 0 ? tone : 0.5)
  } else if (tone >= 0) {
    y = lowpass(y, 0.3 + tone * 0.7)
  }
  return y.map((v) => clamp1(v * level))
}

function boost(p: Pedal): number[] {
  const g = 1 + kv(p, ['level', 'gain', 'volume', 'output', 'boost'], 0.5) * 1.2
  return closeInput().map((v) => clamp1(v * g))
}

function octaver(p: Pedal): number[] {
  const dry = kv(p, ['dry', 'direct'], 0.5)
  const up = kv(p, ['up', 'oct up'], 0)
  const sub = kv(p, ['sub', 'down', 'oct down'], 0.5)
  const sub2 = kv(p, ['sub 2'], 0)
  const classic = selectorLabel(p) === 'Classic'
  const out = range(N_CLOSE).map((t) => {
    const th = TWO_PI * 2 * t
    const s1 = classic ? Math.tanh(5 * Math.sin(th / 2)) : Math.sin(th / 2)          // analógico = quadrada
    const s2 = classic ? Math.tanh(5 * Math.sin(th / 4)) : Math.sin(th / 4)
    const u = classic ? Math.abs(string(th)) * 2 - 0.7 : string(2 * th)               // retificado vs polifónico
    return CLOSE_AMP * (dry * string(th) + up * u + sub * s1 + sub2 * s2)
  })
  const peak = Math.max(...out.map(Math.abs))
  const norm = peak > 0.95 ? 0.95 / peak : 1
  return out.map((v) => v * norm)
}

function longInput(z: number): number[] {
  return range(N_LONG).map((t) => note(t, z))
}

interface DelayVoice { pitch: number; dark: number; reverse: boolean; wobble: number; lofi: boolean; duck: boolean; mod: boolean }

function delayVoice(label: string | null): DelayVoice {
  const v: DelayVoice = { pitch: 1, dark: 1, reverse: false, wobble: 0, lofi: false, duck: false, mod: false }
  switch (label) {
    case 'Analog':  v.dark = 0.45; break
    case 'Tape':    v.dark = 0.65; v.wobble = 0.004; break
    case 'Lo-Fi':   v.dark = 0.5; v.lofi = true; break
    case 'Crystal': v.pitch = 2; break
    case 'Reverse': v.reverse = true; break
    case 'Dynamic': v.duck = true; break
    case 'Mod':     v.mod = true; break
  }
  return v
}

function delay(p: Pedal): number[] {
  const label = selectorLabel(p)
  if (label === 'Looper') return looper(p)
  const time = kv(p, ['delay', 'time', 'd.time', 'repeat rate'], 0.5)
  const fb = kv(p, ['feedback', 'regen', 'f.back', 'repeats', 'intensity'], 0.4) * 0.85
  const mix = kv(p, ['level', 'mix', 'e.level', 'echo'], 0.5) * 1.1
  const D = (0.25 + time * 1.0) / Z_SPACE     // tempo de delay em fração da janela
  const voice = delayVoice(label)

  // Subdivisão (Flashback 2): ¼ → D, ⅛· → 0.75·D, ambas → as duas
  const sub = p.knobs.find((k) => k.name === 'Subdiv')
  const subPos = sub ? Math.round(sub.value - sub.min) : 0
  const taps = subPos === 1 ? [0.75 * D] : subPos === 2 ? [0.75 * D, D] : [D]

  return range(N_LONG).map((t) => {
    const dry = note(t, Z_SPACE)
    let wet = 0
    for (const tap of taps) {
      for (let n = 1; n <= 12; n++) {
        const gain = mix * Math.pow(fb, n - 1) / taps.length
        if (gain < 0.01) break
        let u = t - n * tap + voice.wobble * Math.sin(TWO_PI * 3 * t)
        if (u < 0) continue
        if (voice.reverse) {
          const L = 0.6 / Z_SPACE
          if (u > L) continue
          u = L - u     // a repetição toca ao contrário (cresce em vez de decair)
        }
        wet += gain * note(u, Z_SPACE, voice.pitch, Math.pow(voice.dark, n))
      }
    }
    if (voice.mod) wet *= 1 + 0.25 * Math.sin(TWO_PI * 5 * t)
    if (voice.duck) wet *= 1 - 0.75 * noteEnv(t * Z_SPACE)
    let y = dry + wet
    if (voice.lofi) y = Math.round(y * 4) / 4
    return clamp1(y)
  })
}

interface ReverbVoice { decay: number; bright: number; shimmer: boolean; mod: number; spring: boolean; lofi: boolean }

function reverbVoice(label: string | null): ReverbVoice {
  const v: ReverbVoice = { decay: 1, bright: 1, shimmer: false, mod: 0, spring: false, lofi: false }
  switch (label) {
    case 'Room':    v.decay = 0.4; break
    case 'Spring':  v.decay = 0.7; v.spring = true; break
    case 'Plate':   v.decay = 0.85; v.bright = 1.3; break
    case 'Church':  v.decay = 1.7; break
    case 'Mod':     v.mod = 0.35; break
    case 'Lo-Fi':   v.decay = 0.8; v.bright = 0.5; v.lofi = true; break
    case 'Shimmer': v.decay = 1.3; v.shimmer = true; break
  }
  return v
}

function reverb(p: Pedal): number[] {
  const voice = reverbVoice(selectorLabel(p))
  const decay = kv(p, ['decay', 'time', 'reverb'], 0.5)
  const mix = kv(p, ['level', 'mix', 'e.level'], 0.5) * 0.9
  const tone = kv(p, ['tone'], 0.5)
  const preDelay = (sw(p, 'pre-delay long') ? 0.2 : 0.04) / Z_SPACE
  const tau = (0.25 + decay * 1.6) * voice.decay / Z_SPACE
  const bright = Math.min(1.3, (0.3 + tone) * voice.bright)

  return range(N_LONG).map((t) => {
    const u = t - preDelay
    let tail = 0
    if (u > 0) {
      // reflexões densas: portadoras ligeiramente desafinadas = "lavagem" irregular
      const th = TWO_PI * LONG_CYCLES * u * (voice.shimmer ? 2 : 1)
      const wash = (string(th, bright) + string(th * 1.031 + 1.7, bright) + string(th * 0.967 + 4.1, bright)) / 2.2
      const env = (1 - Math.exp(-u / 0.03)) * Math.exp(-u / tau)
      let a = mix * env
      if (voice.spring) a *= 1 + 0.6 * Math.sin(TWO_PI * 9 * u)
      if (voice.mod) a *= 1 + voice.mod * Math.sin(TWO_PI * 4 * u)
      tail = a * wash
    }
    let y = note(t, Z_SPACE) + tail
    if (voice.lofi) y = Math.round(y * 4) / 4
    return clamp1(y)
  })
}

/** Chorus/flanger/phaser: a nota somada a uma cópia com fase modulada (filtro em pente a varrer). */
function modulation(p: Pedal, type: EffectType): number[] {
  let rate = kv(p, ['rate', 'speed'], 0.5)
  let depth = kv(p, ['depth', 'd-v'], 0.5)
  const mix = kv(p, ['mix', 'level', 'e.level'], 0.5)

  // 3rd Dimension: 4 botões de preset, do mais suave ao mais intenso
  const preset = ['4', '3', '2', '1'].find((n) => sw(p, n))
  if (preset && !p.knobs.length) { depth = 0.25 * Number(preset); rate = 0.15 + 0.1 * Number(preset) }

  const cycles = 0.6 + rate * 2.5                               // ciclos de LFO na janela
  if (type === 'phaser' && !p.knobs.some((k) => /depth/i.test(k.name))) depth = 0.9   // Phase 90: só Speed
  const span = type === 'phaser' ? Math.PI : type === 'flanger' ? Math.PI * 1.6 : 1.8
  const base = type === 'chorus' ? 0.3 : 0
  const wet = type === 'chorus' ? 0.35 + mix * 0.5 : 0.5 + mix * 0.4
  const fb = type === 'flanger' ? 0.35 + kv(p, ['regen', 'feedback', 'resonance'], 0.5) * 0.4 : 0

  return range(N_LONG).map((t) => {
    const th = TWO_PI * LONG_CYCLES * t
    const phi = base + span * depth * (0.5 + 0.5 * Math.sin(TWO_PI * cycles * t))
    const y = noteEnv(t * Z_MOD) * (string(th) + wet * string(th + phi) + fb * string(th + 2 * phi)) / (1 + wet + fb) * 1.15
    return clamp1(y)
  })
}

function tremolo(p: Pedal): number[] {
  const cycles = 1.5 + kv(p, ['speed', 'rate'], 0.5) * 4.5
  const depth = kv(p, ['depth', 'intensity'], 0.6)
  const bias = kv(p, ['bias', 'shape'], 0.5)
  return range(N_LONG).map((t) => {
    // Bias desloca o ponto de equilíbrio do LFO (mais tempo em cima ou em baixo)
    const lfo = 0.5 + 0.5 * Math.sin(TWO_PI * cycles * t)
    const shaped = Math.pow(lfo, 0.35 + (1 - bias) * 1.3)
    return note(t, Z_MOD) * (1 - depth * (1 - shaped))
  })
}

function compressor(p: Pedal): number[] {
  const amount = kv(p, ['sustain', 'comp', 'sens', 'sensitivity', 'ratio'], 0.5)
  const level = 0.5 + kv(p, ['level', 'output', 'volume'], 0.5)
  const attack = kv(p, ['attack'], 0.3) * 0.08
  return range(N_LONG).map((t) => {
    const sec = t * Z_DYN
    const e = noteEnv(sec)
    const squash = 1 - amount * 0.8
    let ec = Math.pow(e, squash)                         // envelope achatado: menos picos, mais sustain
    if (sec < NOTE_ATTACK + attack) ec = Math.max(ec, e) // ataque lento deixa passar o transiente
    const g = e > 1e-4 ? ec / e : 0
    return clamp1(note(t, Z_DYN) * g * level * 0.85)
  })
}

function looper(p: Pedal): number[] {
  const t1 = kv(p, ['track 1'], 0.7)
  const t2 = kv(p, ['track 2'], 0.7)
  const L = 1 / 3
  const rhythm = sw(p, 'rhythm') ? 0.25 + kv(p, ['rhythm level'], 0.3) * 0.5 : 0
  return range(N_LONG).map((t) => {
    const u = t % L
    let y = (t1 * note(u, Z_SPACE) + t2 * 0.4 * note((u + L / 2) % L, Z_SPACE)) * 0.9
    // batida de ritmo: pequenos impulsos a cada colcheia
    const beat = (t * 8) % 1
    if (rhythm && beat < 0.04) y += rhythm * Math.sin(TWO_PI * beat * 50)
    return clamp1(y)
  })
}

// ─── Vista de frequência (EQ, wah) ───────────────────────────────────────────

const F_LO = 50, F_HI = 8000
const freqAt = (x: number) => F_LO * Math.pow(F_HI / F_LO, x)

/** Banda peaking aproximada (gaussiana em oitavas). */
function bell(f: number, f0: number, gainDb: number, octaves: number): number {
  const d = Math.log2(f / f0)
  return gainDb * Math.exp(-(d * d) / (2 * octaves * octaves))
}

// "100 Hz", "1.6 kHz" → Hz
export function bandFreq(name: string): number | null {
  const m = name.match(/^([\d.]+)\s*(k?)hz$/i)
  return m ? parseFloat(m[1]) * (m[2] ? 1000 : 1) : null
}

const NAMED_BANDS: Array<{ re: RegExp; f: number }> = [
  { re: /^(bass|low)$/i, f: 100 },
  { re: /^(mid|middle)$/i, f: 800 },
  { re: /^(treble|high)$/i, f: 4000 },
  { re: /^(presence)$/i, f: 6000 },
]

function eq(p: Pedal): { output: number[]; rangeDb: number } {
  const bands: Array<{ f: number; db: number; oct: number }> = []
  let rangeDb = 12
  for (const k of p.knobs) {
    const hz = bandFreq(k.name)
    if (hz !== null) {
      bands.push({ f: hz, db: k.value, oct: 0.55 })     // sliders já estão em dB
      rangeDb = Math.max(rangeDb, Math.abs(k.min), Math.abs(k.max))
      continue
    }
    const named = NAMED_BANDS.find((b) => b.re.test(k.name))
    if (named) {
      const n = (k.value - k.min) / (k.max - k.min || 1)
      bands.push({ f: named.f, db: (n - 0.5) * 24, oct: 1.1 })
    }
  }
  const lvl = p.knobs.find((k) => /^(level|volume|output)$/i.test(k.name))
  const offset = lvl ? ((lvl.value - lvl.min) / (lvl.max - lvl.min || 1) - 0.5) * 12 : 0
  const output = range(N_FREQ).map((x) => {
    const f = freqAt(x)
    return offset + bands.reduce((acc, b) => acc + bell(f, b.f, b.db, b.oct), 0)
  })
  return { output, rangeDb }
}

function wah(p: Pedal): { output: number[]; rangeDb: number } {
  const pos = kv(p, ['position', 'freq', 'sweep', 'range'], 0.5)
  const q = kv(p, ['q', 'resonance', 'peak'], 0.6)
  const f0 = 400 * Math.pow(5, pos)                 // ~400 Hz (calcanhar) … 2 kHz (ponta)
  const output = range(N_FREQ).map((x) => bell(freqAt(x), f0, 10 + q * 8, 0.35 - q * 0.15) - 6)
  return { output, rangeDb: 18 }
}

// ─── Entrada principal ───────────────────────────────────────────────────────

export function pedalWave(p: Pedal): PedalWave {
  switch (p.type) {
    case 'overdrive':
    case 'distortion':
    case 'fuzz':
      return { kind: 'close', input: closeInput(), output: gainStage(p, p.type) }
    case 'boost':
      return { kind: 'close', input: closeInput(), output: boost(p) }
    case 'octaver':
      return { kind: 'close', input: closeInput(), output: octaver(p) }
    case 'delay':
      return { kind: 'long', input: longInput(Z_SPACE), output: delay(p) }
    case 'reverb':
      return { kind: 'long', input: longInput(Z_SPACE), output: reverb(p) }
    case 'chorus':
    case 'flanger':
    case 'phaser':
      return { kind: 'long', input: longInput(Z_MOD), output: modulation(p, p.type) }
    case 'tremolo':
      return { kind: 'long', input: longInput(Z_MOD), output: tremolo(p) }
    case 'compressor':
      return { kind: 'long', input: longInput(Z_DYN), output: compressor(p) }
    case 'looper':
      return { kind: 'long', input: longInput(Z_SPACE), output: looper(p) }
    case 'EQ':
      return { kind: 'freq', ...eq(p) }
    case 'wah':
      return { kind: 'freq', ...wah(p) }
    default:
      // afinador / desconhecido: o som passa sem alteração
      return { kind: 'close', input: closeInput(), output: closeInput() }
  }
}

/** Converte amostras em [-1,1] num path SVG. */
export function samplesToPath(values: number[], w: number, h: number): string {
  const mid = h / 2
  const amp = h * 0.46
  const last = values.length - 1
  return values
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${((i / last) * w).toFixed(1)} ${(mid - v * amp).toFixed(1)}`)
    .join(' ')
}
