import { useRef, useCallback } from 'react'
import type { Knob } from '../../types'
import { knobDisplay } from '../../utils/knobDisplay'

interface Props {
  knob: Knob
  onChange: (value: number) => void
  disabled?: boolean
  textColor?: string  // herda a cor do pedal para adaptar ao fundo
  info?: string       // tooltip a explicar o que o knob faz
  highlighted?: boolean   // destaque após aplicar uma regulação
}

function valueToAngle(value: number, min: number, max: number): number {
  return -135 + ((value - min) / (max - min)) * 270
}

export function KnobControl({ knob, onChange, disabled = false, textColor, info, highlighted = false }: Props) {
  const startY   = useRef<number | null>(null)
  const startVal = useRef<number>(knob.value)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return
      e.preventDefault()
      e.stopPropagation()  // não propaga para o drag handle do PedalCard
      startY.current   = e.clientY
      startVal.current = knob.value

      const onMove = (ev: MouseEvent) => {
        if (startY.current === null) return
        const dy    = startY.current - ev.clientY
        const range = knob.max - knob.min
        const next  = Math.min(knob.max, Math.max(knob.min, startVal.current + (dy / 80) * range))
        const step  = knob.step
        onChange(step ? knob.min + Math.round((next - knob.min) / step) * step : Math.round(next * 10) / 10)
      }
      const onUp = () => {
        startY.current = null
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [disabled, knob, onChange],
  )

  const angle = valueToAngle(knob.value, knob.min, knob.max)
  const rad = (angle * Math.PI) / 180
  const ix = 18 + 12 * Math.sin(rad)
  const iy = 18 - 12 * Math.cos(rad)
  const stroke = textColor ?? 'currentColor'
  // O risco fica sobre a face do knob (sempre --color-paper-dark), por isso usa a tinta
  // do tema e não a cor do texto do pedal — senão desaparece em pedais escuros.
  const pointer = 'var(--color-ink)'
  const display = knobDisplay(knob)
  // marcas nas fronteiras das zonas (knobs de zonas, ex.: Effect do THR5)
  const zoneTicks = (knob.zones ?? []).slice(1).map((_, i) => {
    const r = (valueToAngle((i + 1) * 10, knob.min, knob.max) * Math.PI) / 180
    return { x1: 18 + 14 * Math.sin(r), y1: 18 - 14 * Math.cos(r), x2: 18 + 17.5 * Math.sin(r), y2: 18 - 17.5 * Math.cos(r) }
  })

  return (
    <div
      className="flex flex-col items-center gap-0.5 select-none"
      title={info ? `${knob.name}: ${info}` : knob.name}
    >
      <svg
        width="34" height="34" viewBox="0 0 36 36"
        className={`cursor-ns-resize transition-all ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
        style={highlighted ? { filter: 'drop-shadow(0 0 3px var(--color-accent))' } : undefined}
        onMouseDown={handleMouseDown}
      >
        <circle cx="18" cy="18" r="14" fill="none"
          stroke={highlighted ? 'var(--color-accent)' : stroke} strokeWidth="1.8" strokeDasharray="2 1" />
        {zoneTicks.map((t, i) => (
          <line key={i} {...t} stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        ))}
        <circle cx="18" cy="18" r="11" fill="var(--color-paper-dark)" stroke={stroke} strokeWidth="1.2" />
        <line x1="18" y1="18" x2={ix} y2={iy} stroke={pointer} strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="18" cy="18" r="1.5" fill={pointer} />
      </svg>
      <span className="font-mono text-[8px] opacity-60 leading-none">{knob.name}</span>
      <span
        className="font-mono text-[10px] font-semibold leading-none tnum"
        style={highlighted ? { color: 'var(--color-accent)' } : undefined}
      >
        {display}
      </span>
    </div>
  )
}
