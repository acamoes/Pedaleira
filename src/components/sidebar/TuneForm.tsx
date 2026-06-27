import { useState } from 'react'
import { SketchInput } from '../ui/SketchInput'
import { SketchButton } from '../ui/SketchButton'
import { usePedalboardStore } from '../../store/usePedalboardStore'
import { buildTunePrompt, parseTuneAnswer } from '../../utils/tunePrompt'
import type { ParsedTune } from '../../utils/tunePrompt'

export function TuneForm() {
  const [song, setSong] = useState('')
  const [artist, setArtist] = useState('')
  const [prompt, setPrompt] = useState('')
  const [answer, setAnswer] = useState('')
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<ParsedTune | null>(null)

  const {
    currentSetup, clearTuneResult, applyParsedTune,
    songHistory, loadFromHistory, clearHistory,
  } = usePedalboardStore()

  const noPedals = currentSetup.pedals.length === 0
  const pedalById = (id: string) => currentSetup.pedals.find((p) => p.id === id)

  function handleGenerate() {
    setError(''); setStatus(''); setPreview(null)
    if (!song.trim()) { setError('Escreve o nome da música.'); return }
    if (noPedals) { setError('Adiciona pedais à board primeiro.'); return }
    setPrompt(buildTunePrompt(currentSetup.pedals, song, artist))
    setCopied(false)
  }

  async function handleCopy() {
    try { await navigator.clipboard.writeText(prompt); setCopied(true); setTimeout(() => setCopied(false), 1500) }
    catch { setCopied(false) }
  }

  // Passo 2a — interpretar a resposta e mostrar PRÉ-VISUALIZAÇÃO (não aplica ainda)
  function handlePreview() {
    setError(''); setStatus('')
    if (!answer.trim()) { setError('Cola a resposta primeiro.'); return }
    const parsed = parseTuneAnswer(answer, currentSetup.pedals, song, artist)
    if (parsed.matchedCount === 0) {
      setError('Não consegui identificar nenhum dos teus pedais na resposta. Confirma que os nomes coincidem.')
      setPreview(null)
      return
    }
    setPreview(parsed)
  }

  // Passo 2b — confirmar e aplicar
  function handleConfirm() {
    if (!preview) return
    applyParsedTune(preview.response, preview.orderedIds)
    let msg = `${preview.matchedCount} pedal(is) configurado(s) e ligado(s) pela ordem indicada.`
    if (preview.unmatched.length) msg += ` Não encontrados: ${preview.unmatched.join(', ')}.`
    setStatus(msg)
    setPreview(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <SketchInput id="song-name" label="Música" placeholder="ex.: Suck My Kiss"
        value={song} onChange={(e) => { setSong(e.target.value); clearTuneResult() }} />
      <SketchInput id="artist-name" label="Artista (opcional)" placeholder="ex.: Red Hot Chili Peppers"
        value={artist} onChange={(e) => setArtist(e.target.value)} />

      {/* Histórico de músicas */}
      {songHistory.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="font-sketch text-xs text-gray-sketch">Músicas recentes</span>
            <button type="button" onClick={clearHistory}
              className="font-body text-[10px] text-gray-sketch hover:text-ink underline">limpar</button>
          </div>
          <div className="flex flex-wrap gap-1">
            {songHistory.map((h) => (
              <button
                key={`${h.song}|${h.artist}|${h.appliedAt}`}
                type="button"
                title={`Reaplicar: ${h.song}${h.artist ? ' — ' + h.artist : ''}`}
                onClick={() => { setSong(h.song); setArtist(h.artist); loadFromHistory(h); setStatus(`Reaplicado: ${h.song}`) }}
                className="font-body text-[10px] border border-ink px-1.5 py-0.5 text-ink hover:bg-paper-dark"
              >
                {h.song}
              </button>
            ))}
          </div>
        </div>
      )}

      {noPedals && (
        <p className="font-body text-xs text-gray-sketch italic">Adiciona pedais à board primeiro.</p>
      )}

      {/* PASSO 1 */}
      <SketchButton type="button" onClick={handleGenerate} disabled={!song.trim() || noPedals} className="w-full justify-center">
        1 · Gerar pergunta
      </SketchButton>

      {prompt && (
        <div className="flex flex-col gap-1">
          <label className="font-sketch text-sm text-ink leading-none">Pergunta (copia para o teu LLM)</label>
          <textarea readOnly value={prompt} rows={7}
            className="bg-paper border-2 border-ink px-2 py-1.5 font-body text-[11px] text-ink shadow-sketch-sm focus:outline-none resize-none leading-snug" />
          <SketchButton type="button" size="sm" variant="ghost" onClick={handleCopy} className="self-start">
            {copied ? '✓ Copiado' : 'Copiar pergunta'}
          </SketchButton>
        </div>
      )}

      {/* PASSO 2 */}
      <div className="flex flex-col gap-1">
        <label className="font-sketch text-sm text-ink leading-none">Resposta (cola aqui)</label>
        <textarea value={answer} onChange={(e) => { setAnswer(e.target.value); setPreview(null) }} rows={6}
          placeholder="Cola a resposta do LLM (ordem + tabela, ou JSON)..."
          className="bg-paper border-2 border-ink px-2 py-1.5 font-body text-[11px] text-ink placeholder:text-gray-sketch shadow-sketch-sm focus:outline-none resize-none leading-snug" />
      </div>

      <SketchButton type="button" onClick={handlePreview} disabled={!answer.trim() || noPedals} className="w-full justify-center">
        2 · Pré-visualizar interpretação
      </SketchButton>

      {/* Pré-visualização antes de aplicar */}
      {preview && (
        <div className="border-2 border-ink bg-paper-dark p-2 flex flex-col gap-1.5">
          <p className="font-sketch text-sm font-bold text-ink">Vou aplicar isto:</p>
          <p className="font-body text-[11px] text-ink">
            <strong>Ordem:</strong> Guitarra → {preview.orderedIds.map((id) => pedalById(id)?.model ?? '?').join(' → ')} → Amp
          </p>
          <div className="flex flex-col gap-0.5">
            {preview.orderedIds.map((id) => {
              const p = pedalById(id)
              const s = preview.response.settings.find((x) => x.pedalId === id)
              if (!p || !s) return null
              const knobs = Object.entries(s.knobs).map(([n, v]) => `${n} ${v}`).join(', ')
              return (
                <p key={id} className="font-body text-[10px] text-ink">
                  <strong>{p.model}:</strong> {knobs || '(sem valores detetados)'}
                </p>
              )
            })}
          </div>
          {preview.unmatched.length > 0 && (
            <p className="font-body text-[10px] text-gray-sketch">
              Ficam desligados: {preview.unmatched.join(', ')}
            </p>
          )}
          <div className="flex gap-2 mt-1">
            <SketchButton type="button" size="sm" onClick={handleConfirm}>Confirmar e aplicar</SketchButton>
            <SketchButton type="button" size="sm" variant="ghost" onClick={() => setPreview(null)}>Cancelar</SketchButton>
          </div>
        </div>
      )}

      {status && (
        <p className="font-body text-xs text-ink border border-gray-light bg-paper-dark px-2 py-1 leading-snug">{status}</p>
      )}
      {error && (
        <p className="font-body text-xs text-red-700 border border-red-300 px-2 py-1">{error}</p>
      )}
    </div>
  )
}
