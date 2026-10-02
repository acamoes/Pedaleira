import { useState } from 'react'
import { SketchInput } from '../../ui/SketchInput'
import { SketchButton } from '../../ui/SketchButton'
import { usePedalboardStore } from '../../../store/usePedalboardStore'
import { SEED_AMP_LIST, SEED_AMPS, findSeedAmp, genericAmp } from '../../../constants/seedAmps'

/** Acrescenta um amp ao Setup (fica como Amp ativo). Modelos desconhecidos → amp genérico. */
export function AddAmpModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const addAmp = usePedalboardStore((s) => s.addAmp)

  function add(modelName: string) {
    const trimmed = modelName.trim()
    if (!trimmed) return
    addAmp(trimmed, findSeedAmp(trimmed) ?? genericAmp(trimmed))
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-paper border-2 border-ink rounded-[6px] shadow-sketch p-6 w-[340px] flex flex-col gap-4">
        <h2 className="font-sketch text-2xl font-bold text-ink leading-none">Outro amplificador</h2>

        <label className="flex flex-col gap-1">
          <span className="font-body text-[13px] font-semibold text-ink">Amps conhecidos</span>
          <select defaultValue="" onChange={(e) => e.target.value && add(SEED_AMPS[e.target.value].brand + ' ' + SEED_AMPS[e.target.value].model)}
            className="bg-paper border-2 border-ink rounded-[4px] px-2 py-1.5 font-body text-sm text-ink">
            <option value="">Escolhe…</option>
            {SEED_AMP_LIST.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
          </select>
        </label>

        <form onSubmit={(e) => { e.preventDefault(); add(name) }} className="flex flex-col gap-2">
          <SketchInput id="amp-name" label="…ou escreve o modelo" placeholder="ex.: Marshall MG15"
            value={name} onChange={(e) => setName(e.target.value)} />
          <p className="font-body text-[11px] text-gray-sketch italic leading-snug">
            Se não o conhecer, entra como amp genérico (Gain, Volume, Bass, Middle, Treble).
          </p>
          <div className="flex gap-2 justify-end">
            <SketchButton type="button" size="sm" variant="ghost" onClick={onClose}>Cancelar</SketchButton>
            <SketchButton type="submit" size="sm" disabled={!name.trim()}>Adicionar</SketchButton>
          </div>
        </form>
      </div>
    </div>
  )
}
