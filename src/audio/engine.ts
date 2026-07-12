import type { Pedal, EffectType } from '../types'

/**
 * Motor de áudio (Web Audio API).
 * - Sintetiza um "strum" de guitarra (acorde de Mi maior, cordas dedilhadas via
 *   Karplus-Strong).
 * - Constrói uma cadeia de nós de áudio que espelha os pedais LIGADOS, pela ordem.
 * - Expõe um AnalyserNode na saída para visualização em tempo real.
 *
 * É uma emulação estilizada: serve para perceber a influência relativa dos pedais,
 * não para reproduzir o hardware com fidelidade.
 */

let ctx: AudioContext | null = null
let analyser: AnalyserNode | null = null
let masterOut: GainNode | null = null
let currentChainOut: AudioNode | null = null
let runningOscs: OscillatorNode[] = []

function getCtx(): AudioContext {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new AC()
    // ── Saída ("amplificador"): cadeia de tom quente para tirar a estridência ──
    // 1) highpass leve para limpar rumble
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 90
    // 2) speaker low-pass mais fechado (corta os agudos ásperos)
    const speaker = ctx.createBiquadFilter()
    speaker.type = 'lowpass'
    speaker.frequency.value = 3200
    speaker.Q.value = 0.5
    // 3) high-shelf negativo a suavizar ainda mais o topo
    const tilt = ctx.createBiquadFilter()
    tilt.type = 'highshelf'
    tilt.frequency.value = 2600
    tilt.gain.value = -6
    masterOut = ctx.createGain()
    masterOut.gain.value = 0.5
    analyser = ctx.createAnalyser()
    analyser.fftSize = 2048
    hp.connect(speaker); speaker.connect(tilt); tilt.connect(masterOut)
    masterOut.connect(analyser)
    analyser.connect(ctx.destination)
    // o ponto de entrada da saída é o highpass
    ;(getCtx as unknown as { _speaker?: AudioNode })._speaker = hp
  }
  return ctx
}

function getSpeakerIn(): AudioNode {
  getCtx()
  return (getCtx as unknown as { _speaker: AudioNode })._speaker
}

export function getAnalyser(): AnalyserNode | null {
  return analyser
}

// ─── Síntese de cordas (Karplus-Strong) ──────────────────────────────────────

const pluckCache = new Map<number, AudioBuffer>()

function makePluck(frequency: number, duration = 3.4): AudioBuffer {
  const c = getCtx()
  const key = Math.round(frequency)
  const cached = pluckCache.get(key)
  if (cached) return cached

  const sr = c.sampleRate
  const n = Math.floor(sr * duration)
  const buf = c.createBuffer(1, n, sr)
  const data = buf.getChannelData(0)
  const N = Math.max(2, Math.round(sr / frequency))
  const decay = 0.9975   // sustain

  // excitação: ruído SUAVIZADO (pré-low-pass) → menos brilho/estridência inicial
  const exc = new Float32Array(N)
  let s = 0
  for (let i = 0; i < N; i++) {
    const white = Math.random() * 2 - 1
    s += 0.18 * (white - s)   // one-pole low-pass do ruído
    exc[i] = s
  }
  // normaliza a excitação
  let peak = 0
  for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(exc[i]))
  if (peak > 0) for (let i = 0; i < N; i++) exc[i] /= peak
  for (let i = 0; i < N; i++) data[i] = exc[i]

  // recorrência KS com amortecimento extra (one-pole) → tom mais quente/mellow
  let lp = 0
  const damp = 0.5   // 0 = muito brilhante, 1 = muito abafado
  for (let i = N; i < n; i++) {
    const j = i - N
    const avg = 0.5 * (data[j] + data[j > 0 ? j - 1 : 0])
    lp += damp * (avg - lp)        // suaviza os agudos a cada volta
    data[i] = decay * lp
  }

  // ataque suave (remove o transiente abrupto que soa "estridente")
  const atk = Math.floor(sr * 0.006)
  for (let i = 0; i < atk; i++) data[i] *= i / atk
  // fade-out final para evitar clique
  const fade = Math.floor(sr * 0.18)
  for (let i = 0; i < fade; i++) data[n - 1 - i] *= i / fade

  pluckCache.set(key, buf)
  return buf
}

