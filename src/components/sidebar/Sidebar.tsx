import { TuneForm } from './TuneForm'
import { TuneResult } from './TuneResult'
import { usePedalboardStore } from '../../store/usePedalboardStore'
import { chainWarnings } from '../../utils/chainWarnings'
import { deriveChain } from '../../utils/chain'

export function Sidebar() {
  const { currentSetup } = usePedalboardStore()
  const chain = deriveChain(currentSetup.pedals, currentSetup.connections)
  const warnings = chainWarnings(chain)

  return (
    <aside className="w-[300px] min-w-[280px] border-l-2 border-ink bg-paper flex flex-col gap-0 overflow-y-auto">
      {/* Header */}
      <div className="border-b-2 border-ink p-4">
        <h2 className="font-sketch text-2xl font-bold text-ink leading-none">Aproximar uma música</h2>
        <p className="font-body text-[12px] text-gray-sketch mt-1.5 leading-relaxed">
          Com os pedais que tens, gera a pergunta, leva-a a um LLM e cola a
          resposta: a app monta a cadeia e regula os knobs para soar o mais
          parecido possível.
        </p>
      </div>

      {/* Avisos de ordem da cadeia */}
      {warnings.length > 0 && (
        <div className="border-b-2 border-ink p-3 bg-paper-dark">
          <p className="font-body text-[13px] font-bold text-accent mb-1.5 flex items-center gap-1.5">
            <span className="text-base leading-none">⚠</span> Ordem da cadeia
          </p>
          <ul className="flex flex-col gap-1">
            {warnings.map((w, i) => (
              <li key={i} className="font-body text-[11.5px] text-ink leading-snug">• {w}</li>
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
