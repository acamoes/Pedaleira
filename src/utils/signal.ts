import type { EffectType, Pedal } from '../types'

export const SAMPLES = 96
const TWO_PI = Math.PI * 2

/** Sinal de entrada limpo (sinusóide). */
export function cleanSine(freq = 3): number[] {
  return Array.from({ length: SAMPLES }, (_, i) => Math.sin((i / SAMPLES) * TWO_PI * freq))
}

/** Amostra do array de entrada com wrap-around (suporta índices negativos). */
function at(input: number[], idx: number): number {
  const n = input.length
  return input[((Math.round(idx) % n) + n) % n]
}

const clamp1 = (v: number) => Math.max(-1, Math.min(1, v))

/**
 * Aplica o efeito de um tipo de pedal a um sinal de ENTRADA, devolvendo a saída.
 * Encadeável: o output de um pedal pode ser a entrada do seguinte.
 * `amount` (0..1) modula a intensidade (drive/mix...).
 */
export function applyEffect(type: EffectType, input: number[], amount = 0.5): number[] {
  const out = new Array<number>(SAMPLES)

  for (let i = 0; i < SAMPLES; i++) {
    const s = input[i]
    let y = s

    switch (type) {
      case 'overdrive': {
        const drive = 2 + amount * 3
        y = Math.tanh(s * drive) / Math.tanh(drive)
        break
      }
      case 'distortion': {
        const lim = 0.55 - amount * 0.2
        y = Math.max(-lim, Math.min(lim, s * 2.2)) / lim
        break
      }
      case 'fuzz':
        y = Math.sign(s) * (0.82 + 0.18 * Math.abs(s))
        break
      case 'boost':
        y = clamp1(s * (1 + amount * 0.6))
        break
      case 'delay':
        y = (s + 0.5 * at(input, i - 16) + 0.25 * at(input, i - 32) + 0.12 * at(input, i - 48)) / 1.4
        break
      case 'reverb': {
        let acc = s
        for (let t = 1; t <= 8; t++) acc += (0.35 / t) * at(input, i - t * 6)
        y = acc / 1.7
        break
      }
      case 'chorus':
        y = (s + at(input, i - 4)) / 2
        break
      case 'flanger':
        y = (s + at(input, i - 7)) / 2
        break
      case 'phaser':
        y = s * (0.55 + 0.45 * Math.sin((i / SAMPLES) * TWO_PI * 0.8))
        break
      case 'tremolo':
        y = s * (0.5 + 0.5 * Math.sin((i / SAMPLES) * TWO_PI * 2))
        break
      case 'compressor':
        y = Math.sign(s) * (0.45 + 0.45 * Math.abs(s))
        break
      case 'octaver':
        y = (s + 0.6 * at(input, i / 2)) / 1.5
        break
      case 'wah':
        y = s * (0.5 + 0.5 * Math.sin((i / SAMPLES) * TWO_PI * 1.2))
        break
      case 'EQ':
        y = clamp1((s + 0.25 * at(input, i * 2)) / 1.2)
        break
      default:
        y = s
    }
    out[i] = clamp1(y)
  }
  return out
}

/** Intensidade (0..1) derivada do knob mais relevante de um pedal. */
const INTENSITY_KNOBS = ['drive', 'gain', 'dist', 'distortion', 'fuzz', 'sustain', 'mix', 'depth', 'overdrive']
export function effectAmount(pedal: Pedal): number {
  const k = pedal.knobs.find((kn) => INTENSITY_KNOBS.includes(kn.name.toLowerCase()))
  if (!k) return 0.5
  const range = k.max - k.min || 1
  return Math.max(0, Math.min(1, (k.value - k.min) / range))
}

/** Encadeia o sinal por todos os pedais (na ordem dada). */
export function chainSignal(orderedPedals: Pedal[]): number[] {
  let sig = cleanSine()
  for (const p of orderedPedals) {
    sig = applyEffect(p.type, sig, effectAmount(p))
  }
  return sig
}

/** Converte um array de amostras [-1,1] num path SVG. */
export function samplesToPath(values: number[], w: number, h: number): string {
  const mid = h / 2
  const amp = h * 0.4
  return values
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${((i / (SAMPLES - 1)) * w).toFixed(1)} ${(mid - v * amp).toFixed(1)}`)
    .join(' ')
}
