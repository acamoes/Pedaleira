import type { Pedal, Connection, PedalboardSetup } from '../types'

// ─── Identificadores de fichas ───────────────────────────────────────────────
export const GUITAR_JACK = 'guitar'
export const AMP_JACK = 'amp'

export const inJackId  = (pedalId: string) => `${pedalId}:in`
export const outJackId = (pedalId: string) => `${pedalId}:out`

export function isOutputJack(jack: string): boolean {
  return jack === GUITAR_JACK || jack.endsWith(':out')
}
export function isInputJack(jack: string): boolean {
  return jack === AMP_JACK || jack.endsWith(':in')
}

/** pedalId de uma ficha de pedal ('<id>:in' | '<id>:out'); null p/ guitar/amp. */
export function jackPedalId(jack: string): string | null {
  if (jack === GUITAR_JACK || jack === AMP_JACK) return null
  const i = jack.lastIndexOf(':')
  return i === -1 ? null : jack.slice(0, i)
}

/**
 * Cadeia ativa: parte da guitarra e segue saída→entrada, pedal a pedal, na
 * ORDEM em que os cabos ligam, até ao amp ou a um beco sem saída.
 * (Cada saída tem no máximo um cabo — usamos a primeira ligação de cada origem.)
 */
export function deriveChain(pedals: Pedal[], connections: Connection[]): Pedal[] {
  const byFrom = new Map<string, string>()
  for (const c of connections) if (!byFrom.has(c.from)) byFrom.set(c.from, c.to)
  const pedalById = new Map(pedals.map((p) => [p.id, p]))

  const ordered: Pedal[] = []
  const visited = new Set<string>()
  let cur = byFrom.get(GUITAR_JACK)
  while (cur && cur !== AMP_JACK && !visited.has(cur)) {
    visited.add(cur)
    const pid = jackPedalId(cur)
    if (!pid || !cur.endsWith(':in')) break
    const p = pedalById.get(pid)
    if (!p) break
    ordered.push(p)
    cur = byFrom.get(outJackId(pid))
  }
  return ordered
}

/** Set de ids de pedais que estão na cadeia ativa (guitarra→…→amp). */
export function connectedIds(pedals: Pedal[], connections: Connection[]): Set<string> {
  return new Set(deriveChain(pedals, connections).map((p) => p.id))
}

/**
 * Migração: gera cabos a partir do modelo antigo (pedais `enabled` ordenados por
 * x) quando um setup ainda não tem `connections`. Preserva boards já montadas.
 */
export function withMigratedConnections(setup: PedalboardSetup): PedalboardSetup {
  if (Array.isArray(setup.connections)) return setup
  const chain = [...setup.pedals].filter((p) => p.enabled).sort((a, b) => a.x - b.x)
  const connections: Connection[] = []
  let prev = GUITAR_JACK
  for (const p of chain) {
    connections.push({ from: prev, to: inJackId(p.id) })
    prev = outJackId(p.id)
  }
  if (chain.length) connections.push({ from: prev, to: AMP_JACK })
  return { ...setup, connections }
}
