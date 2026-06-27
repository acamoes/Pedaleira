import { useState, useRef, useEffect } from 'react'
import { SketchInput } from '../ui/SketchInput'
import { SketchButton } from '../ui/SketchButton'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { useIdentifyPedal } from '../../hooks/useIdentifyPedal'
import { usePedalboardStore } from '../../store/usePedalboardStore'
import { SEED_PEDAL_LIST } from '../../constants/seedPedals'

interface Props {
  onClose: () => void
}

export function AddPedalModal({ onClose }: Props) {
  const [modelName, setModelName] = useState('')
  const [error, setError] = useState('')
  const { isIdentifying } = usePedalboardStore()
  const { identify } = useIdentifyPedal()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const result = await identify(modelName)
    if (result.error) {
      setError(result.error)
    } else {
      onClose()
    }
  }

  // Seleção direta a partir do dropdown de pedais reconhecidos → adiciona logo
  async function handlePickSeed(e: React.ChangeEvent<HTMLSelectElement>) {
    const key = e.target.value
    if (!key) return
    setError('')
    const result = await identify(key)
    if (result.error) setError(result.error)
    else onClose()
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-paper border-2 border-ink shadow-sketch p-6 w-[340px] flex flex-col gap-4">
        {/* Title */}
        <h2 className="font-sketch text-2xl font-bold text-ink">
          + Adicionar pedal
        </h2>
        <p className="font-body text-xs text-gray-sketch leading-relaxed">
          Escreve o nome real do modelo (ex.: «Ibanez Tube Screamer Mini»,
          «Boss DS-1», «MXR Carbon Copy»).
        </p>

        {/* Dropdown de pedais já reconhecidos (sem precisar da IA) */}
        <div className="flex flex-col gap-1">
          <label htmlFor="seed-pick" className="font-sketch text-sm text-ink leading-none">
            Pedais reconhecidos
          </label>
          <select
            id="seed-pick"
            defaultValue=""
            onChange={handlePickSeed}
            disabled={isIdentifying}
            className="bg-paper border-2 border-ink px-3 py-2 font-body text-sm text-ink
              shadow-sketch-sm focus:outline-none cursor-pointer disabled:opacity-50"
          >
            <option value="">— escolher da lista —</option>
            {SEED_PEDAL_LIST.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 border-t border-gray-light" />
          <span className="font-body text-[10px] text-gray-sketch uppercase">ou</span>
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
            disabled={isIdentifying}
          />

          {error && (
            <p className="font-body text-xs text-red-700 border border-red-300 px-2 py-1">
              {error}
            </p>
          )}

          {isIdentifying && <LoadingSpinner label="A identificar pedal..." />}

          <div className="flex gap-3 justify-end">
            <SketchButton
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isIdentifying}
            >
              Cancelar
            </SketchButton>
            <SketchButton type="submit" disabled={isIdentifying || !modelName.trim()}>
              Adicionar
            </SketchButton>
          </div>
        </form>
      </div>
    </div>
  )
}
