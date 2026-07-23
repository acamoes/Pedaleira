import { useState, useRef } from 'react'
import { usePedalboardStore } from '../../store/usePedalboardStore'
import { SketchInput } from '../ui/SketchInput'
import { exportSetupJson, importSetupJson } from '../../utils/importExport'
import logoUrl from '../../../logo.png'

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/>
      <line x1="12" y1="19" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/>
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="5" y2="12"/>
      <line x1="19" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/>
      <line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}
function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.13-.31-.54-1.53.11-3.19 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.05.14 3 .4 2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.19.77.84 1.23 1.92 1.23 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.82 1.1.82 2.22 0 1.61-.02 2.9-.02 3.29 0 .32.22.7.82.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z"/>
    </svg>
  )
}

export function Header() {
  const {
    theme, toggleTheme,
    currentSetup, savedSetups,
    renameCurrentSetup, saveCurrentAsSetup, loadSetup, deleteSetup, importSetup,
  } = usePedalboardStore()

  const [editingName, setEditingName] = useState(false)
  const [nameValue,   setNameValue]   = useState(currentSetup.name)
  const [showSetups,  setShowSetups]  = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const setup = await importSetupJson(file)
      importSetup(setup)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao importar.')
    }
    e.target.value = ''
  }

  function commitRename() {
    if (nameValue.trim()) renameCurrentSetup(nameValue.trim())
    else setNameValue(currentSetup.name)
    setEditingName(false)
  }

  const seg = 'font-body text-[13px] text-ink px-3 py-1.5 hover:bg-paper-dark transition-colors ' +
    'border-l-[1.5px] border-gray-light first:border-l-0 disabled:opacity-40 disabled:hover:bg-transparent'

  return (
    <header className="border-b-2 border-ink bg-paper flex items-center justify-between px-5 py-2.5 gap-4">
      {/* Logótipo Pedaleira */}
      <img
        src={logoUrl}
        alt="Pedaleira"
        className="pl-5 select-none"
        style={{ height: 'clamp(2.2rem, 4.6vw, 3.4rem)', width: 'auto' }}
        draggable={false}
      />

      {/* Controlos — nome do setup + biblioteca agrupada + tema */}
      <div className="flex items-center gap-3 flex-wrap justify-end">
        {/* Nome do setup */}
        {editingName ? (
          <SketchInput
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => { if (e.key === 'Enter') commitRename() }}
            className="w-40"
            autoFocus
          />
        ) : (
          <button
            type="button"
            className="group flex items-center gap-2 border-2 border-gray-light rounded-hand
              px-3 py-1.5 bg-paper hover:border-ink transition-colors"
            title="Clica para renomear"
            onClick={() => { setNameValue(currentSetup.name); setEditingName(true) }}
          >
            <span className="font-mono text-[10px] uppercase tracking-wide text-gray-sketch">Setup</span>
            <span className="font-body text-[13px] font-semibold text-ink">{currentSetup.name}</span>
            <span className="text-gray-sketch opacity-60 group-hover:opacity-100 text-xs">✎</span>
          </button>
        )}

        {/* Biblioteca — uma peça segmentada (Guardar / JSON / Setups) */}
        <div className="flex items-stretch border-2 border-ink rounded-hand bg-paper
          shadow-sketch-sm overflow-hidden">
          <button type="button" className={seg} onClick={saveCurrentAsSetup}>Guardar</button>
          <button type="button" className={seg}
            onClick={() => exportSetupJson(currentSetup)}
            disabled={currentSetup.pedals.length === 0}
            title="Exportar setup em JSON">↓ JSON</button>
          <button type="button" className={seg}
            onClick={() => fileInputRef.current?.click()}
            title="Importar setup de JSON">↑ JSON</button>

          {/* Dropdown de setups */}
          <div className="relative flex">
            <button type="button" className={seg} onClick={() => setShowSetups((v) => !v)}>
              Setups <span className="font-mono text-[11px] text-gray-sketch">({savedSetups.length})</span>
            </button>
            {showSetups && (
              <div className="absolute right-0 top-full mt-1.5 bg-paper border-2 border-ink shadow-sketch z-50 min-w-[210px] rounded-hand-2 overflow-hidden">
                {savedSetups.length === 0 ? (
                  <p className="font-body text-xs text-gray-sketch p-3">Nenhum setup guardado.</p>
                ) : savedSetups.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-3 py-2 border-b border-gray-light last:border-0 hover:bg-paper-dark">
                    <button type="button" className="font-body text-[13px] text-ink flex-1 text-left"
                      onClick={() => { loadSetup(s.id); setShowSetups(false) }}>
                      {s.name}
                    </button>
                    <button type="button" className="text-gray-sketch hover:text-accent ml-2"
                      onClick={() => deleteSetup(s.id)} title="Apagar setup">
                      <svg width="10" height="10" viewBox="0 0 10 10">
                        <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5"/>
                        <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="application/json,.json"
          onChange={handleImportFile} className="hidden" />

        {/* Toggle tema */}
        <button
          type="button"
          title={theme === 'light' ? 'Tema escuro' : 'Tema claro'}
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center border-2 border-ink rounded-hand
            text-ink hover:bg-paper-dark shadow-sketch-sm active:translate-y-px active:shadow-none transition-all"
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>

        {/* Link para o repositório GitHub */}
        <a
          href="https://github.com/acamoes/Pedaleira"
          target="_blank"
          rel="noopener noreferrer"
          title="Ver código no GitHub"
          className="w-8 h-8 flex items-center justify-center border-2 border-ink text-ink
            hover:bg-paper-dark shadow-sketch-sm"
        >
          <GithubIcon />
        </a>
      </div>
    </header>
  )
}
