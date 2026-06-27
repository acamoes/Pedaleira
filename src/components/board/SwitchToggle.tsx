import type { PedalSwitch } from '../../types'

interface Props {
  sw: PedalSwitch
  onChange: (value: boolean) => void
  disabled?: boolean
}

export function SwitchToggle({ sw, onChange, disabled = false }: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!sw.value)}
      className={`flex flex-col items-center gap-0.5 cursor-pointer select-none
        disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {/* Toggle body */}
      <div
        className={`w-8 h-4 border-2 border-ink flex items-center transition-colors
          ${sw.value ? 'bg-ink' : 'bg-paper'}`}
      >
        <div
          className={`w-3 h-3 border border-ink transition-transform
            ${sw.value ? 'translate-x-4 bg-paper' : 'translate-x-0.5 bg-ink'}`}
        />
      </div>
      <span className="font-body text-[9px] text-gray-sketch leading-none">{sw.name}</span>
    </button>
  )
}
