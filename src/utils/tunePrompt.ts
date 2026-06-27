import type { Pedal, TunePedalsResponse } from '../types'

// ─── A) Construir a pergunta (prompt) ────────────────────────────────────────

/**
 * Gera a pergunta a copiar para um LLM, no formato pedido pelo utilizador:
 * lista de pedais (com os knobs de cada um) + música + pedido de ordem e tabela.
 */
export function buildTunePrompt(pedals: Pedal[], song: string, artist: string): string {
  const list = pedals
    .map((p) => {
      const knobs = p.knobs.map((k) => k.name).join(', ') || 'sem knobs'
      const sw = p.switches.length ? `; switches: ${p.switches.map((s) => s.name).join(', ')}` : ''
      return `- ${p.brand} ${p.model} (${p.type}) — knobs: ${knobs}${sw}`
    })
    .join('\n')

  const artistPart = artist.trim() ? ` dos/de "${artist.trim()}"` : ''

  return `Estes são os ÚNICOS pedais de guitarra que tenho disponíveis:
${list}

Quero aproximar-me o mais possível do som da guitarra na música "${song.trim()}"${artistPart}, usando APENAS os pedais acima (não posso adicionar outros).

Com base nesses pedais, diz-me:
1. A ORDEM em que devo ligá-los na cadeia (ex.: Guitarra -> Pedal A -> Pedal B -> Amplificador). Escolhe quais usar e indica se algum deve ficar em bypass.
2. A CONFIGURAÇÃO de cada pedal usado, numa tabela, uma linha por pedal, com os valores de cada knob (0-10) na ordem em que listei os knobs acima.

Procura a combinação mais parecida possível com o tom original, mesmo que aproximada.`
}

// ─── B) Interpretar a resposta colada ────────────────────────────────────────

