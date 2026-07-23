import { useState } from 'react'
import type { Pedal } from '../../types'
import { usePedalboardStore } from '../../store/usePedalboardStore'
import { SketchButton } from '../ui/SketchButton'
import { ColorPalette } from '../ui/ColorPalette'

interface Props {
  pedal: Pedal
  onClose: () => void
}

export function PedalEditModal({ pedal, onClose }: Props) {
  const { updatePedalColor } = usePedalboardStore()
  const [selected, setSelected] = useState(pedal.color)

  function handleSave() {
    updatePedalColor(pedal.id, selected)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-paper border-2 border-ink rounded-[6px] shadow-sketch p-5 w-[340px] flex flex-col gap-4">
        <div>
          <h2 className="font-sketch text-2xl font-bold text-ink leading-none">{pedal.model}</h2>
          <p className="font-body text-xs text-gray-sketch mt-0.5">{pedal.brand} · {pedal.type}</p>
        </div>

        <div>
          <p className="font-body text-[13px] font-semibold text-ink mb-2">Cor do pedal</p>
          <ColorPalette value={selected} onChange={setSelected} />
        </div>

        <div className="flex gap-3 justify-end">
          <SketchButton variant="ghost" onClick={onClose}>Cancelar</SketchButton>
          <SketchButton onClick={handleSave}>Aplicar</SketchButton>
        </div>
      </div>
    </div>
  )
}
