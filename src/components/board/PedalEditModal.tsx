import { useState } from 'react'
import type { Pedal } from '../../types'
import { usePedalboardStore } from '../../store/usePedalboardStore'
import { SketchButton } from '../ui/SketchButton'

const PALETTE = [
  { label: 'Default',    hex: '',        dark: false },
  { label: 'Preto',      hex: '#1a1a1a', dark: true  },
  { label: 'Vermelho',   hex: '#8b0000', dark: true  },
  { label: 'Azul',       hex: '#1a3a8b', dark: true  },
  { label: 'Verde',      hex: '#1a5c20', dark: true  },
  { label: 'Laranja',    hex: '#b84400', dark: true  },
  { label: 'Roxo',       hex: '#4a1a8b', dark: true  },
  { label: 'Marinha',    hex: '#002147', dark: true  },
  { label: 'Borgonha',   hex: '#6d1c2c', dark: true  },
  { label: 'Ardósia',    hex: '#3d4a5c', dark: true  },
  { label: 'Creme',      hex: '#f5e6c8', dark: false },
  { label: 'Branco',     hex: '#f8f8f0', dark: false },
]

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
      <div className="bg-paper border-2 border-ink shadow-sketch p-5 w-[320px] flex flex-col gap-4">
        <div>
          <h2 className="font-sketch text-xl font-bold text-ink">{pedal.model}</h2>
          <p className="font-body text-xs text-gray-sketch">{pedal.brand} · {pedal.type}</p>
        </div>

        {/* Paleta de cores */}
        <div>
          <p className="font-sketch text-sm text-ink mb-2">Cor do pedal</p>
          <div className="grid grid-cols-6 gap-2">
            {PALETTE.map((c) => {
              const isSelected = selected === c.hex
              return (
                <button
                  key={c.hex}
                  type="button"
                  title={c.label}
                  onClick={() => setSelected(c.hex)}
                  className="relative w-10 h-10 border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c.hex || 'var(--color-paper)',
                    borderColor: isSelected ? '#cc2200' : 'var(--color-ink)',
                    boxShadow: isSelected ? '0 0 0 2px #cc2200' : undefined,
                  }}
                >
                  {isSelected && (
                    <span
                      className="absolute inset-0 flex items-center justify-center text-lg font-bold"
                      style={{ color: c.dark ? '#f5f0e8' : '#1a1a1a' }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Cor personalizada */}
        <div className="flex items-center gap-2">
          <label className="font-sketch text-sm text-ink">Personalizada:</label>
          <input
            type="color"
            value={selected || '#f5f0e8'}
            onChange={(e) => setSelected(e.target.value)}
            className="w-10 h-8 border-2 border-ink cursor-pointer bg-transparent"
          />
          <span className="font-body text-xs text-gray-sketch">{selected || 'default'}</span>
        </div>

        <div className="flex gap-3 justify-end">
          <SketchButton variant="ghost" onClick={onClose}>Cancelar</SketchButton>
          <SketchButton onClick={handleSave}>Aplicar</SketchButton>
        </div>
      </div>
    </div>
  )
}
