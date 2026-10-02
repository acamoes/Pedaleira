import { useState } from 'react'
import type { Amp, AmpLayout } from '../../../types'
import { usePedalboardStore } from '../../../store/usePedalboardStore'
import { KnobControl } from '../KnobControl'
import { knobInfo } from '../../../constants/knobInfo'

// ─── Amp ativo na board ──────────────────────────────────────────────────────
// Cada layout imita o amp real: proporções, cores e os controlos pela ordem do
// painel. O cabo entra pela esquerda, à altura do painel (onde fica o INPUT real).

/** Dimensões do corpo do amp e altura da ficha de entrada (usadas pelo Pedalboard). */
export const AMP_DIMS: Record<AmpLayout, { w: number; h: number; jackY: number }> = {
  'frontman-10g': { w: 296, h: 236, jackY: 50 },
  'katana-mini':  { w: 412, h: 212, jackY: 64 },
  'thr5':         { w: 392, h: 196, jackY: 50 },
  'generic':      { w: 280, h: 220, jackY: 50 },
}
export const AMP_HEADER_H = 24   // linha do seletor de amp, por cima do corpo

const LIGHT_TEXT = '#f2ede2'
const DARK_TEXT = '#1d1c19'

interface Props {
  amp: Amp
  onAddAmp: () => void
}

export function AmpCard({ amp, onAddAmp }: Props) {
  const { highlightedKnobs, updateAmpKnobValue, updateAmpSwitchValue } = usePedalboardStore()

  /** Knob do amp pelo nome (null se este amp não o tiver). */
  const K = (name: string, textColor: string) => {
    const k = amp.knobs.find((x) => x.name === name)
    if (!k) return null
    return (
      <KnobControl
        key={k.name}
        knob={k}
        textColor={textColor}
        info={knobInfo(k.name)}
        highlighted={highlightedKnobs.includes(`${amp.id}:${k.name}`)}
        onChange={(v) => updateAmpKnobValue(amp.id, k.name, v)}
      />
    )
  }
  const sw = (name: string) => amp.switches.find((s) => s.name === name)
  const toggle = (name: string) => {
    const s = sw(name)
    if (s) updateAmpSwitchValue(amp.id, name, !s.value)
  }

  const { w, h } = AMP_DIMS[amp.layout]
  let body: JSX.Element
  switch (amp.layout) {
    case 'frontman-10g': body = <Frontman10G K={K} od={sw('Overdrive')?.value ?? false} onOd={() => toggle('Overdrive')} />; break
    case 'katana-mini':  body = <KatanaMini amp={amp} K={K} onType={(v) => updateAmpKnobValue(amp.id, 'Amp Type', v)} />; break
    case 'thr5':         body = <Thr5 K={K} />; break
    default:             body = <GenericAmp amp={amp} K={K} onSwitch={toggle} />
  }

  return (
    <div className="flex flex-col select-none" style={{ width: w }}>
      <AmpPicker amp={amp} onAddAmp={onAddAmp} />
      <div style={{ width: w, height: h }}>{body}</div>
    </div>
  )
}

type KFn = (name: string, textColor: string) => JSX.Element | null

// ─── Seletor do Amp ativo ────────────────────────────────────────────────────

