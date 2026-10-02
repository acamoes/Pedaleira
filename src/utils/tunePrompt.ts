import type { Amp, Knob, Pedal, TunePedalsResponse } from '../types'

// ─── A) Construir a pergunta (prompt) ────────────────────────────────────────

// Knobs 0–10 aparecem só pelo nome; seletores, zonas e intervalos diferentes (ex.: ±18 dB) são explicitados
function describeKnob(k: Knob): string {
  if (k.zones?.length) return `${k.name} (Off, ou ${k.zones.join(' | ')} + intensidade 0-10, ex.: "${k.zones[0]} 6")`
  if (k.labels?.length) return `${k.name} (${k.labels.map((l, i) => `${k.min + i}=${l}`).join(', ')})`
  if (k.min !== 0 || k.max !== 10) return `${k.name} (${k.min} a ${k.max})`
  return k.name
}

function describeUnit(u: { brand: string; model: string; knobs: Knob[]; switches: Array<{ name: string }> }, extra = ''): string {
  const knobs = u.knobs.map(describeKnob).join(', ') || 'sem knobs'
  const sw = u.switches.length ? `; switches: ${u.switches.map((s) => s.name).join(', ')}` : ''
  return `- ${[u.brand, u.model].filter(Boolean).join(' ')}${extra} — knobs: ${knobs}${sw}`
}

/**
 * Gera a pergunta a copiar para um LLM, no formato pedido pelo utilizador:
 * lista de pedais e de amps (com os controlos de cada um) + música + pedido de ordem e tabela.
 */
export function buildTunePrompt(pedals: Pedal[], amps: Amp[], song: string, artist: string): string {
  const list = pedals.map((p) => describeUnit(p, ` (${p.type})`)).join('\n') || '- (nenhum pedal)'
  const ampList = amps.map((a) => describeUnit(a)).join('\n')

  const artistPart = artist.trim() ? ` dos/de "${artist.trim()}"` : ''

  return `Tenho em casa este INVENTÁRIO de pedais de guitarra:
${list}

E estes AMPLIFICADORES (só uso um de cada vez):
${ampList}

Quero aproximar-me o mais possível do som da guitarra na música "${song.trim()}"${artistPart}.

A partir do inventário acima (não posso adicionar outros pedais nem amplificadores):
1. ESCOLHE apenas os pedais RELEVANTES para esta música — ignora os que não fazem sentido (não tens de usar todos).
2. ESCOLHE o AMPLIFICADOR mais adequado (só um), tendo em conta os seus canais e efeitos internos.
3. Indica a ORDEM da cadeia com os escolhidos, a terminar no amplificador (ex.: Guitarra -> Pedal A -> Pedal B -> Amplificador X).
4. Dá a CONFIGURAÇÃO de cada pedal escolhido e do amplificador numa tabela, uma linha por equipamento, com o valor de cada knob na ordem em que os listei (0-10, salvo indicação entre parênteses) e o estado de cada switch (on/off).

Procura a combinação mais parecida possível com o tom original, mesmo que aproximada. Os pedais que não escolheres ficam de fora (em casa). Quero que me dês uma resposta seguindo exatamente este formato e mais nada: Pedal X1 - Configuração Y1, Pedal X2 - Configuração Y2, etc..., Amplificador - Configuração`
}

// ─── B) Interpretar a resposta colada ────────────────────────────────────────

