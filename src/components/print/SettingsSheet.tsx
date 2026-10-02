import { createPortal } from 'react-dom'
import type { Knob, Pedal, PedalSwitch, SetupSong, TuneResult } from '../../types'
import { bandFreq } from '../../utils/signal'
import { formatSong } from '../board/SongTitle'

// ─── Ficha de regulação ──────────────────────────────────────────────────────
// Folha imprimível (A4 horizontal, preto e branco) da Cadeia ativa: cada pedal por
// ordem com os knobs desenhados na posição atual, para reproduzir o som na pedaleira
// real. Fica escondida no ecrã; o CSS de impressão (index.css) mostra só esta folha.

interface Props {
  chain: Pedal[]
  setupName: string
  song?: SetupSong
  tune: TuneResult | null
}

const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1))

/** Como desenhar um controlo: knob rodável, slider (bandas de EQ) ou só número (Memory, Tempo…). */
function controlKind(k: Knob): 'knob' | 'slider' | 'number' {
  if (bandFreq(k.name) !== null) return 'slider'
  if (k.step && !k.labels?.length && (k.max - k.min) / k.step > 12) return 'number'
  return 'knob'
}

function KnobDrawing({ knob }: { knob: Knob }) {
  const frac = (knob.value - knob.min) / (knob.max - knob.min || 1)
  const a = ((-135 + frac * 270) * Math.PI) / 180
  const tick = (deg: number) => {
    const r = (deg * Math.PI) / 180
    return <line x1={22 + 17 * Math.sin(r)} y1={22 - 17 * Math.cos(r)} x2={22 + 20 * Math.sin(r)} y2={22 - 20 * Math.cos(r)} stroke="#000" strokeWidth="1.2" />
  }
  const label = knob.labels?.[Math.round(knob.value - knob.min)]
  return (
    <div className="sheet-control">
      <span className="sheet-control-name">{knob.name}</span>
      <svg width="44" height="44" viewBox="0 0 44 44">
        {tick(-135)}{tick(0)}{tick(135)}
        <circle cx="22" cy="22" r="14" fill="#fff" stroke="#000" strokeWidth="1.6" />
        <line x1="22" y1="22" x2={22 + 12 * Math.sin(a)} y2={22 - 12 * Math.cos(a)} stroke="#000" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
      <span className="sheet-control-value">{label ?? fmt(knob.value)}</span>
    </div>
  )
}

function SliderDrawing({ knob }: { knob: Knob }) {
  const frac = (knob.value - knob.min) / (knob.max - knob.min || 1)
  const y = 50 - frac * 44
  return (
    <div className="sheet-control">
      <span className="sheet-control-name">{knob.name}</span>
      <svg width="20" height="56" viewBox="0 0 20 56">
        <line x1="10" y1="6" x2="10" y2="50" stroke="#000" strokeWidth="1.4" />
        {knob.min < 0 && <line x1="5" y1="28" x2="15" y2="28" stroke="#000" strokeWidth="0.8" />}
        <rect x="3" y={y - 3.5} width="14" height="7" rx="1" fill="#fff" stroke="#000" strokeWidth="1.6" />
      </svg>
      <span className="sheet-control-value">{knob.value > 0 && knob.min < 0 ? '+' : ''}{fmt(knob.value)}</span>
    </div>
  )
}

function NumberBox({ knob }: { knob: Knob }) {
  return (
    <div className="sheet-control">
      <span className="sheet-control-name">{knob.name}</span>
      <span className="sheet-number">{fmt(knob.value)}</span>
    </div>
  )
}

function SwitchDrawing({ sw }: { sw: PedalSwitch }) {
  return (
    <div className="sheet-switch">
      <svg width="26" height="12" viewBox="0 0 26 12">
        <rect x="1" y="1" width="24" height="10" rx="2" fill="#fff" stroke="#000" strokeWidth="1.2" />
        <rect x={sw.value ? 13 : 3} y="3" width="10" height="6" rx="1" fill="#000" />
      </svg>
      <span>{sw.name}: <b>{sw.value ? 'ON' : 'OFF'}</b></span>
    </div>
  )
}

function PedalSheet({ pedal, index }: { pedal: Pedal; index: number }) {
  return (
    <div className="sheet-pedal" style={{ borderTopColor: pedal.color || '#000' }}>
      <div className="sheet-pedal-head">
        <span className="sheet-pedal-index">{index + 1}</span>
        <div>
          <div className="sheet-pedal-brand">{pedal.brand}</div>
          <div className="sheet-pedal-model">{pedal.model}</div>
        </div>
      </div>
      {pedal.knobs.length > 0 && (
        <div className="sheet-controls">
          {pedal.knobs.map((k) => {
            const kind = controlKind(k)
            if (kind === 'slider') return <SliderDrawing key={k.name} knob={k} />
            if (kind === 'number') return <NumberBox key={k.name} knob={k} />
            return <KnobDrawing key={k.name} knob={k} />
          })}
        </div>
      )}
      {pedal.switches.length > 0 && (
        <div className="sheet-switches">
          {pedal.switches.map((s) => <SwitchDrawing key={s.name} sw={s} />)}
        </div>
      )}
      {pedal.knobs.length === 0 && pedal.switches.length === 0 && (
        <div className="sheet-empty">sem controlos</div>
      )}
    </div>
  )
}

export function SettingsSheet({ chain, setupName, song, tune }: Props) {
  const date = new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })
  const notes = tune?.response.notes?.trim()

  return createPortal(
    <div className="settings-sheet" aria-hidden="true">
      <header className="sheet-header">
        {/* Com Música, ela é o título; o Setup e a data passam a subtítulo */}
        <div>
          <h1>{song ? formatSong(song) : `Pedaleira — ${setupName}`}</h1>
          {song && <p className="sheet-subtitle">{setupName}</p>}
        </div>
        <span className="sheet-date">{date}</span>
      </header>

      <div className="sheet-chain">
        <span className="sheet-endpoint">Guitarra</span>
        {chain.map((p, i) => (
          <div key={p.id} className="sheet-step">
            <span className="sheet-arrow">→</span>
            <PedalSheet pedal={p} index={i} />
          </div>
        ))}
        <span className="sheet-arrow">→</span>
        <span className="sheet-endpoint">Amp</span>
      </div>

      {notes && (
        <section className="sheet-notes">
          <h2>Notas</h2>
          <p>{notes}</p>
        </section>
      )}
    </div>,
    document.body,
  )
}