function AmpPicker({ amp, onAddAmp }: { amp: Amp; onAddAmp: () => void }) {
  const { currentSetup, setActiveAmp, removeAmp } = usePedalboardStore()
  const [open, setOpen] = useState(false)
  return (
    <div className="relative self-end" style={{ height: AMP_HEADER_H }}>
      <button type="button" onClick={() => setOpen((o) => !o)}
        title="Escolher o amplificador onde a cadeia termina"
        className="font-mono text-[10px] uppercase tracking-wide text-ink border-[1.5px] border-ink rounded-hand
          bg-paper px-2 py-0.5 hover:bg-paper-dark">
        Amp · {[amp.brand, amp.model].filter(Boolean).join(' ')} ▾
      </button>
      {open && (
        <div className="absolute right-0 top-6 z-40 min-w-[200px] bg-paper border-2 border-ink rounded-[6px] shadow-sketch py-1"
          onMouseLeave={() => setOpen(false)}>
          {currentSetup.amps.map((a) => (
            <button key={a.id} type="button"
              onClick={() => { setActiveAmp(a.id); setOpen(false) }}
              className="w-full text-left font-body text-[12px] text-ink px-3 py-1 hover:bg-paper-dark flex gap-2">
              <span className="w-3">{a.id === amp.id ? '✓' : ''}</span>
              {[a.brand, a.model].filter(Boolean).join(' ')}
            </button>
          ))}
          <div className="border-t border-gray-light my-1" />
          <button type="button" onClick={() => { setOpen(false); onAddAmp() }}
            className="w-full text-left font-body text-[12px] text-ink px-3 py-1 hover:bg-paper-dark">+ Outro amp…</button>
          {currentSetup.amps.length > 1 && (
            <button type="button" onClick={() => { removeAmp(amp.id); setOpen(false) }}
              className="w-full text-left font-body text-[12px] text-gray-sketch px-3 py-1 hover:bg-paper-dark hover:text-ink">
              Remover este amp
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Peças comuns ────────────────────────────────────────────────────────────

/** Tomada INPUT (decorativa — a ficha interativa é desenhada pelo Pedalboard). */
function InputJack({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 flex-none" style={{ color }}>
      <svg width="16" height="16" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="6.5" fill="#2a2a2a" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="8" cy="8" r="2.6" fill="#0d0d0d" />
      </svg>
      <span className="font-mono text-[6.5px] uppercase tracking-wide opacity-80">Input</span>
    </div>
  )
}

/** Grupo de controlos com o título serigrafado por cima (ex.: DELAY). */
function Group({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center" style={{ color }}>
      <span className="font-mono text-[6.5px] uppercase tracking-[0.15em] opacity-70 border-b px-2 mb-0.5"
        style={{ borderColor: color }}>{label}</span>
      <div className="flex gap-1.5">{children}</div>
    </div>
  )
}

// ─── Fender Frontman 10G ─────────────────────────────────────────────────────
// Combo preto (tolex), painel cromado no topo, grelha escura com o "Fender" em script.

function Frontman10G({ K, od, onOd }: { K: KFn; od: boolean; onOd: () => void }) {
  return (
    <div className="w-full h-full rounded-[10px] border-2 border-ink shadow-sketch p-2 flex flex-col gap-2"
      style={{ background: '#1e1e1e' }}>
      {/* Painel cromado */}
      <div className="h-[80px] flex-none rounded-[4px] flex items-center justify-between px-2.5"
        style={{ background: 'linear-gradient(#e2e2de, #b9b9b4)', color: DARK_TEXT, boxShadow: 'inset 0 -2px 0 #8d8d88' }}>
        <InputJack color={DARK_TEXT} />
        {K('Gain', DARK_TEXT)}
        {/* botão Over-drive Select, com LED */}
        <button type="button" onClick={onOd} title="Over-drive Select"
          className="flex flex-col items-center gap-0.5" style={{ color: DARK_TEXT }}>
          <span className="w-2 h-2 rounded-full border border-black/50"
            style={{ background: od ? '#ff3b2f' : '#5a1512', boxShadow: od ? '0 0 6px #ff3b2f' : 'none' }} />
          <span className="w-5 h-5 rounded-[3px] border-[1.5px] border-black/70"
            style={{ background: od ? '#2b2b2b' : '#3b3b3b', boxShadow: od ? 'inset 0 2px 2px #000' : '0 2px 0 #000' }} />
          <span className="font-mono text-[6.5px] uppercase leading-none text-center">Over-drive<br />Select</span>
        </button>
        {K('Volume', DARK_TEXT)}
        {K('Treble', DARK_TEXT)}
        {K('Bass', DARK_TEXT)}
      </div>
      {/* Grelha */}
      <div className="flex-1 rounded-[4px] relative overflow-hidden border border-black"
        style={{
          backgroundColor: '#3a3a38',
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,.07) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 1px, transparent 1px 3px)',
        }}>
        <span className="absolute left-3 top-1.5 font-sketch italic font-bold text-[28px] leading-none"
          style={{ color: '#e9e9e6', textShadow: '1px 1px 0 #000' }}>Fender</span>
        <span className="absolute right-2.5 bottom-1.5 font-mono text-[8px] tracking-[0.2em] uppercase"
          style={{ color: '#c9c9c4' }}>Frontman 10G</span>
      </div>
    </div>
  )
}

// ─── Boss Katana-Mini ────────────────────────────────────────────────────────
// Caixa preta compacta com alça, painel de topo preto com serigrafia branca,
// interruptor AMP TYPE de 3 posições e grelha metálica.

function KatanaMini({ amp, K, onType }: { amp: Amp; K: KFn; onType: (v: number) => void }) {
  const type = amp.knobs.find((k) => k.name === 'Amp Type')
  return (
    <div className="w-full h-full flex flex-col items-center">
      {/* alça */}
      <div className="h-[14px] w-[46%] rounded-t-[10px] border-2 border-b-0 border-ink flex-none"
        style={{ background: '#2a2622' }} />
      <div className="w-full flex-1 rounded-[8px] border-2 border-ink shadow-sketch p-2 flex flex-col gap-2"
        style={{ background: '#161616' }}>
        <div className="h-[80px] flex-none rounded-[4px] flex items-center justify-between px-2 border border-white/10"
          style={{ background: '#1f1f1f', color: LIGHT_TEXT }}>
          <InputJack color={LIGHT_TEXT} />
          {type && <AmpTypeSwitch labels={type.labels ?? []} value={Math.round(type.value - type.min)}
            onPick={(i) => onType(type.min + i)} />}
          {K('Gain', LIGHT_TEXT)}
          {K('Volume', LIGHT_TEXT)}
          {K('Bass', LIGHT_TEXT)}
          {K('Middle', LIGHT_TEXT)}
          {K('Treble', LIGHT_TEXT)}
          <Group label="Delay" color={LIGHT_TEXT}>
            {K('Delay Time', LIGHT_TEXT)}
            {K('Delay Level', LIGHT_TEXT)}
          </Group>
        </div>
        <div className="flex-1 rounded-[4px] relative overflow-hidden border border-black"
          style={{ backgroundColor: '#0e0e0e', backgroundImage: 'radial-gradient(#4a4a4a 0.9px, transparent 1.2px)', backgroundSize: '5px 5px' }}>
          <span className="absolute left-3 top-2 font-body font-black text-[20px] tracking-tight leading-none"
            style={{ color: '#f4f4f4' }}>BOSS</span>
          <span className="absolute right-3 bottom-2 font-mono text-[9px] tracking-[0.25em] uppercase"
            style={{ color: '#d0d0d0' }}>Katana-Mini</span>
        </div>
      </div>
    </div>
  )
}

/** Interruptor AMP TYPE de 3 posições (Brown / Crunch / Clean). */
function AmpTypeSwitch({ labels, value, onPick }: { labels: string[]; value: number; onPick: (i: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-0.5" style={{ color: LIGHT_TEXT }}>
      <span className="font-mono text-[6.5px] uppercase tracking-wide opacity-70">Amp Type</span>
      <div className="flex items-stretch gap-1">
        <div className="w-2.5 rounded-full border border-white/40 relative" style={{ background: '#0b0b0b' }}>
          <span className="absolute left-[1px] w-[6px] h-[10px] rounded-[2px] bg-[#cfcfcf] transition-all"
            style={{ top: `${(value / Math.max(1, labels.length - 1)) * 70}%` }} />
        </div>
        <div className="flex flex-col justify-between">
          {labels.map((l, i) => (
            <button key={l} type="button" onClick={() => onPick(i)}
              className={`font-mono text-[7px] uppercase leading-[11px] text-left ${i === value ? 'font-bold' : 'opacity-50 hover:opacity-90'}`}
              style={{ color: i === value ? '#ffffff' : LIGHT_TEXT }}>{l}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Yamaha THR5 ─────────────────────────────────────────────────────────────
// Amp de secretária retro: corpo prateado, controlos no topo, grelha escura
// com o brilho âmbar das "válvulas" e os dois altifalantes.

function Thr5({ K }: { K: KFn }) {
  return (
    <div className="w-full h-full rounded-[14px] border-2 border-ink shadow-sketch p-2 flex flex-col gap-2"
      style={{ background: 'linear-gradient(#cfccc2, #a9a69c)' }}>
      <div className="h-[80px] flex-none rounded-[6px] flex items-center justify-between px-2"
        style={{ background: '#e4e1d7', color: DARK_TEXT, boxShadow: 'inset 0 1px 0 #fff, inset 0 -2px 0 #9a978d' }}>
        <InputJack color={DARK_TEXT} />
        {K('Amp', DARK_TEXT)}
        {K('Gain', DARK_TEXT)}
        {K('Master', DARK_TEXT)}
        {K('Tone', DARK_TEXT)}
        {K('Effect', DARK_TEXT)}
        {K('Delay/Reverb', DARK_TEXT)}
        {K('Volume', DARK_TEXT)}
        {/* TAP/TUNER: botão de ação no amp real (não guarda estado) */}
        <div className="flex flex-col items-center gap-0.5 flex-none" title="Tap / Tuner (no amp real)" style={{ color: DARK_TEXT }}>
          <span className="w-5 h-5 rounded-full border-[1.5px] border-black/60" style={{ background: '#d2cfc5', boxShadow: '0 2px 0 #8d8a80' }} />
          <span className="font-mono text-[6.5px] uppercase leading-none text-center">Tap<br />Tuner</span>
        </div>
      </div>
      <div className="flex-1 rounded-[8px] relative overflow-hidden border border-black"
        style={{
          backgroundColor: '#2b2925',
          backgroundImage: 'radial-gradient(ellipse 38% 55% at 50% 55%, rgba(255,170,60,.55), rgba(255,140,30,.12) 60%, transparent 75%), repeating-linear-gradient(90deg, rgba(255,255,255,.06) 0 1px, transparent 1px 4px)',
        }}>
        {/* dois altifalantes */}
        {['18%', '82%'].map((left) => (
          <span key={left} className="absolute rounded-full border border-white/15"
            style={{ left, top: '50%', width: 58, height: 58, transform: 'translate(-50%,-50%)' }} />
        ))}
        <span className="absolute left-3 top-1.5 font-body font-bold text-[10px] tracking-[0.3em]" style={{ color: '#d9d5c9' }}>YAMAHA</span>
        <span className="absolute right-3 top-1 font-body font-black italic text-[18px] leading-none" style={{ color: '#f0ece0' }}>THR5</span>
      </div>
    </div>
  )
}

// ─── Amp genérico ────────────────────────────────────────────────────────────

function GenericAmp({ amp, K, onSwitch }: { amp: Amp; K: KFn; onSwitch: (name: string) => void }) {
  return (
    <div className="w-full h-full rounded-[8px] border-2 border-ink shadow-sketch p-2 flex flex-col gap-2 bg-paper-dark text-ink">
      <div className="h-[80px] flex-none rounded-[4px] border-[1.5px] border-ink bg-paper flex items-center justify-around px-2">
        <InputJack color="var(--color-ink)" />
        {amp.knobs.map((k) => K(k.name, 'var(--color-ink)'))}
        {amp.switches.map((s) => (
          <button key={s.name} type="button" onClick={() => onSwitch(s.name)}
            className="font-mono text-[8px] uppercase border border-ink rounded px-1"
            style={{ background: s.value ? 'var(--color-ink)' : 'transparent', color: s.value ? 'var(--color-paper)' : 'var(--color-ink)' }}>
            {s.name}
          </button>
        ))}
      </div>
      <div className="flex-1 rounded-[4px] border-[1.5px] border-ink relative"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, var(--board-stripe) 0 1px, transparent 1px 8px)' }}>
        <span className="absolute left-3 top-2 font-sketch text-[18px] font-bold">{amp.model}</span>
      </div>
    </div>
  )
}