export interface ParsedTune {
  response: TunePedalsResponse
  orderedIds: string[]   // ordem dos pedais ATIVOS (esq → dir)
  matchedCount: number   // pedais (e amp) encontrados
  unmatched: string[]    // pedais que não foram encontrados na resposta
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const ARROWS = /(->|→|=>|>)/
const TYPE_WORDS = /\b(overdrive|distortion|distor|fuzz|delay|reverb|chorus|flanger|phaser|tremolo|compressor|comp|octaver|octave|wah|eq|boost|looper|loop|tuner)\b/gi
// Bypass do PEDAL (não confundir com valores de switches como "Voice off").
// Só frases inequívocas a nível de pedal; "off"/"desligado" sozinhos são evitados
// porque colidem com estados de switch.
const BYPASS_RE = /(\bbypass\b|em\s+bypass|fora\s+da\s+(cadeia|chain)|n[aã]o\s+(usar|utiliz|entra)|sem\s+uso|em\s+casa|\bignorad|\bexclu|\bdisabled\b)/i

/** Candidatos de pesquisa para localizar um pedal (do mais específico ao menos). */
function pedalCandidates(p: Pedal): string[] {
  const core = p.model.replace(TYPE_WORDS, '').trim()        // ex.: "DS-1"
  const firstTwo = p.model.split(/\s+/).slice(0, 2).join(' ')
  return sortCandidates([`${p.brand} ${p.model}`, p.modelName, p.model, core, firstTwo])
}

/** Candidatos para um amp: tolera "Katana Mini"/"Katana-Mini", "THR 5"/"THR5", e a 1.ª palavra do modelo. */
function ampCandidates(a: Amp): string[] {
  const variants = (s: string) => [s, s.replace(/-/g, ' '), s.replace(/[-\s]+/g, ''), s.replace(/(\D)(\d)/g, '$1 $2')]
  const first = a.model.split(/[\s-]+/)[0]
  return sortCandidates([
    ...variants(`${a.brand} ${a.model}`), ...variants(a.model), a.modelName,
    first.length >= 4 ? first : '',
  ])
}

function sortCandidates(list: string[]): string[] {
  const out = list.map((s) => s.toLowerCase().trim()).filter((s) => s.length >= 3)
  // ordena por comprimento desc → tenta o match mais específico primeiro
  return Array.from(new Set(out)).sort((a, b) => b.length - a.length)
}

/** Índice (posição) com que um equipamento aparece num texto (ou -1). */
function indexIn(cands: string[], lowerText: string): number {
  let best = -1
  for (const cand of cands) {
    const idx = lowerText.indexOf(cand)
    if (idx !== -1 && (best === -1 || idx < best)) best = idx
  }
  return best
}

/** Qual o equipamento referido numa linha (o de match mais cedo)? */
function firstIn<T>(line: string, items: T[], cands: (t: T) => string[]): { item: T; idx: number } | null {
  const lower = line.toLowerCase()
  let best: { item: T; idx: number } | null = null
  for (const item of items) {
    const idx = indexIn(cands(item), lower)
    if (idx !== -1 && (!best || idx < best.idx)) best = { item, idx }
  }
  return best
}

/** Ordem dos pedais: tenta linha com setas; senão, primeira ocorrência global. */
function detectOrder(answer: string, pedals: Pedal[]): string[] {
  const byPos = (text: string) => {
    const lower = text.toLowerCase()
    return pedals
      .map((p) => ({ p, idx: indexIn(pedalCandidates(p), lower) }))
      .filter((x) => x.idx !== -1)
      .sort((a, b) => a.idx - b.idx)
      .map((x) => x.p.id)
  }
  for (const line of answer.split('\n')) {
    if (ARROWS.test(line)) {
      const seq = byPos(line)
      if (seq.length >= 2) return seq
    }
  }
  return byPos(answer)   // fallback: primeira ocorrência no texto inteiro
}

/** Valor de um knob escrito como texto: número, posição de seletor ("Crunch") ou zona ("Chorus 6", "Off"). */
function parseKnobText(k: Knob, raw: string): number | null {
  const t = raw.trim().toLowerCase()
  if (k.zones?.length) {
    if (/^(off|desligad|0\b)/.test(t)) return 0
    for (const [i, z] of k.zones.entries()) {
      const m = t.match(new RegExp('^' + escapeRegex(z.toLowerCase()) + '\\s*[:=]?\\s*(\\d+(?:[.,]\\d+)?)?'))
      if (m) {
        const amount = m[1] ? parseFloat(m[1].replace(',', '.')) : 5
        return i * 10 + Math.max(0.1, Math.min(10, amount))
      }
    }
  }
  const li = (k.labels ?? []).findIndex((l) => t.startsWith(l.toLowerCase()))
  if (li !== -1) return k.min + li
  const n = parseFloat(t.replace(',', '.').replace('−', '-'))
  return Number.isFinite(n) ? clamp(n, k.min, k.max) : null
}

/** Extrai os valores dos knobs de um equipamento a partir de uma linha (tabela/lista). */
function extractKnobs(line: string, knobs: Knob[], candidates: string[]): Record<string, number> {
  const found: Record<string, number> = {}

  // 1) por nome: "Drive: 7", "Tone 6", "| Level | 5 |", "Dist = 7", "100 Hz: -3", "Mode: Poly", "Effect: Chorus 6"
  //    Nomes mais longos primeiro e o trecho casado é apagado, para "Sub" não apanhar "Sub 2".
  let rest = line
  for (const k of [...knobs].sort((a, b) => b.name.length - a.name.length)) {
    // knob de zonas: "Effect: Chorus 6" / "Delay/Reverb = Off"
    if (k.zones?.length) {
      const names = ['off', 'desligad\\w*', '0(?![.,\\d])', ...k.zones.map((z) => escapeRegex(z.toLowerCase()))].join('|')
      const zm = rest.match(new RegExp(escapeRegex(k.name) + '\\s*[:=|-]?\\s*((?:' + names + ')\\s*[:=]?\\s*(?:\\d+(?:[.,]\\d+)?)?)', 'i'))
      if (zm) {
        const v = parseKnobText(k, zm[1])
        if (v !== null) { found[k.name] = v; rest = rest.replace(zm[0], ' '); continue }
      }
    }
    const re = new RegExp(escapeRegex(k.name) + '\\s*[^0-9\\n+\\-−]{0,6}?([+\\-−]?\\d+(?:[.,]\\d+)?)', 'i')
    const m = rest.match(re)
    if (m && !k.zones?.length) {
      found[k.name] = clamp(parseFloat(m[1].replace(',', '.').replace('−', '-')), k.min, k.max)
      rest = rest.replace(m[0], ' ')
      continue
    }
    // seletor indicado pelo nome da posição
    for (const [i, label] of (k.labels ?? []).entries()) {
      const lm = rest.match(new RegExp(escapeRegex(k.name) + '\\s*[^\\n]{0,6}?' + escapeRegex(label), 'i'))
      if (lm) {
        found[k.name] = k.min + i
        rest = rest.replace(lm[0], ' ')
        break
      }
    }
  }
  if (Object.keys(found).length > 0) return found

  // 2) fallback posicional: remove o nome do equipamento e mapeia os números restantes
  //    pela ordem dos knobs (a mesma ordem em que foram listados na pergunta).
  let stripped = line
  for (const cand of candidates) {
    stripped = stripped.replace(new RegExp(escapeRegex(cand), 'ig'), ' ')
  }
  const nums = (stripped.match(/(?<![\w.])[+\-−]?\d+(?:[.,]\d+)?(?![\w])/g) ?? []).map((n) =>
    parseFloat(n.replace(',', '.').replace('−', '-')),
  )
  if (nums.length >= knobs.length && knobs.length > 0 && !knobs.some((k) => k.zones?.length)) {
    knobs.forEach((k, i) => { found[k.name] = clamp(nums[i], k.min, k.max) })
  }
  return found
}

/** Switches numa linha: "NomeSwitch: on/off/ligado/ativado". */
function extractSwitches(line: string, switches: Array<{ name: string }>): Record<string, boolean> {
  const out: Record<string, boolean> = {}
  for (const sw of switches) {
    const re = new RegExp(escapeRegex(sw.name) + '\\s*[:=]?\\s*(on|off|lig\\w*|deslig\\w*|ativ\\w*|sim|n[aã]o|true|false)', 'i')
    const m = line.match(re)
    if (m) out[sw.name] = /on|lig|ativ|sim|true/i.test(m[1]) && !/deslig/i.test(m[1])
  }
  return out
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

type JsonUnit = { pedalId?: string; ampId?: string; model?: string; enabled?: boolean; knobs?: Record<string, number | string>; switches?: Record<string, boolean> }

/** Valores de knobs vindos de JSON (aceita números e texto como "Crunch"/"Chorus 6"). */
function jsonKnobs(knobs: Knob[], raw: JsonUnit['knobs']): Record<string, number> {
  const out: Record<string, number> = {}
  for (const k of knobs) {
    const v = raw?.[k.name]
    const n = typeof v === 'number' ? clamp(v, k.min, k.max) : typeof v === 'string' ? parseKnobText(k, v) : null
    if (n !== null) out[k.name] = n
  }
  return out
}

/** Tenta interpretar a resposta como JSON (formato TunePedalsResponse). */
function tryParseJson(answer: string, pedals: Pedal[], amps: Amp[]): ParsedTune | null {
  const start = answer.indexOf('{')
  const end = answer.lastIndexOf('}')
  if (start === -1 || end <= start) return null
  let data: { settings?: JsonUnit[]; amp?: JsonUnit; notes?: string } | null = null
  try {
    data = JSON.parse(answer.slice(start, end + 1))
  } catch {
    return null
  }
  if (!data || !Array.isArray(data.settings)) return null

  const byId = new Map(pedals.map((p) => [p.id, p]))
  const settings: TunePedalsResponse['settings'] = []
  const orderedIds: string[] = []

  for (const st of data.settings) {
    // associa por pedalId ou por nome do modelo
    let pedal: Pedal | undefined = st.pedalId ? byId.get(st.pedalId) : undefined
    if (!pedal && st.model) pedal = pedals.find((p) => p.model.toLowerCase().includes(String(st.model).toLowerCase()))
    if (!pedal) continue
    const enabled = st.enabled !== false
    settings.push({ pedalId: pedal.id, enabled, knobs: jsonKnobs(pedal.knobs, st.knobs), switches: st.switches })
    if (enabled) orderedIds.push(pedal.id)
  }

  let amp: TunePedalsResponse['amp']
  if (data.amp) {
    const a = amps.find((x) => x.id === data!.amp!.ampId)
      ?? (data.amp.model ? firstIn(String(data.amp.model), amps, ampCandidates)?.item : undefined)
    if (a) amp = { ampId: a.id, knobs: jsonKnobs(a.knobs, data.amp.knobs), switches: data.amp.switches }
  }
  if (settings.length === 0 && !amp) return null

  // pedais não referidos → desligados
  for (const p of pedals) {
    if (!settings.find((s) => s.pedalId === p.id)) settings.push({ pedalId: p.id, enabled: false, knobs: {} })
  }

  return {
    response: { song: '', artist: '', settings, amp, notes: data.notes ?? 'Aplicado a partir de JSON.', missing: [] },
    orderedIds,
    matchedCount: orderedIds.length + (amp ? 1 : 0),
    unmatched: pedals.filter((p) => !orderedIds.includes(p.id) && !settings.find((s) => s.pedalId === p.id && Object.keys(s.knobs).length)).map((p) => p.model),
  }
}

export function parseTuneAnswer(
  answer: string,
  pedals: Pedal[],
  amps: Amp[],
  song: string,
  artist: string,
): ParsedTune {
  // Se a resposta for JSON, usa o caminho estruturado (mais fiável)
  const asJson = tryParseJson(answer, pedals, amps)
  if (asJson) {
    asJson.response.song = song.trim()
    asJson.response.artist = artist.trim()
    return asJson
  }

  const lines = answer.split('\n')
  const knobsByPedal = new Map<string, Record<string, number>>()
  const switchesByPedal = new Map<string, Record<string, boolean>>()
  const bypassByPedal = new Set<string>()

  // Amp escolhido: o que fecha a linha da ordem; senão, o primeiro com regulação
  let chosenAmp: Amp | null = null
  for (const line of lines) {
    if (!ARROWS.test(line)) continue
    const a = firstIn(line, amps, ampCandidates)
    if (a) { chosenAmp = a.item; break }
  }
  let ampKnobs: Record<string, number> = {}
  let ampSwitches: Record<string, boolean> = {}

  // Processa linha a linha (uma linha de tabela = um equipamento)
  for (const line of lines) {
    const p = firstIn(line, pedals, pedalCandidates)
    const a = ARROWS.test(line) ? null : firstIn(line, amps, ampCandidates)

    // linha do amp (o amp aparece antes de qualquer pedal na linha)
    if (a && (!p || a.idx < p.idx)) {
      if (!chosenAmp) chosenAmp = a.item
      if (a.item.id === chosenAmp.id) {
        ampKnobs = { ...ampKnobs, ...extractKnobs(line, a.item.knobs, ampCandidates(a.item)) }
        ampSwitches = { ...ampSwitches, ...extractSwitches(line, a.item.switches) }
      }
      continue
    }

    if (!p) continue
    const pedal = p.item
    if (BYPASS_RE.test(line)) bypassByPedal.add(pedal.id)
    const knobs = extractKnobs(line, pedal.knobs, pedalCandidates(pedal))
    if (Object.keys(knobs).length > 0) {
      knobsByPedal.set(pedal.id, { ...knobsByPedal.get(pedal.id), ...knobs })
    }
    const sws = extractSwitches(line, pedal.switches)
    if (Object.keys(sws).length) switchesByPedal.set(pedal.id, { ...switchesByPedal.get(pedal.id), ...sws })
  }

  // Ordem dos pedais ativos (remove os que estão em bypass)
  const order = detectOrder(answer, pedals).filter((id) => !bypassByPedal.has(id))
  const orderedIds = [...order]
  // pedais com config mas fora da ordem detetada → acrescenta no fim
  for (const [id] of knobsByPedal) {
    if (!bypassByPedal.has(id) && !orderedIds.includes(id)) orderedIds.push(id)
  }

  // Constrói settings para TODOS os pedais
  const settings: TunePedalsResponse['settings'] = pedals.map((p) => ({
    pedalId: p.id,
    enabled: orderedIds.includes(p.id),
    knobs: knobsByPedal.get(p.id) ?? {},
    switches: switchesByPedal.get(p.id),
  }))

  const matchedIds = new Set<string>([...orderedIds, ...knobsByPedal.keys()])
  const unmatched = pedals.filter((p) => !matchedIds.has(p.id)).map((p) => p.model)

  const response: TunePedalsResponse = {
    song: song.trim(),
    artist: artist.trim(),
    settings,
    amp: chosenAmp ? { ampId: chosenAmp.id, knobs: ampKnobs, switches: ampSwitches } : undefined,
    notes: `${orderedIds.length} de ${pedals.length} pedais ligados e configurados a partir da resposta.`,
    missing: [],
  }

  return { response, orderedIds, matchedCount: matchedIds.size + (chosenAmp ? 1 : 0), unmatched }
}
