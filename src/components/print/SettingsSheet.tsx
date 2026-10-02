import { createPortal } from 'react-dom'
import type { Amp, Knob, Pedal, PedalSwitch, SetupSong, TuneResult } from '../../types'
import { bandFreq } from '../../utils/signal'
import { formatSong } from '../board/SongTitle'
import { knobDisplay } from '../../utils/knobDisplay'
import { TYPE_LABELS } from '../../constants/typeLabels'

// ─── Ficha de regulação ──────────────────────────────────────────────────────
// Folha imprimível (A4 horizontal, preto e branco, só linhas) da Cadeia ativa, no
// estilo de uma ficha técnica: bloco de título em grelha, diagrama da cadeia, grelha
// uniforme com as regulações de cada pedal e do amp, e notas. Fica escondida no
// ecrã; o CSS de impressão (index.css) mostra só esta folha.
//
// A paginação é calculada aqui (alturas estimadas em mm) para que cada folha repita
// o bloco de título e diga "Folha n / N" — o browser sozinho não sabe fazer isso.

interface Props {
  chain: Pedal[]
  amp?: Amp
  setupName: string
  song?: SetupSong
  tune: TuneResult | null
}

const GUITAR_NAME = 'Fender Stratocaster'
const pad2 = (n: number) => String(n).padStart(2, '0')

/** Um cartão da folha: um pedal da cadeia ou o amp. */
interface SheetUnit {
  key: string
  badge: string      // "01", "02"… ou "AMP"
  tag: string        // tipo: OD, DELAY… ('' no amp — o badge já diz AMP)
  brand: string
  model: string
  knobs: Knob[]
  switches: PedalSwitch[]
  color?: string
}

// ─── Desenho dos controlos ───────────────────────────────────────────────────

/** Como desenhar um controlo: knob rodável, slider (bandas de EQ) ou só número (Memory, Tempo…). */
function controlKind(k: Knob): 'knob' | 'slider' | 'number' {
  if (bandFreq(k.name) !== null) return 'slider'
  if (k.step && !k.labels?.length && (k.max - k.min) / k.step > 12) return 'number'
  return 'knob'
}

function KnobDrawing({ knob }: { knob: Knob }) {
  const frac = (knob.value - knob.min) / (knob.max - knob.min || 1)
  const a = ((-135 + frac * 270) * Math.PI) / 180
  const tick = (deg: number, key: string | number) => {
    const r = (deg * Math.PI) / 180
    return <line key={key} x1={22 + 17 * Math.sin(r)} y1={22 - 17 * Math.cos(r)} x2={22 + 20 * Math.sin(r)} y2={22 - 20 * Math.cos(r)} stroke="#000" strokeWidth="1.2" />
  }
  // knobs de zonas (THR5): marca também as fronteiras entre zonas
  const zoneDegs = (knob.zones ?? []).slice(1).map((_, i) => -135 + (((i + 1) * 10 - knob.min) / (knob.max - knob.min)) * 270)
  return (
    <div className="sheet-control">
      <span className="sheet-control-name">{knob.name}</span>
      <svg className="sheet-knob" viewBox="0 0 44 44">
        {tick(-135, 'a')}{tick(0, 'b')}{tick(135, 'c')}
        {zoneDegs.map((d, i) => tick(d, i))}
        <circle cx="22" cy="22" r="14" fill="#fff" stroke="#000" strokeWidth="1.6" />
        <line x1="22" y1="22" x2={22 + 12 * Math.sin(a)} y2={22 - 12 * Math.cos(a)} stroke="#000" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
      <span className="sheet-control-value">{knobDisplay(knob)}</span>
    </div>
  )
}

function SliderDrawing({ knob }: { knob: Knob }) {
  const frac = (knob.value - knob.min) / (knob.max - knob.min || 1)
  const y = 50 - frac * 44
  return (
    <div className="sheet-control">
      <span className="sheet-control-name">{knob.name}</span>
      <svg className="sheet-slider" viewBox="0 0 20 56">
        <line x1="10" y1="6" x2="10" y2="50" stroke="#000" strokeWidth="1.4" />
        {knob.min < 0 && <line x1="5" y1="28" x2="15" y2="28" stroke="#000" strokeWidth="0.8" />}
        <rect x="3" y={y - 3.5} width="14" height="7" rx="1" fill="#fff" stroke="#000" strokeWidth="1.6" />
      </svg>
      <span className="sheet-control-value">{knobDisplay(knob)}</span>
    </div>
  )
}