// Acorde de Mi maior em cordas soltas (afinação standard, E major shape)
const E_MAJOR = [82.41, 123.47, 164.81, 207.65, 246.94, 329.63]

// ─── Utilidades de knobs ──────────────────────────────────────────────────────

function knob(p: Pedal, names: string[], fallback: number): number {
  const lower = p.knobs.map((k) => ({ n: k.name.toLowerCase(), v: k.value }))
  for (const name of names) {
    const exact = lower.find((k) => k.n === name)
    if (exact) return exact.v
  }
  for (const name of names) {
    const part = lower.find((k) => k.n.includes(name))
    if (part) return part.v
  }
  return fallback
}
const norm = (v: number) => Math.max(0, Math.min(1, v / 10))

// ─── Construtores de nós por tipo de efeito ──────────────────────────────────

interface FxNode { input: AudioNode; output: AudioNode; oscs?: OscillatorNode[] }

function makeDistortionCurve(type: EffectType, amount: number) {
  const N = 1024
  const curve = new Float32Array(N)
  const k = 1 + amount * (type === 'fuzz' ? 30 : type === 'distortion' ? 18 : 8)
  for (let i = 0; i < N; i++) {
    const x = (i / (N - 1)) * 2 - 1
    if (type === 'fuzz') {
      curve[i] = Math.sign(x) * Math.pow(Math.abs(Math.tanh(x * k)), 0.6)
    } else if (type === 'distortion') {
      const y = Math.tanh(x * k)
      curve[i] = Math.max(-0.9, Math.min(0.9, y * 1.1)) / 0.9
    } else {
      curve[i] = Math.tanh(x * k) / Math.tanh(k)
    }
  }
  return curve
}

function buildDrive(c: AudioContext, p: Pedal): FxNode {
  const amount = norm(knob(p, ['drive', 'gain', 'dist', 'distortion', 'fuzz', 'sustain'], 5))
  const level = norm(knob(p, ['level', 'volume', 'output'], 5))
  const tone = norm(knob(p, ['tone', 'treble', 'filter'], 5))

  const pre = c.createGain()
  pre.gain.value = 0.6 + amount * 1.4
  const ws = c.createWaveShaper()
  ws.curve = makeDistortionCurve(p.type, amount)
  ws.oversample = '2x'
  const toneFilter = c.createBiquadFilter()
  toneFilter.type = 'lowpass'
  toneFilter.frequency.value = 800 + tone * 6000
  const post = c.createGain()
  post.gain.value = 0.4 + level * 0.8

  pre.connect(ws); ws.connect(toneFilter); toneFilter.connect(post)
  return { input: pre, output: post }
}

function buildDelay(c: AudioContext, p: Pedal): FxNode {
  const time = 0.05 + norm(knob(p, ['delay', 'time', 'd.time', 'repeat rate'], 5)) * 0.65
  const fbAmt = norm(knob(p, ['regen', 'feedback', 'f.back', 'repeats', 'intensity'], 4)) * 0.85
  const mix = norm(knob(p, ['mix', 'e.level', 'echo', 'level'], 4))

  const input = c.createGain()
  const out = c.createGain()
  const delay = c.createDelay(2)
  delay.delayTime.value = time
  const fb = c.createGain(); fb.gain.value = fbAmt
  const wet = c.createGain(); wet.gain.value = mix

  input.connect(out)                 // dry
  input.connect(delay)
  delay.connect(wet); wet.connect(out)
  delay.connect(fb); fb.connect(delay)
  return { input, output: out }
}

function makeImpulse(c: AudioContext, seconds: number): AudioBuffer {
  const sr = c.sampleRate
  const len = Math.max(1, Math.floor(sr * seconds))
  const buf = c.createBuffer(2, len, sr)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5)
  }
  return buf
}

