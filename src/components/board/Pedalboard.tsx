import { useState, useRef, useEffect, useCallback } from 'react'
import { usePedalboardStore, CANVAS_H } from '../../store/usePedalboardStore'
import type { Pedal } from '../../types'
import { PedalCard } from './PedalCard'
import { AddPedalModal } from './AddPedalModal'
import { PedalEditModal } from './PedalEditModal'
import { GuitarJack } from './GuitarJack'
import { Amplifier } from './Amplifier'
import { CableConnections } from './CableConnections'
import { ChainWaveform } from './ChainWaveform'
import { SketchButton } from '../ui/SketchButton'
import { exportChainPng } from '../../utils/exportImage'
import { useAudioEngine } from '../../hooks/useAudioEngine'

const SNAP = 10  // grelha de snap ao largar (px)

// Dimensões dos elementos laterais (devem coincidir com os SVGs)
const GUITAR_W      = 90   // largura do SVG GuitarJack
const GUITAR_X      = 8
const GUITAR_JACK_Y = 200  // y do jack dentro do SVG
const AMP_W         = 88
const AMP_H         = 190
const AMP_MARGIN    = 8

export function Pedalboard() {
  const { currentSetup, movePedal, setAllEnabled, togglePedalEnabled } = usePedalboardStore()
  const { play, isPlaying, analyser } = useAudioEngine()
  const [showAddModal,  setShowAddModal]  = useState(false)
  const [editingPedal,  setEditingPedal]  = useState<Pedal | null>(null)
  const [draggingId,    setDraggingId]    = useState<string | null>(null)
  const [canvasW,       setCanvasW]       = useState(800)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Rastreia a largura real do canvas
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const obs = new ResizeObserver(([e]) => setCanvasW(e.contentRect.width))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // A guitarra é posicionada de modo a que o jack caia no centro vertical
  // do canvas (onde também ficam o jack do amp e o centro dos pedais).
  const guitarTop = Math.round(CANVAS_H / 2 - GUITAR_JACK_Y)

  // Posições dos jacks no canvas (em px)
  const guitarJack = {
    x: GUITAR_X + GUITAR_W,
    y: guitarTop + GUITAR_JACK_Y,
  }
  const ampJack = {
    x: canvasW - AMP_W - AMP_MARGIN,
    y: Math.round((CANVAS_H - AMP_H) / 2) + 95,   // 95 = y do jack no Amplifier.tsx
  }

  // Signal chain: só os pedais LIGADOS (enabled), ordenados por x.
  // Pedais desligados ("não ligados") ficam na board mas fora da cadeia/cabos.
  const chainPedals = currentSetup.pedals
    .filter((p) => p.enabled)
    .sort((a, b) => a.x - b.x)

  // Drag livre — delta em relação ao mousedown
  const startDrag = useCallback(
    (e: React.MouseEvent, pedal: Pedal) => {
      e.preventDefault()
      const startMouseX = e.clientX
      const startMouseY = e.clientY
      const startPedalX = pedal.x
      const startPedalY = pedal.y

      setDraggingId(pedal.id)

      const onMove = (ev: MouseEvent) => {
        movePedal(pedal.id, startPedalX + ev.clientX - startMouseX, startPedalY + ev.clientY - startMouseY)
      }
      const onUp = (ev: MouseEvent) => {
        // snap a uma grelha ao largar
        const rawX = startPedalX + ev.clientX - startMouseX
        const rawY = startPedalY + ev.clientY - startMouseY
        movePedal(pedal.id, Math.round(rawX / SNAP) * SNAP, Math.round(rawY / SNAP) * SNAP)
        setDraggingId(null)
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [movePedal],
  )

  const ampTop = Math.round((CANVAS_H - AMP_H) / 2)

  return (
    <div className="flex flex-col gap-3 flex-1 overflow-hidden">
      {/* Barra superior */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Play — toca um strum e ouve a saída do amp */}
        <button
          type="button"
          onClick={() => play(chainPedals)}
          title="Tocar um acorde e ouvir o som processado pelos pedais"
          className="flex items-center gap-2 font-body font-semibold border-2 border-ink px-4 py-1.5 text-sm
            shadow-sketch active:translate-y-px active:shadow-none transition-all"
          style={{
            backgroundColor: isPlaying ? '#2fae4f' : 'var(--color-ink)',
            color: 'var(--color-paper)',
            borderColor: isPlaying ? '#2fae4f' : 'var(--color-ink)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            {isPlaying ? <rect x="2" y="2" width="10" height="10" rx="1" /> : <path d="M3 2 L12 7 L3 12 Z" />}
          </svg>
          {isPlaying ? 'A tocar…' : 'Play'}
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <SketchButton size="sm" variant="ghost"
            disabled={chainPedals.length === 0}
            onClick={() => setAllEnabled(false)}>
            Limpar chain
          </SketchButton>
          <SketchButton size="sm" variant="ghost"
            disabled={chainPedals.length === 0}
            onClick={() => exportChainPng(chainPedals, currentSetup.name)}>
            Exportar PNG
          </SketchButton>
        </div>
      </div>

      {/* INVENTÁRIO — os pedais que tenho em casa.
          Clica num pedal para o pôr na chain (ou tirar). */}
      <div className="border-2 border-ink bg-paper p-2 flex flex-col gap-1.5 shadow-sketch-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="font-sketch text-base font-bold text-ink">
            Os meus pedais em casa ({currentSetup.pedals.length})
          </span>
          <SketchButton size="sm" onClick={() => setShowAddModal(true)}>+ Pedal</SketchButton>
        </div>

        {currentSetup.pedals.length === 0 ? (
          <span className="font-body text-xs text-gray-sketch italic">
            Adiciona os pedais que tens em casa para a app os poder usar.
          </span>
        ) : (
          <div className="flex items-center gap-1.5 flex-wrap">
            {currentSetup.pedals.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePedalEnabled(p.id)}
                title={p.enabled ? 'Na chain — clica para tirar' : 'Em casa — clica para pôr na chain'}
                className={`flex items-center gap-1.5 border-2 px-2 py-0.5 font-body text-[11px] transition-all
                  ${p.enabled ? 'border-ink text-ink' : 'border-gray-light text-gray-sketch hover:border-ink'}`}
                style={{ backgroundColor: p.enabled ? 'var(--color-paper-dark)' : 'transparent' }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full border border-ink"
                  style={{ backgroundColor: p.enabled ? '#2fae4f' : 'transparent' }}
                />
                {p.model || p.modelName}
                <span className="text-[8px] opacity-60 uppercase">{p.enabled ? 'chain' : 'casa'}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Canvas principal */}
      <div
        ref={canvasRef}
        className="relative border-2 border-ink bg-paper-dark overflow-visible flex-1"
        style={{
          minHeight: CANVAS_H,
          backgroundImage: `repeating-linear-gradient(
            0deg, transparent, transparent 39px,
            var(--board-stripe) 39px, var(--board-stripe) 40px
          )`,
        }}
      >
        {/* Linhas verticais decorativas */}
        <div className="absolute inset-0 pointer-events-none opacity-15">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute h-full border-l border-ink" style={{ left: `${i * 17 + 5}%` }} />
          ))}
        </div>

        {/* Guitarra — lado esquerdo */}
        <div
          className="absolute pointer-events-none"
          style={{ left: GUITAR_X, top: guitarTop }}
        >
          <GuitarJack />
        </div>

        {/* Amplificador — lado direito */}
        <div
          className="absolute pointer-events-none"
          style={{ right: AMP_MARGIN, top: ampTop }}
        >
          <Amplifier />
        </div>

        {/* Mensagem de chain vazia */}
        {chainPedals.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-24">
            <div className="text-center">
              <p className="font-sketch text-2xl text-gray-sketch">Sem chain montada</p>
              <p className="font-body text-xs text-gray-sketch mt-1">
                {currentSetup.pedals.length === 0
                  ? 'Adiciona os pedais que tens ao teu inventário'
                  : 'Escolhe uma música para montar a chain, ou liga pedais do inventário abaixo'}
              </p>
            </div>
          </div>
        )}

        {/* Pedais — APENAS os que estão na chain (board = chain da música atual) */}
        {chainPedals.map((pedal) => (
          <div
            key={pedal.id}
            className="absolute"
            style={{ left: pedal.x, top: pedal.y, zIndex: draggingId === pedal.id ? 20 : 10 }}
          >
            <PedalCard
              pedal={pedal}
              isDragging={draggingId === pedal.id}
              onEdit={() => setEditingPedal(pedal)}
              onDragHandleMouseDown={(e) => startDrag(e, pedal)}
            />
          </div>
        ))}

        {/* SVG de cabos — por cima de tudo */}
        <svg
          className="absolute inset-0 text-ink pointer-events-none"
          width={canvasW}
          height={CANVAS_H}
          overflow="visible"
          style={{ zIndex: 5 }}
        >
          <CableConnections
            guitarJack={guitarJack}
            ampJack={ampJack}
            pedals={chainPedals}
          />
        </svg>
      </div>

      {/* Signal chain label + waveform combinada (animada ao tocar) */}
      <div className="flex flex-col gap-2">
        {chainPedals.length > 0 && (
          <p className="font-body text-[10px] text-gray-sketch leading-none">
            Chain: Guitarra → {chainPedals.map((p) => p.model || p.modelName).join(' → ')} → Amp
          </p>
        )}
        <ChainWaveform pedals={chainPedals} isPlaying={isPlaying} analyser={analyser} />
      </div>

      {showAddModal  && <AddPedalModal onClose={() => setShowAddModal(false)} />}
      {editingPedal  && (
        <PedalEditModal
          pedal={editingPedal}
          onClose={() => setEditingPedal(null)}
        />
      )}
    </div>
  )
}
