import { useState, useRef } from 'react'
import { usePedalboardStore } from '../../store/usePedalboardStore'
import { SketchButton } from '../ui/SketchButton'
import { SketchInput } from '../ui/SketchInput'
import { exportSetupJson, importSetupJson } from '../../utils/importExport'

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

  return (
    <header className="border-b-2 border-ink bg-paper flex items-center justify-between px-5 py-2 gap-4">
      {/* Título com filtro SVG brush — vermelho dessaturado, alinhado com a board */}
      <h1
        className="font-title leading-none tracking-wider pl-5"
        style={{
          color: '#e0492c',
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          filter: 'url(#brush-roughen)',
        }}
      >
        Pedaleira
      </h1>

      {/* Controlos */}
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {/* Nome do setup */}
        {editingName ? (
          <SketchInput
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => { if (e.key === 'Enter') commitRename() }}
            className="w-36"
            autoFocus
          />
        ) : (
          <button
            type="button"
            className="font-sketch text-sm text-ink hover:underline"
            title="Clica para renomear"
            onClick={() => { setNameValue(currentSetup.name); setEditingName(true) }}
          >
            {currentSetup.name}
          </button>
        )}

        <SketchButton size="sm" variant="ghost" onClick={saveCurrentAsSetup}>Guardar</SketchButton>

        {/* Export / Import JSON */}
        <SketchButton size="sm" variant="ghost"
          onClick={() => exportSetupJson(currentSetup)}
          disabled={currentSetup.pedals.length === 0}>
          ↓ JSON
        </SketchButton>
        <SketchButton size="sm" variant="ghost" onClick={() => fileInputRef.current?.click()}>
          ↑ JSON
        </SketchButton>
        <input ref={fileInputRef} type="file" accept="application/json,.json"
          onChange={handleImportFile} className="hidden" />

        {/* Dropdown de setups */}
        <div className="relative">
          <SketchButton size="sm" variant="ghost" onClick={() => setShowSetups((v) => !v)}>
            Setups ({savedSetups.length})
          </SketchButton>
          {showSetups && (
            <div className="absolute right-0 top-full mt-1 bg-paper border-2 border-ink shadow-sketch z-50 min-w-[200px]">
              {savedSetups.length === 0 ? (
                <p className="font-body text-xs text-gray-sketch p-3">Nenhum setup guardado.</p>
              ) : savedSetups.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-3 py-2 border-b border-gray-light last:border-0 hover:bg-paper-dark">
                  <button type="button" className="font-body text-xs text-ink flex-1 text-left"
                    onClick={() => { loadSetup(s.id); setShowSetups(false) }}>
                    {s.name}
                  </button>
                  <button type="button" className="text-gray-sketch hover:text-ink ml-2"
                    onClick={() => deleteSetup(s.id)}>
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

        {/* Toggle tema */}
        <button
          type="button"
          title={theme === 'light' ? 'Tema escuro' : 'Tema claro'}
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center border-2 border-ink text-ink
            hover:bg-paper-dark shadow-sketch-sm"
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>
    </header>
  )
}