function NumberBox({ knob }: { knob: Knob }) {
  return (
    <div className="sheet-control">
      <span className="sheet-control-name">{knob.name}</span>
      <span className="sheet-number">{knobDisplay(knob)}</span>
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
      <span>{sw.name} <b>{sw.value ? 'ON' : 'OFF'}</b></span>
    </div>
  )
}

function UnitCard({ unit }: { unit: SheetUnit }) {
  return (
    <div className="sheet-card">
      <div className="sheet-card-head" style={{ borderTopColor: unit.color || '#000' }}>
        <span className="sheet-card-badge">{unit.badge}</span>
        {unit.tag && <span className="sheet-card-tag">{unit.tag}</span>}
        <span className="sheet-card-name">
          {unit.brand && <span className="sheet-card-brand">{unit.brand}</span>}
          <span className="sheet-card-model">{unit.model}</span>
        </span>
      </div>
      {unit.knobs.length > 0 && (
        <div className="sheet-controls">
          {unit.knobs.map((k) => {
            const kind = controlKind(k)
            if (kind === 'slider') return <SliderDrawing key={k.name} knob={k} />
            if (kind === 'number') return <NumberBox key={k.name} knob={k} />
            return <KnobDrawing key={k.name} knob={k} />
          })}
        </div>
      )}
      {unit.switches.length > 0 && (
        <div className="sheet-switches">
          {unit.switches.map((s) => <SwitchDrawing key={s.name} sw={s} />)}
        </div>
      )}
      {unit.knobs.length === 0 && unit.switches.length === 0 && (
        <div className="sheet-empty">sem controlos</div>
      )}
    </div>
  )
}

// ─── Paginação (estimativa em mm, a condizer com o CSS de impressão) ──────────

const PAGE_H = 186          // A4 deitado: 210 − 2×10 de margem, menos folga de segurança
const TITLE_H = 27          // bloco de título + espaço
const SECTION_H = 8         // cabeçalho de secção ("02 · Regulações")
const CHAIN_LINE_H = 9      // uma linha do diagrama da cadeia
const LINE_W = 277          // largura útil (297 − 2×10)
const GRID_COLS = 4
const GRID_GAP = 3
const CONTROLS_PER_ROW = 4
const NOTES_BASE_H = 40     // cabeçalho + 4 linhas para escrever à mão

function controlHeight(k: Knob): number {
  const kind = controlKind(k)
  return kind === 'slider' ? 22 : kind === 'number' ? 14 : 18
}

function cardHeight(u: SheetUnit): number {
  let h = 8 + 3                                     // cabeçalho + margens
  for (let i = 0; i < u.knobs.length; i += CONTROLS_PER_ROW) {
    h += Math.max(...u.knobs.slice(i, i + CONTROLS_PER_ROW).map(controlHeight)) + 1.5
  }
  if (u.switches.length) h += Math.ceil(u.switches.length / 2) * 5 + 3
  if (!u.knobs.length && !u.switches.length) h += 6
  return h
}

interface SheetPage { units: SheetUnit[]; chain: boolean; notes: boolean }

/** Linhas que o diagrama da cadeia ocupa (caixas com seta, largura pela quantidade de texto). */
function flowLines(units: SheetUnit[]): number {
  const widths = [12, ...units.map((u) => 12 + (u.badge.length + 1 + u.model.length) * 1.45)]
  let lines = 1, x = 0
  for (const w of widths) {
    if (x + w > LINE_W && x > 0) { lines++; x = 0 }
    x += w
  }
  return lines
}

