import { useState } from 'react'
import { usePedalboardStore } from '../../store/usePedalboardStore'
import type { SetupSong } from '../../types'

/** "Artista — Música" (ou só a parte que existir). */
export function formatSong(song: SetupSong): string {
  return [song.artist, song.title].filter(Boolean).join(' — ')
}

/** Música do Setup, por cima da board. Clicar edita; × limpa. */
export function SongTitle() {
  const { currentSetup, setSong } = usePedalboardStore()
  const song = currentSetup.song
  const [editing, setEditing] = useState(false)
  const [artist, setArtist] = useState('')
  const [title, setTitle] = useState('')

  const startEdit = () => {
    setArtist(song?.artist ?? '')
    setTitle(song?.title ?? '')
    setEditing(true)
  }
  const commit = () => {
    setSong({ artist, title })
    setEditing(false)
  }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') setEditing(false)
  }

  if (editing) {
    const input = 'font-sketch text-2xl text-ink bg-paper border-b-2 border-ink outline-none px-1 min-w-0'
    return (
      <div className="flex items-end gap-2 flex-wrap">
        <input autoFocus value={artist} onChange={(e) => setArtist(e.target.value)} onKeyDown={onKey}
          placeholder="Artista" className={`${input} w-48`} />
        <span className="font-sketch text-2xl text-ink">—</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={onKey}
          placeholder="Música" className={`${input} w-64`} />
        <button type="button" onClick={commit}
          className="font-body text-[12px] border-[1.5px] border-ink rounded-hand px-2.5 py-0.5 text-ink">OK</button>
        <button type="button" onClick={() => setEditing(false)}
          className="font-body text-[12px] text-gray-sketch px-1 hover:text-ink">cancelar</button>
      </div>
    )
  }

  if (!song) {
    return (
      <button type="button" onClick={startEdit}
        className="self-start font-body text-[12px] text-gray-sketch hover:text-ink transition-colors"
        title="Indicar a música para a qual esta pedaleira está regulada">
        + música
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 min-w-0">
      <button type="button" onClick={startEdit} title="Editar a música"
        className="font-sketch text-3xl font-bold text-ink leading-none truncate text-left hover:opacity-80">
        {formatSong(song)}
      </button>
      <button type="button" onClick={() => setSong(null)} title="Limpar a música"
        className="font-body text-[14px] text-gray-sketch hover:text-ink px-1 leading-none">×</button>
    </div>
  )
}
