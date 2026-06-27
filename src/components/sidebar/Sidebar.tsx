import { TuneForm } from './TuneForm'
import { TuneResult } from './TuneResult'
import { usePedalboardStore } from '../../store/usePedalboardStore'
import { chainWarnings } from '../../utils/chainWarnings'

export function Sidebar() {
  const { currentSetup } = usePedalboardStore()
  const chain = currentSetup.pedals.filter((p) => p.enabled).sort((a, b) => a.x - b.x)
  const warnings = chainWarnings(chain)

  return (
    <aside className="w-[280px] min-w-[260px] border-l-2 border-ink bg-paper flex flex-col gap-0 overflow-y-auto">
      {/* Header */}
      <div className="border-b-2 border-ink p-4">
        <h2 className="font-sketch text-xl font-bold text-ink">Aproximar uma música</h2>
        <p className="font-body text-xs text-gray-sketch mt-0.5 leading-relaxed">
          Com os pedais que tens, gera a pergunta, leva-a a um LLM e cola a
          resposta: a app monta a cadeia e regula os knobs para soar o mais
          parecido possível.
        </p>
      </div>

      {/* Avisos de ordem da cadeia */}
      {warnings.length > 0 && (
        <div className="border-b-2 border-ink p-3 bg-paper-dark">
          <p className="font-sketch text-sm font-bold text-ink mb-1">⚠ Ordem da cadeia</p>
          <ul className="flex flex-col gap-1">
            {warnings.map((w, i) => (
              <li key={i} className="font-body text-[11px] text-ink leading-snug">• {w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form + result */}
      <div className="p-4 flex flex-col gap-4 flex-1">
        <TuneForm />
        <TuneResult />
      </div>
    </aside>
  )
}