function paginate(units: SheetUnit[], notesH: number): SheetPage[] {
  const chainH = SECTION_H + flowLines(units) * CHAIN_LINE_H + 4
  const pages: SheetPage[] = [{ units: [], chain: true, notes: false }]
  let free = PAGE_H - TITLE_H - chainH - SECTION_H

  for (let i = 0; i < units.length; i += GRID_COLS) {
    const row = units.slice(i, i + GRID_COLS)
    const rowH = Math.max(...row.map(cardHeight)) + GRID_GAP
    const page = pages[pages.length - 1]
    if (rowH > free && page.units.length > 0) {
      pages.push({ units: [], chain: false, notes: false })
      free = PAGE_H - TITLE_H - SECTION_H
    }
    pages[pages.length - 1].units.push(...row)
    free -= rowH
  }

  if (notesH > free) pages.push({ units: [], chain: false, notes: true })
  else pages[pages.length - 1].notes = true
  return pages
}

// ─── Folha ───────────────────────────────────────────────────────────────────

export function SettingsSheet({ chain, amp, setupName, song, tune }: Props) {
  const date = new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const notes = tune?.response.notes?.trim() ?? ''
  const title = song ? formatSong(song) : `Pedaleira — ${setupName}`

  const units: SheetUnit[] = chain.map((p, i) => ({
    key: p.id, badge: pad2(i + 1), tag: TYPE_LABELS[p.type] ?? '???',
    brand: p.brand, model: p.model, knobs: p.knobs, switches: p.switches, color: p.color,
  }))
  if (amp) {
    units.push({ key: amp.id, badge: 'AMP', tag: '', brand: amp.brand, model: amp.model, knobs: amp.knobs, switches: amp.switches })
  }

  const notesH = NOTES_BASE_H + Math.ceil(notes.length / 180) * 4.5
  const pages = paginate(units, notesH)
  const ampName = amp ? [amp.brand, amp.model].filter(Boolean).join(' ') : '—'

  return createPortal(
    <div className="settings-sheet" aria-hidden="true">
      {pages.map((page, pi) => (
        <section key={pi} className="sheet-page">
          {/* Bloco de título (repetido em cada folha) */}
          <div className="sheet-title-block">
            <div className="sheet-cell sheet-cell-title">
              <span className="sheet-cell-label">Pedaleira · Ficha de regulação</span>
              <span className="sheet-title">{title}</span>
            </div>
            <Cell label="Setup" value={setupName} />
            <Cell label="Data" value={date} />
            <Cell label="Folha" value={`${pi + 1} / ${pages.length}`} />
            <Cell label="Guitarra" value={GUITAR_NAME} />
            <Cell label="Amp" value={ampName} />
            <Cell label="Pedais" value={String(chain.length)} />
          </div>

          {page.chain && (
            <>
              <SectionHead n="01" label="Cadeia de sinal" />
              <div className="sheet-flow">
                <span className="sheet-flow-box sheet-flow-end">GTR</span>
                {units.map((u) => (
                  <span key={u.key} className="sheet-flow-step">
                    <span className="sheet-flow-arrow">→</span>
                    <span className={`sheet-flow-box ${u.badge === 'AMP' ? 'sheet-flow-end' : ''}`}>
                      <b>{u.badge}</b> {u.model}
                    </span>
                  </span>
                ))}
                {!amp && (
                  <span className="sheet-flow-step">
                    <span className="sheet-flow-arrow">→</span>
                    <span className="sheet-flow-box sheet-flow-end">AMP</span>
                  </span>
                )}
              </div>
            </>
          )}

          {page.units.length > 0 && (
            <>
              <SectionHead n="02" label={page.chain ? 'Regulações' : 'Regulações (cont.)'} />
              <div className="sheet-grid">
                {page.units.map((u) => <UnitCard key={u.key} unit={u} />)}
              </div>
            </>
          )}

          {page.notes && (
            <>
              <SectionHead n="03" label="Notas" />
              {notes && <p className="sheet-notes-text">{notes}</p>}
              <div className="sheet-notes-lines">
                {[0, 1, 2, 3].map((i) => <span key={i} />)}
              </div>
            </>
          )}
        </section>
      ))}
    </div>,
    document.body,
  )
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="sheet-cell">
      <span className="sheet-cell-label">{label}</span>
      <span className="sheet-cell-value">{value}</span>
    </div>
  )
}

function SectionHead({ n, label }: { n: string; label: string }) {
  return (
    <div className="sheet-section">
      <span className="sheet-section-n">{n}</span>
      <span className="sheet-section-label">{label}</span>
    </div>
  )
}