export interface ParsedTune {
  response: TunePedalsResponse
  orderedIds: string[]   // ordem dos pedais ATIVOS (esq → dir)
  matchedCount: number
  unmatched: string[]    // pedais que não foram encontrados na resposta
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const TYPE_WORDS = /\b(overdrive|distortion|distor|fuzz|delay|reverb|chorus|flanger|phaser|tremolo|compressor|comp|octaver|octave|wah|eq|boost|looper|loop|tuner)\b/gi
const BYPASS_RE = /(bypass|desligad|deslig|\boff\b|n[aã]o\s+(usar|ligad|utiliz)|sem\s+uso|disabled)/i

/** Candidatos de pesquisa para localizar um pedal (do mais específico ao menos). */
function pedalCandidates(p: Pedal): string[] {
  const core = p.model.replace(TYPE_WORDS, '').trim()        // ex.: "DS-1"
  const firstTwo = p.model.split(/\s+/).slice(0, 2).join(' ')
  const out = [`${p.brand} ${p.model}`, p.modelName, p.model, core, firstTwo]
    .map((s) => s.toLowerCase().trim())
    .filter((s) => s.length >= 3)
  // ordena por comprimento desc → tenta o match mais específico primeiro
  return Array.from(new Set(out)).sort((a, b) => b.length - a.length)
}

/** Índice (posição) e candidato com que um pedal aparece num texto (ou -1). */
function matchIn(p: Pedal, lowerText: string): { idx: number; cand: string } {
  let best = { idx: -1, cand: '' }
  for (const cand of pedalCandidates(p)) {
    const idx = lowerText.indexOf(cand)
    if (idx !== -1 && (best.idx === -1 || idx < best.idx)) best = { idx, cand }
  }
  return best
}

/** Qual o pedal referido numa linha (o de match mais cedo)? */
function pedalInLine(line: string, pedals: Pedal[]): Pedal | null {
  const lower = line.toLowerCase()
  let best: { p: Pedal; idx: number } | null = null
  for (const p of pedals) {
    const { idx } = matchIn(p, lower)
    if (idx !== -1 && (!best || idx < best.idx)) best = { p, idx }
  }
  return best?.p ?? null
}

/** Ordem dos pedais: tenta linha com setas; senão, primeira ocorrência global. */
function detectOrder(answer: string, pedals: Pedal[]): string[] {
  const lines = answer.split('\n')
  for (const line of lines) {
    if (/(->|→|=>|>)/.test(line)) {
      const lower = line.toLowerCase()
      const seq = pedals
        .map((p) => ({ p, idx: matchIn(p, lower).idx }))
        .filter((x) => x.idx !== -1)
        .sort((a, b) => a.idx - b.idx)
      if (seq.length >= 2) return seq.map((x) => x.p.id)
    }
  }
  // fallback: primeira ocorrência no texto inteiro
  const lower = answer.toLowerCase()
  return pedals
    .map((p) => ({ p, idx: matchIn(p, lower).idx }))
    .filter((x) => x.idx !== -1)
    .sort((a, b) => a.idx - b.idx)
    .map((x) => x.p.id)
}

/** Extrai os valores dos knobs de um pedal a partir de uma linha (tabela/lista). */
function extractKnobs(line: string, pedal: Pedal): Record<string, number> {
  const found: Record<string, number> = {}

  // 1) por nome: "Drive: 7", "Tone 6", "| Level | 5 |", "Dist = 7"
  for (const k of pedal.knobs) {
    const re = new RegExp(escapeRegex(k.name) + '\\s*[^0-9\\n]{0,6}?(\\d+(?:[.,]\\d+)?)', 'i')
    const m = line.match(re)
    if (m) found[k.name] = clamp(parseFloat(m[1].replace(',', '.')), k.min, k.max)
  }
  if (Object.keys(found).length > 0) return found

  // 2) fallback posicional: remove o nome do pedal e mapeia os números restantes
  //    pela ordem dos knobs (a mesma ordem em que foram listados na pergunta).
  let stripped = line
  for (const cand of pedalCandidates(pedal)) {
    stripped = stripped.replace(new RegExp(escapeRegex(cand), 'ig'), ' ')
  }
  const nums = (stripped.match(/(?<![\w.])\d+(?:[.,]\d+)?(?![\w])/g) ?? []).map((n) =>
    parseFloat(n.replace(',', '.')),
  )
  if (nums.length >= pedal.knobs.length && pedal.knobs.length > 0) {
    pedal.knobs.forEach((k, i) => { found[k.name] = clamp(nums[i], k.min, k.max) })
  }
  return found
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

/** Tenta interpretar a resposta como JSON (formato TunePedalsResponse). */
function tryParseJson(answer: string, pedals: Pedal[]): ParsedTune | null {
  const start = answer.indexOf('{')
  const end = answer.lastIndexOf('}')
  if (start === -1 || end <= start) return null
  let data: { settings?: Array<{ pedalId?: string; model?: string; enabled?: boolean; knobs?: Record<string, number>; switches?: Record<string, boolean> }>; notes?: string } | null = null
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
    const knobs: Record<string, number> = {}
    for (const k of pedal.knobs) {
      const v = st.knobs?.[k.name]
      if (typeof v === 'number') knobs[k.name] = Math.max(k.min, Math.min(k.max, v))
    }
    const enabled = st.enabled !== false
    settings.push({ pedalId: pedal.id, enabled, knobs, switches: st.switches })
    if (enabled) orderedIds.push(pedal.id)
  }
  if (settings.length === 0) return null

  // pedais não referidos → desligados
  for (const p of pedals) {
    if (!settings.find((s) => s.pedalId === p.id)) settings.push({ pedalId: p.id, enabled: false, knobs: {} })
  }

  return {
    response: { song: '', artist: '', settings, notes: data.notes ?? 'Aplicado a partir de JSON.', missing: [] },
    orderedIds,
    matchedCount: orderedIds.length,
    unmatched: pedals.filter((p) => !orderedIds.includes(p.id) && !settings.find((s) => s.pedalId === p.id && Object.keys(s.knobs).length)).map((p) => p.model),
  }
}

export function parseTuneAnswer(
  answer: string,
  pedals: Pedal[],
  song: string,
  artist: string,
): ParsedTune {
  // Se a resposta for JSON, usa o caminho estruturado (mais fiável)
  const asJson = tryParseJson(answer, pedals)
  if (asJson) {
    asJson.response.song = song.trim()
    asJson.response.artist = artist.trim()
    return asJson
  }

  const knobsByPedal = new Map<string, Record<string, number>>()
  const switchesByPedal = new Map<string, Record<string, boolean>>()
  const bypassByPedal = new Set<string>()

  // Processa linha a linha (uma linha de tabela = um pedal)
  for (const line of answer.split('\n')) {
    const pedal = pedalInLine(line, pedals)
    if (!pedal) continue
    if (BYPASS_RE.test(line)) bypassByPedal.add(pedal.id)
    const knobs = extractKnobs(line, pedal)
    if (Object.keys(knobs).length > 0) {
      knobsByPedal.set(pedal.id, { ...knobsByPedal.get(pedal.id), ...knobs })
    }
    // switches: procura "NomeSwitch: on/off/ligado/ativado"
    for (const sw of pedal.switches) {
      const re = new RegExp(escapeRegex(sw.name) + '\\s*[:=]?\\s*(on|off|lig\\w*|deslig\\w*|ativ\\w*|sim|n[aã]o|true|false)', 'i')
      const m = line.match(re)
      if (m) {
        const v = /on|lig|ativ|sim|true/i.test(m[1]) && !/deslig/i.test(m[1])
        switchesByPedal.set(pedal.id, { ...switchesByPedal.get(pedal.id), [sw.name]: v })
      }
    }
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
    notes: `${orderedIds.length} de ${pedals.length} pedais ligados e configurados a partir da resposta.`,
    missing: [],
  }

  return { response, orderedIds, matchedCount: matchedIds.size, unmatched }
}