function buildReverb(c: AudioContext, p: Pedal): FxNode {
  const decay = 0.6 + norm(knob(p, ['decay', 'time', 'reverb'], 5)) * 3.5
  const mix = norm(knob(p, ['mix', 'e.level', 'level'], 5))
  const input = c.createGain()
  const out = c.createGain()
  const conv = c.createConvolver()
  conv.buffer = makeImpulse(c, decay)
  const wet = c.createGain(); wet.gain.value = mix

  input.connect(out)
  input.connect(conv); conv.connect(wet); wet.connect(out)
  return { input, output: out }
}

function buildModulation(c: AudioContext, p: Pedal): FxNode {
  // chorus / flanger — modulação mais profunda e audível
  const rate = 0.2 + norm(knob(p, ['rate', 'speed'], 5)) * 4
  // profundidade (swing do delay) bem maior: chorus ~3..11ms, flanger ~1..5ms
  const depthMs = (p.type === 'flanger' ? 2.5 : 5.5) * (0.4 + norm(knob(p, ['depth'], 6)))
  const baseMs = p.type === 'flanger' ? 5 : 18
  // mix forte por defeito para o efeito "respirar"; Level/Mix ajustam
  const mix = 0.55 + norm(knob(p, ['mix', 'd-v', 'level'], 5)) * 0.45

  const input = c.createGain()
  const out = c.createGain()
  const delay = c.createDelay(0.1)
  delay.delayTime.value = baseMs / 1000
  const lfo = c.createOscillator()
  lfo.type = 'triangle'   // varrimento mais suave que a sinusóide
  lfo.frequency.value = rate
  const lfoGain = c.createGain(); lfoGain.gain.value = depthMs / 1000
  const wet = c.createGain(); wet.gain.value = mix
  // realimentação ligeira → engrossa o flanger/chorus
  const fb = c.createGain(); fb.gain.value = p.type === 'flanger' ? 0.35 : 0.15

  lfo.connect(lfoGain); lfoGain.connect(delay.delayTime)
  input.connect(out)                      // dry
  input.connect(delay); delay.connect(wet); wet.connect(out)
  delay.connect(fb); fb.connect(delay)    // feedback
  return { input, output: out, oscs: [lfo] }
}

function buildPhaser(c: AudioContext, p: Pedal): FxNode {
  const rate = 0.1 + norm(knob(p, ['rate', 'speed'], 5)) * 2
  const input = c.createGain()
  const out = c.createGain()
  const stages: BiquadFilterNode[] = []
  for (let i = 0; i < 4; i++) {
    const ap = c.createBiquadFilter()
    ap.type = 'allpass'
    ap.frequency.value = 400 + i * 250
    stages.push(ap)
  }
  const lfo = c.createOscillator(); lfo.frequency.value = rate
  const lfoGain = c.createGain(); lfoGain.gain.value = 300
  lfo.connect(lfoGain)
  stages.forEach((ap) => lfoGain.connect(ap.frequency))

  let cur: AudioNode = input
  stages.forEach((ap) => { cur.connect(ap); cur = ap })
  const wet = c.createGain(); wet.gain.value = 0.6
  cur.connect(wet); wet.connect(out)
  input.connect(out) // dry
  return { input, output: out, oscs: [lfo] }
}

function buildTremolo(c: AudioContext, p: Pedal): FxNode {
  const rate = 0.5 + norm(knob(p, ['rate', 'speed'], 5)) * 8
  const depth = norm(knob(p, ['depth'], 6))
  const amp = c.createGain()
  amp.gain.value = 1 - depth * 0.5
  const lfo = c.createOscillator(); lfo.frequency.value = rate
  const lfoGain = c.createGain(); lfoGain.gain.value = depth * 0.5
  lfo.connect(lfoGain); lfoGain.connect(amp.gain)
  return { input: amp, output: amp, oscs: [lfo] }
}

function buildWah(c: AudioContext): FxNode {
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 700
  bp.Q.value = 4
  const lfo = c.createOscillator(); lfo.frequency.value = 1.2
  const lfoGain = c.createGain(); lfoGain.gain.value = 500
  lfo.connect(lfoGain); lfoGain.connect(bp.frequency)
  return { input: bp, output: bp, oscs: [lfo] }
}

