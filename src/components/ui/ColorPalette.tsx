import { PALETTE, isDarkColor } from '../../constants/colorPalette'

interface Props {
  value: string
  onChange: (hex: string) => void
}

// Grelha de swatches + picker de cor personalizada.
// Reutilizado no AddPedalModal (passo de cor) e no PedalEditModal.
export function ColorPalette({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-6 gap-2">
        {PALETTE.map((c) => {
          const isSelected = value === c.hex
          return (
            <button
              key={c.hex || 'papel'}
              type="button"
              title={c.label}
              onClick={() => onChange(c.hex)}
              className="relative w-full aspect-square border-2 rounded-[4px] transition-transform hover:scale-110"
              style={{
                backgroundColor: c.hex || 'var(--color-paper)',
                borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-ink)',
                boxShadow: isSelected ? '0 0 0 2px var(--color-accent)' : undefined,
              }}
            >
              {!c.hex && !isSelected && (
                <span className="absolute inset-0 flex items-center justify-center font-mono text-[7px] text-gray-sketch">
                  papel
                </span>
              )}
              {isSelected && (
                <span
                  className="absolute inset-0 flex items-center justify-center text-base font-bold"
                  style={{ color: c.hex && isDarkColor(c.hex) ? '#f5f0e8' : '#1a1a1a' }}
                >
                  ✓
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Cor personalizada */}
      <div className="flex items-center gap-2">
        <label className="font-body text-[13px] text-ink">Personalizada:</label>
        <input
          type="color"
          value={value || '#f2ede0'}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-8 border-2 border-ink rounded-[3px] cursor-pointer bg-transparent"
        />
        <span className="font-mono text-[11px] text-gray-sketch">{value || 'papel'}</span>
      </div>
    </div>
  )
}
