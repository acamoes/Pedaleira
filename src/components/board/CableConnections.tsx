import type { Pedal, Connection } from '../../types'
import { PEDAL_W, PEDAL_H } from '../../store/usePedalboardStore'
import { GUITAR_JACK, AMP_JACK, jackPedalId } from '../../utils/chain'

interface Pt { x: number; y: number }

interface Props {
  pedals: Pedal[]                 // TODOS os pedais na board (para coordenadas)
  connections: Connection[]
  guitarJack: Pt
  ampJack: Pt
  live?: { from: Pt; to: Pt } | null   // cabo a ser arrastado
  onDisconnect?: (from: string, to: string) => void
}

function cablePath(from: Pt, to: Pt): string {
  const dx = Math.max(28, Math.abs(to.x - from.x) * 0.5)
  const sag = 20   // barriga do cabo (gravidade)
  return `M ${from.x} ${from.y} C ${from.x + dx} ${from.y + sag} ${to.x - dx} ${to.y + sag} ${to.x} ${to.y}`
}

export function CableConnections({ pedals, connections, guitarJack, ampJack, live, onDisconnect }: Props) {
  const byId = new Map(pedals.map((p) => [p.id, p]))

  function coord(jack: string): Pt | null {
    if (jack === GUITAR_JACK) return guitarJack
    if (jack === AMP_JACK) return ampJack
    const pid = jackPedalId(jack)
    if (!pid) return null
    const p = byId.get(pid)
    if (!p) return null
    const y = p.y + PEDAL_H / 2
    return jack.endsWith(':out') ? { x: p.x + PEDAL_W, y } : { x: p.x, y }
  }

  return (
    <>
      {connections.map((c, i) => {
        const a = coord(c.from)
        const b = coord(c.to)
        if (!a || !b) return null
        const d = cablePath(a, b)
        return (
          <g key={`${c.from}->${c.to}-${i}`} className="group">
            {/* cabo visível (fica vermelho ao passar o rato → vai desligar) */}
            <path
              d={d} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
              opacity="0.82" className="group-hover:stroke-accent" style={{ pointerEvents: 'none' }}
            />
            {/* área clicável larga para desligar */}
            <path
              d={d} fill="none" stroke="transparent" strokeWidth="14" strokeLinecap="round"
              style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
              onClick={() => onDisconnect?.(c.from, c.to)}
            >
              <title>Clica para desligar o cabo</title>
            </path>
            {/* fichas de latão nas pontas */}
            <circle cx={a.x} cy={a.y} r="4" fill="var(--color-brass)" stroke="var(--color-ink)" strokeWidth="1" style={{ pointerEvents: 'none' }} />
            <circle cx={b.x} cy={b.y} r="4" fill="var(--color-brass)" stroke="var(--color-ink)" strokeWidth="1" style={{ pointerEvents: 'none' }} />
          </g>
        )
      })}

      {/* cabo em arrasto (tracejado, cor de acento) */}
      {live && (
        <path
          d={cablePath(live.from, live.to)} fill="none" stroke="var(--color-accent)"
          strokeWidth="3" strokeLinecap="round" strokeDasharray="7 5" opacity="0.9"
          style={{ pointerEvents: 'none' }}
        />
      )}
    </>
  )
}