function buildCompressor(c: AudioContext, p: Pedal): FxNode {
  const comp = c.createDynamicsCompressor()
  const amount = norm(knob(p, ['comp', 'sens', 'sustain'], 5))
  comp.threshold.value = -10 - amount * 30
  comp.ratio.value = 3 + amount * 9
  comp.attack.value = 0.003
  comp.release.value = 0.25
  const makeup = c.createGain(); makeup.gain.value = 1 + amount * 0.8
  comp.connect(makeup)
  return { input: comp, output: makeup }
}

function buildBoost(c: AudioContext, p: Pedal): FxNode {
  const g = c.createGain()
  g.gain.value = 1 + norm(knob(p, ['level', 'gain', 'volume', 'output'], 5)) * 2
  return { input: g, output: g }
}

function buildEQ(c: AudioContext, p: Pedal): FxNode {
  const f = c.createBiquadFilter()
  f.type = 'highshelf'
  f.frequency.value = 2000
  f.gain.value = (norm(knob(p, ['treble', 'tone', 'eq'], 5)) - 0.5) * 24
  return { input: f, output: f }
}

function buildOctaver(c: AudioContext, p: Pedal): FxNode {
  // aproximação: low-shelf a engrossar os graves (sub aproximado) + passthrough
  const f = c.createBiquadFilter()
  f.type = 'lowshelf'
  f.frequency.value = 220
  f.gain.value = 4 + norm(knob(p, ['sub', 'down'], 4)) * 8
  return { input: f, output: f }
}

function buildPassthrough(c: AudioContext): FxNode {
  const g = c.createGain()
  return { input: g, output: g }
}

function buildFx(c: AudioContext, p: Pedal): FxNode {
  switch (p.type) {
    case 'overdrive':
    case 'distortion':
    case 'fuzz':       return buildDrive(c, p)
    case 'boost':      return buildBoost(c, p)
    case 'EQ':         return buildEQ(c, p)
    case 'wah':        return buildWah(c)
    case 'compressor': return buildCompressor(c, p)
    case 'delay':      return buildDelay(c, p)
    case 'reverb':     return buildReverb(c, p)
    case 'chorus':
    case 'flanger':    return buildModulation(c, p)
    case 'phaser':     return buildPhaser(c, p)
    case 'tremolo':    return buildTremolo(c, p)
    case 'octaver':    return buildOctaver(c, p)
    default:           return buildPassthrough(c)
  }
}

// ─── Construir a cadeia completa ─────────────────────────────────────────────

function buildChain(c: AudioContext, pedals: Pedal[]): { input: AudioNode; output: AudioNode; oscs: OscillatorNode[] } {
  const input = c.createGain()
  let cursor: AudioNode = input
  const oscs: OscillatorNode[] = []
  for (const p of pedals) {
    const fx = buildFx(c, p)
    cursor.connect(fx.input)
    cursor = fx.output
    if (fx.oscs) oscs.push(...fx.oscs)
  }
  return { input, output: cursor, oscs }
}

// ─── Tocar ───────────────────────────────────────────────────────────────────

export interface PlayHandle { analyser: AnalyserNode; duration: number }

/** Toca um strum através da cadeia de pedais LIGADOS (já ordenados). */
export function playStrum(pedals: Pedal[]): PlayHandle {
  const c = getCtx()
  if (c.state === 'suspended') void c.resume()

  // limpa cadeia anterior
  if (currentChainOut) { try { currentChainOut.disconnect() } catch { /* noop */ } }
  runningOscs.forEach((o) => { try { o.stop() } catch { /* noop */ } })
  runningOscs = []

  const chain = buildChain(c, pedals)
  chain.output.connect(getSpeakerIn())
  currentChainOut = chain.output

  const now = c.currentTime
  const strumGap = 0.028
  E_MAJOR.forEach((freq, i) => {
    const src = c.createBufferSource()
    src.buffer = makePluck(freq)
    const g = c.createGain()
    g.gain.value = 0.5 - i * 0.02
    src.connect(g); g.connect(chain.input)
    src.start(now + i * strumGap)
  })

  // arranca os LFOs e agenda paragem
  const duration = 3.6
  chain.oscs.forEach((o) => { o.start(now); o.stop(now + duration) })
  runningOscs = chain.oscs

  return { analyser: analyser as AnalyserNode, duration }
}
