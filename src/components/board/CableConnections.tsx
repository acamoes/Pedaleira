import type { Pedal } from '../../types'
import { PEDAL_W, PEDAL_H } from '../../store/usePedalboardStore'

interface Pt { x: number; y: number }

interface Props {
  guitarJack: Pt
  ampJack: Pt
  pedals: Pedal[]   // já ordenados por x (signal chain)
}

function cable(from: Pt, to: Pt): string {
  const dx = Math.abs(to.x - from.x) * 0.55
  return `M ${from.x} ${from.y} C ${from.x + dx} ${from.y} ${to.x - dx} ${to.y} ${to.x} ${to.y}`
}

export function CableConnections({ guitarJack, ampJack, pedals }: Props) {
  const paths: string[] = []

  if (pedals.length === 0) {
    paths.push(cable(guitarJack, ampJack))
  } else {
    const first = pedals[0]
    const last  = pedals[pedals.length - 1]

    // guitarra → primeiro pedal (input = left center)
    paths.push(cable(guitarJack, { x: first.x, y: first.y + PEDAL_H / 2 }))

    // pedal → pedal
    for (let i = 0; i < pedals.length - 1; i++) {
      const from = { x: pedals[i].x + PEDAL_W, y: pedals[i].y + PEDAL_H / 2 }
      const to   = { x: pedals[i + 1].x,        y: pedals[i + 1].y + PEDAL_H / 2 }
      paths.push(cable(from, to))
    }

    // último pedal → amp
    paths.push(cable({ x: last.x + PEDAL_W, y: last.y + PEDAL_H / 2 }, ampJack))
  }

  return (
    <>
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.75"
          // tracejado subtil para imitar textura de cabo
          strokeDasharray="0"
        />
      ))}
      {/* Pequenos pontos de conexão nas junções */}
      {pedals.map((p) => (
        <g key={p.id}>
          <circle cx={p.x}          cy={p.y + PEDAL_H / 2} r="4" fill="currentColor" opacity="0.6" />
          <circle cx={p.x + PEDAL_W} cy={p.y + PEDAL_H / 2} r="4" fill="currentColor" opacity="0.6" />
        </g>
      ))}
    </>
  )
}
