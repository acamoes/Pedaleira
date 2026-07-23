import { usePedalboardStore } from '../../store/usePedalboardStore'
import { SketchButton } from '../ui/SketchButton'

export function TuneResult() {
  const { tuneResult, currentSetup, clearTuneResult } = usePedalboardStore()

  if (!tuneResult) return null

  const { response } = tuneResult

  return (
    <div className="flex flex-col gap-3 border-t-2 border-ink pt-4 mt-2">
      {/* Song header */}
      <div>
        <p className="font-sketch text-base font-bold text-ink leading-snug">
          {response.song}
        </p>
        {response.artist && response.artist !== 'unknown artist' && (
          <p className="font-body text-xs text-gray-sketch">{response.artist}</p>
        )}
      </div>

      {/* Per-pedal settings */}
      <div className="flex flex-col gap-2">
        {response.settings.map((s) => {
          const pedal = currentSetup.pedals.find((p) => p.id === s.pedalId)
          if (!pedal) return null

          const knobEntries = Object.entries(s.knobs)
          const switchEntries = Object.entries(s.switches ?? {})

          return (
            <div key={s.pedalId} className="border border-gray-light rounded-[4px] p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-body text-[13px] font-bold text-ink">
                  {pedal.model}
                </span>
                <span
                  className={`font-mono text-[9px] tracking-wide px-1.5 py-px border rounded-[3px] ${
                    s.enabled
                      ? 'border-live text-live'
                      : 'border-gray-light text-gray-sketch'
                  }`}
                >
                  {s.enabled ? 'ON' : 'BYPASS'}
                </span>
              </div>

              {knobEntries.length > 0 && (
                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                  {knobEntries.map(([name, val]) => (
                    <span key={name} className="font-body text-[11px] text-ink">
                      {name}:{' '}
                      <strong>{typeof val === 'number' ? val : String(val)}</strong>
                    </span>
                  ))}
                </div>
              )}

              {switchEntries.length > 0 && (
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                  {switchEntries.map(([name, val]) => (
                    <span key={name} className="font-body text-[11px] text-gray-sketch">
                      {name}: {val ? 'ON' : 'OFF'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Notes */}
      {response.notes && (
        <div className="border-l-2 border-ink pl-3">
          <p className="font-sketch text-xs text-ink leading-relaxed italic">
            {response.notes}
          </p>
        </div>
      )}

      {/* Missing effects */}
      {response.missing.length > 0 && (
        <div className="bg-paper-dark border border-gray-light p-2">
          <p className="font-body text-[11px] text-ink font-semibold mb-1">
            Efeitos típicos desta música que faltam na board:
          </p>
          <div className="flex flex-wrap gap-1">
            {response.missing.map((m) => (
              <span
                key={m}
                className="font-mono text-[10px] border border-ink px-1 text-ink"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      <SketchButton
        variant="ghost"
        size="sm"
        onClick={clearTuneResult}
        className="self-start"
      >
        Limpar resultado
      </SketchButton>
    </div>
  )
}
