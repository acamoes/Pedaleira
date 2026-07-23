import { useState, useRef, useEffect } from 'react'
import { SketchInput } from '../ui/SketchInput'
import { SketchButton } from '../ui/SketchButton'
import { ColorPalette } from '../ui/ColorPalette'
import { useIdentifyPedal } from '../../hooks/useIdentifyPedal'
import { usePedalboardStore } from '../../store/usePedalboardStore'
import { SEED_PEDAL_LIST } from '../../constants/seedPedals'
import { isDarkColor } from '../../constants/colorPalette'
import type { IdentifyPedalResponse } from '../../types'

interface Props {
  onClose: () => void
}

interface Resolved {
  modelName: string
  data: IdentifyPedalResponse
  recognized: boolean
}

export function AddPedalModal({ onClose }: Props) {
  const [modelName, setModelName] = useState('')
  const [error, setError] = useState('')
  const [resolved, setResolved] = useState<Resolved | null>(null)
  const [color, setColor] = useState('')
  const { resolvePedal } = useIdentifyPedal()
  const addPedal = usePedalboardStore((s) => s.addPedal)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Fase 1 → resolve o pedal e avança para o passo de cor.
  function goToColor(name: string) {
    setError('')
    const res = resolvePedal(name)
    if ('error' in res) { setError(res.error); return }
    setResolved({ modelName: name.trim(), data: res.data, recognized: res.recognized })
    setColor(res.data.color ?? '')   // pré-preenchido com a cor real do pedal
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    goToColor(modelName)
  }

  function handlePickSeed(e: React.ChangeEvent<HTMLSelectElement>) {
    const key = e.target.value
    if (key) goToColor(key)
  }

  // Fase 2 → grava o pedal com a cor escolhida.
  function handleConfirm() {
    if (!resolved) return
    addPedal(resolved.modelName, { ...resolved.data, color })
    onClose()
  }

  // ───────────────────────── FASE 2 · COR ─────────────────────────
  if (resolved) {
    const title = resolved.data.model || resolved.modelName
    const subtitle = [resolved.data.brand, resolved.data.type].filter(Boolean).join(' · ')
    return (
      <div
        className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-paper border-2 border-ink rounded-[6px] shadow-sketch p-6 w-[340px] flex flex-col gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-gray-sketch">Passo 2 · cor</p>
            <h2 className="font-sketch text-2xl font-bold text-ink leading-none mt-1">{title}</h2>
            {subtitle && <p className="font-body text-xs text-gray-sketch mt-0.5">{subtitle}</p>}
            {!resolved.recognized && (
              <p className="font-body text-[11px] text-gray-sketch italic mt-1.5">
                Pedal não reconhecido — escolhe a cor; podes editar tipo e knobs depois.
              </p>
            )}
          </div>

          {/* Pré-visualização do corpo do pedal */}
          <div
            className="border-2 border-ink rounded-[8px] h-16 flex items-center justify-center shadow-sketch-sm"
            style={{
              backgroundColor: color || 'var(--color-paper)',
              color: color && isDarkColor(color) ? '#f5f0e8' : 'var(--color-ink)',
            }}
          >
            <span className="font-sketch text-lg font-bold">{title}</span>
          </div>

          <ColorPalette value={color} onChange={setColor} />

          <div className="flex gap-3 justify-between">
            <SketchButton type="button" variant="ghost" onClick={() => { setResolved(null); setError('') }}>
              ← Voltar
            </SketchButton>
            <SketchButton type="button" onClick={handleConfirm}>Adicionar</SketchButton>
          </div>
        </div>
      </div>
    )
  }

  // ──────────────────────── FASE 1 · IDENTIFICAR ────────────────────────
  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-paper border-2 border-ink rounded-[6px] shadow-sketch p-6 w-[340px] flex flex-col gap-4">
        <h2 className="font-sketch text-2xl font-bold text-ink">+ Adicionar pedal</h2>
        <p className="font-body text-xs text-gray-sketch leading-relaxed">
          Escreve o nome real do modelo (ex.: «Ibanez Tube Screamer Mini»,
          «Boss DS-1», «MXR Carbon Copy»).
        </p>

        {/* Dropdown de pedais já reconhecidos */}
        <div className="flex flex-col gap-1">
          <label htmlFor="seed-pick" className="font-body text-[13px] font-semibold text-ink leading-none">
            Pedais reconhecidos
          </label>
          <select
            id="seed-pick"
            defaultValue=""
            onChange={handlePickSeed}
            className="bg-paper border-2 border-ink rounded-hand-2 px-3 py-2 font-body text-sm text-ink
              shadow-sketch-sm focus:outline-none cursor-pointer"
          >
            <option value="">— escolher da lista —</option>
            {SEED_PEDAL_LIST.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 border-t border-gray-light" />
          <span className="font-mono text-[10px] text-gray-sketch uppercase">ou</span>
          <div className="flex-1 border-t border-gray-light" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <SketchInput
            ref={inputRef}
            id="pedal-name"
            label="Nome do modelo"
            placeholder="ex.: Boss DS-1"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
          />

          {error && (
            <p className="font-body text-xs text-accent border-[1.5px] border-accent rounded-[4px] px-2 py-1">
              {error}
            </p>
          )}

          <div className="flex gap-3 justify-end">
            <SketchButton type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </SketchButton>
            <SketchButton type="submit" disabled={!modelName.trim()}>
              Continuar →
            </SketchButton>
          </div>
        </form>
      </div>
    </div>
  )
}
