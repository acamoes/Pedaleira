import type { Pedal } from '../../types'
import { KnobControl } from './KnobControl'
import { SwitchToggle } from './SwitchToggle'
import { WaveformViz } from './WaveformViz'
import { usePedalboardStore } from '../../store/usePedalboardStore'
import { knobInfo } from '../../constants/knobInfo'
import { TYPE_LABELS } from '../../constants/typeLabels'

interface Props {
  pedal: Pedal
  connected: boolean   // está na cadeia ativa (tem cabos guitarra→…→amp)
  isDragging?: boolean
  onEdit: () => void
  onDragHandleMouseDown: (e: React.MouseEvent) => void
}


// Determina se o fundo é escuro para ajustar a cor do texto
function isDarkBg(hex: string): boolean {
  if (!hex) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.45
}

export function PedalCard({ pedal, connected, isDragging = false, onEdit, onDragHandleMouseDown }: Props) {
  const {
    disconnectPedal, updateKnobValue, updateSwitchValue,
    removePedal, duplicatePedal, highlightedKnobs,
  } = usePedalboardStore()

  const hasBgColor = !!pedal.color
  const darkBg     = isDarkBg(pedal.color)
  const textColor  = hasBgColor && darkBg ? '#f5f0e8' : 'var(--color-ink)'

  return (
    <div
      className={`relative flex flex-col border-2 border-ink w-[120px] min-h-[170px] rounded-[9px]
        shadow-sketch transition-all duration-150 select-none
        ${isDragging ? 'opacity-60 rotate-1 scale-105' : 'hover:-translate-y-0.5 hover:shadow-[4px_6px_0_var(--color-ink)]'}
        ${!connected ? 'opacity-40' : ''}`}
      style={{ backgroundColor: pedal.color || 'var(--color-paper)', color: textColor }}
    >
      {/* Etiqueta quando não tem cabo */}
      {!connected && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 font-mono text-[7px]
          bg-paper border border-ink px-1 text-ink uppercase tracking-wide whitespace-nowrap">
          ✄ sem cabo
        </span>
      )}

      {/* ── Drag handle (única área que inicia drag) ─── */}
      <div
        onMouseDown={onDragHandleMouseDown}
        className="cursor-grab active:cursor-grabbing px-2 pt-2 pb-1 border-b border-current/20"
        title="Arrastar"
      >
        <div className="flex items-center justify-between">
          <span
            className="font-mono text-[8px] border border-current/40 px-1 opacity-70 rounded-[2px]"
            style={{ color: textColor }}
          >
            {TYPE_LABELS[pedal.type] ?? '???'}
          </span>
          <span className="flex items-center gap-1.5">
            {/* LED — verde a "dar sinal" quando ligado */}
            <span
              className="inline-block w-2 h-2 rounded-full border"
              style={{
                borderColor: textColor,
                backgroundColor: connected ? 'var(--color-live)' : 'transparent',
                boxShadow: connected ? '0 0 4px var(--color-live)' : 'none',
              }}
            />
            {/* indicador de arrasto */}
            <span className="opacity-30 text-[10px] leading-none" style={{ letterSpacing: '1px' }}>⋮⋮</span>
          </span>
        </div>
        <p className="font-sketch text-[10px] font-bold leading-tight mt-0.5 opacity-70" style={{ color: textColor }}>
          {pedal.brand}
        </p>
        <p className="font-sketch text-[12px] font-bold leading-tight" style={{ color: textColor }}>
          {pedal.model}
        </p>
      </div>

      {/* ── Forma de onda: o que o pedal faz ao sinal ── */}
      <div className="px-2 pt-1.5 pb-1 border-b border-current/15">
        <WaveformViz pedal={pedal} color={textColor} />
      </div>

      {/* ── Knobs ── */}
      <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 px-2 pt-2 flex-1">
        {pedal.knobs.map((k) => (
          <KnobControl
            key={k.name}
            knob={k}
            disabled={!connected}
            textColor={textColor}
            info={knobInfo(k.name)}
            highlighted={highlightedKnobs.includes(`${pedal.id}:${k.name}`)}
            onChange={(val) => updateKnobValue(pedal.id, k.name, val)}
          />
        ))}
        {pedal.knobs.length === 0 && pedal.switches.length === 0 && (
          <p className="font-sketch text-[10px] opacity-60 italic text-center w-full mt-2">
            Expression
          </p>
        )}
      </div>

      {/* ── Switches ── */}
      {pedal.switches.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 px-2">
          {pedal.switches.map((sw) => (
            <SwitchToggle
              key={sw.name}
              sw={sw}
              disabled={!connected}
              onChange={(val) => updateSwitchValue(pedal.id, sw.name, val)}
            />
          ))}
        </div>
      )}

      {/* ── Controlos inferiores ── */}
      <div
        className="flex items-center justify-between px-2 py-1 border-t border-current/20 mt-auto"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Footswitch — desliga o cabo do pedal (quando ligado) */}
        <button
          type="button"
          disabled={!connected}
          title={connected ? 'Desligar o cabo deste pedal' : 'Arrasta um cabo até este pedal para o ligar'}
          onClick={() => disconnectPedal(pedal.id)}
          className="w-6 h-6 flex items-center justify-center disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <ellipse cx="9" cy="9" rx="7" ry="7" fill="none" stroke={textColor} strokeWidth="1.5" />
            <ellipse cx="9" cy="9" rx="3.5" ry="3.5"
              fill={connected ? textColor : 'none'}
              stroke={textColor}
              strokeWidth="1.5"
            />
          </svg>
        </button>

        {/* Duplicar */}
        <button
          type="button"
          title="Duplicar pedal"
          onClick={() => duplicatePedal(pedal.id)}
          className="w-5 h-5 flex items-center justify-center opacity-60 hover:opacity-100"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="3.5" y="3.5" width="6" height="6" rx="1" fill="none" stroke={textColor} strokeWidth="1.2" />
            <rect x="1.5" y="1.5" width="6" height="6" rx="1" fill="var(--color-paper)" stroke={textColor} strokeWidth="1.2" />
          </svg>
        </button>

        {/* Editar cor */}
        <button
          type="button"
          title="Editar pedal"
          onClick={onEdit}
          className="w-5 h-5 flex items-center justify-center opacity-60 hover:opacity-100"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M8 1 L11 4 L4 11 L1 11 L1 8 Z" fill="none" stroke={textColor} strokeWidth="1.4" strokeLinejoin="round" />
            <line x1="7" y1="2" x2="10" y2="5" stroke={textColor} strokeWidth="1.4" />
          </svg>
        </button>

        {/* Remover */}
        <button
          type="button"
          title="Remover"
          onClick={() => removePedal(pedal.id)}
          className="w-5 h-5 flex items-center justify-center opacity-50 hover:opacity-100"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <line x1="1" y1="1" x2="9" y2="9" stroke={textColor} strokeWidth="1.8" strokeLinecap="round" />
            <line x1="9" y1="1" x2="1" y2="9" stroke={textColor} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
