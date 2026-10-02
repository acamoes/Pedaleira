import { useState, useRef, useEffect, useCallback } from 'react'
import { usePedalboardStore, CANVAS_H, PEDAL_W, PEDAL_H } from '../../store/usePedalboardStore'
import type { Pedal } from '../../types'
import { PedalCard } from './PedalCard'
import { AddPedalModal } from './AddPedalModal'
import { PedalEditModal } from './PedalEditModal'
import { GuitarJack } from './GuitarJack'
import { Amplifier } from './Amplifier'
import { CableConnections } from './CableConnections'
import { SketchButton } from '../ui/SketchButton'
import { SettingsSheet } from '../print/SettingsSheet'
import { SongTitle } from './SongTitle'
import { deriveChain, GUITAR_JACK, AMP_JACK, inJackId, outJackId } from '../../utils/chain'

const SNAP = 10  // grelha de snap ao largar (px)

// Dimensões dos elementos laterais (devem coincidir com os SVGs)
const GUITAR_W      = 90   // largura do SVG GuitarJack
const GUITAR_X      = 8
const GUITAR_JACK_Y = 200  // y do jack dentro do SVG
const AMP_W         = 88
const AMP_H         = 190
const AMP_MARGIN    = 8

interface Pt { x: number; y: number }
interface JackDef { id: string; x: number; y: number; kind: 'in' | 'out' }

export function Pedalboard() {
  const { currentSetup, tuneResult, movePedal, connectJacks, disconnectCable, clearConnections } = usePedalboardStore()
  const [showAddModal,  setShowAddModal]  = useState(false)
  const [editingPedal,  setEditingPedal]  = useState<Pedal | null>(null)
  const [draggingId,    setDraggingId]    = useState<string | null>(null)
  const [canvasW,       setCanvasW]       = useState(800)
  const [cableDrag,     setCableDrag]     = useState<{ fromJack: string; kind: 'in' | 'out'; from: Pt; pointer: Pt } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Rastreia a largura real do canvas
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const obs = new ResizeObserver(([e]) => setCanvasW(e.contentRect.width))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const guitarTop = Math.round(CANVAS_H / 2 - GUITAR_JACK_Y)
  const ampTop    = Math.round((CANVAS_H - AMP_H) / 2)

  // Posições dos jacks da guitarra e do amp no canvas (em px)
  const guitarJack: Pt = { x: GUITAR_X + GUITAR_W, y: guitarTop + GUITAR_JACK_Y }
  const ampJack:    Pt = { x: canvasW - AMP_W - AMP_MARGIN, y: ampTop + 95 }  // 95 = y do jack no Amplifier

  // Cadeia ativa = caminho guitarra→…→amp derivado das ligações manuais.
  const chainPedals = deriveChain(currentSetup.pedals, currentSetup.connections)
  const connectedSet = new Set(chainPedals.map((p) => p.id))
  const chainNames = chainPedals.map((p) => p.model || p.modelName).join('  →  ')
  const guitarUnwired = !currentSetup.connections.some((c) => c.from === GUITAR_JACK)

  // Todas as fichas interativas (guitarra, amp e cada pedal).
  const jacks: JackDef[] = [
    { id: GUITAR_JACK, x: guitarJack.x, y: guitarJack.y, kind: 'out' },
    { id: AMP_JACK,    x: ampJack.x,    y: ampJack.y,    kind: 'in'  },
  ]
  for (const p of currentSetup.pedals) {
    jacks.push({ id: inJackId(p.id),  x: p.x,           y: p.y + PEDAL_H / 2, kind: 'in'  })
    jacks.push({ id: outJackId(p.id), x: p.x + PEDAL_W, y: p.y + PEDAL_H / 2, kind: 'out' })
  }

  // Drag livre do cartão — delta em relação ao mousedown
  const startDrag = useCallback(
    (e: React.MouseEvent, pedal: Pedal) => {
      e.preventDefault()
      const startMouseX = e.clientX, startMouseY = e.clientY
      const startPedalX = pedal.x,   startPedalY = pedal.y
      setDraggingId(pedal.id)
      const onMove = (ev: MouseEvent) => {
        movePedal(pedal.id, startPedalX + ev.clientX - startMouseX, startPedalY + ev.clientY - startMouseY)
      }
      const onUp = (ev: MouseEvent) => {
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

  // Arrastar um CABO de uma ficha para outra.
  const startCable = useCallback(
    (e: React.PointerEvent, fromJack: string, kind: 'in' | 'out', from: Pt) => {
      e.preventDefault(); e.stopPropagation()
      const rect = canvasRef.current?.getBoundingClientRect()
      const toCanvas = (cx: number, cy: number): Pt => ({ x: cx - (rect?.left ?? 0), y: cy - (rect?.top ?? 0) })
      setCableDrag({ fromJack, kind, from, pointer: from })
      const onMove = (ev: PointerEvent) =>
        setCableDrag((d) => (d ? { ...d, pointer: toCanvas(ev.clientX, ev.clientY) } : d))
      const onUp = (ev: PointerEvent) => {
        const el = document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement | null
        const target = el?.closest('[data-jack]')?.getAttribute('data-jack')
        if (target) connectJacks(fromJack, target)
        setCableDrag(null)
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [connectJacks],
  )

  return (
    <div className="flex flex-col gap-3 flex-1 overflow-hidden">
      {/* Música do Setup — o "título" da board */}
      <SongTitle />

      {/* ══ A BOARD — peça única: barra de topo + canvas ══ */}
      <div className="flex flex-col flex-1 border-2 border-ink rounded-[6px] shadow-sketch bg-paper-dark overflow-hidden">

        {/* Barra de topo: breadcrumb + ações */}
        <div className="flex items-center gap-3 px-3 py-2 border-b-2 border-ink bg-paper flex-wrap">
          <div className="flex-1 min-w-0">
            {chainPedals.length > 0 ? (
              <p className="font-mono text-[11px] text-gray-sketch tracking-wide truncate">
                Guitarra&nbsp; →&nbsp; <span className="text-ink">{chainNames}</span>&nbsp; →&nbsp; Amp
              </p>
            ) : (
              <p className="font-mono text-[11px] text-gray-sketch tracking-wide truncate">
                cadeia vazia — arrasta um cabo da guitarra até um pedal
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SketchButton size="sm" onClick={() => setShowAddModal(true)}>+ Pedal</SketchButton>
            <button type="button" disabled={currentSetup.connections.length === 0}
              onClick={clearConnections}
              className="font-body text-[12px] text-gray-sketch border-[1.5px] border-gray-light rounded-hand
                px-2.5 py-1 hover:text-ink hover:border-ink transition-colors disabled:opacity-40">
              Limpar cabos
            </button>
            <button type="button" disabled={chainPedals.length === 0}
              onClick={() => window.print()}
              title="Imprimir (ou guardar em PDF) a ficha de regulação da cadeia ativa"
              className="font-body text-[12px] text-gray-sketch border-[1.5px] border-gray-light rounded-hand
                px-2.5 py-1 hover:text-ink hover:border-ink transition-colors disabled:opacity-40">
              Imprimir
            </button>
          </div>
        </div>

        {/* Canvas — superfície kraft com furos de pedalboard */}
        <div
          ref={canvasRef}
          className="relative overflow-visible flex-1"
          style={{
            minHeight: CANVAS_H,
            backgroundColor: 'var(--color-paper-dark)',
            backgroundImage: 'radial-gradient(var(--board-stripe) 1.1px, transparent 1.5px)',
            backgroundSize: '26px 26px',
            touchAction: 'none',
          }}
        >
          {/* Guitarra + Amp (ilustração; as fichas interativas vêm depois) */}
          <div className="absolute pointer-events-none" style={{ left: GUITAR_X, top: guitarTop }}>
            <GuitarJack />
          </div>
          <div className="absolute pointer-events-none" style={{ right: AMP_MARGIN, top: ampTop }}>
            <Amplifier />
          </div>

          {/* Estado vazio (só quando não há pedais nenhuns) */}
          {currentSetup.pedals.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-24">
              <div className="text-center">
                <p className="font-sketch text-2xl text-gray-sketch">Board vazia</p>
                <p className="font-body text-xs text-gray-sketch mt-1">
                  Adiciona pedais com <strong>+ Pedal</strong> e liga-os com cabos
                </p>
              </div>
            </div>
          )}

          {/* Pedais — TODOS na board (ligados ou não) */}
          {currentSetup.pedals.map((pedal) => (
            <div
              key={pedal.id}
              className="absolute"
              style={{ left: pedal.x, top: pedal.y, zIndex: draggingId === pedal.id ? 20 : 10 }}
            >
              <PedalCard
                pedal={pedal}
                connected={connectedSet.has(pedal.id)}
                isDragging={draggingId === pedal.id}
                onEdit={() => setEditingPedal(pedal)}
                onDragHandleMouseDown={(e) => startDrag(e, pedal)}
              />
            </div>
          ))}

          {/* SVG de cabos (clicar num cabo desliga-o) */}
          <svg
            className="absolute inset-0"
            width={canvasW}
            height={CANVAS_H}
            overflow="visible"
            style={{ zIndex: 5, pointerEvents: 'none', color: 'var(--color-ink)' }}
          >
            <CableConnections
              pedals={currentSetup.pedals}
              connections={currentSetup.connections}
              guitarJack={guitarJack}
              ampJack={ampJack}
              live={cableDrag ? { from: cableDrag.from, to: cableDrag.pointer } : null}
              onDisconnect={disconnectCable}
            />
          </svg>

          {/* Fichas interativas — arrasta daqui para ligar */}
          {jacks.map((j) => {
            const isTarget = cableDrag && cableDrag.kind !== j.kind && cableDrag.fromJack !== j.id
            const hint = j.id === GUITAR_JACK && guitarUnwired && !cableDrag
            return (
              <div
                key={j.id}
                data-jack={j.id}
                data-kind={j.kind}
                onPointerDown={(e) => startCable(e, j.id, j.kind, { x: j.x, y: j.y })}
                title={j.kind === 'out' ? 'Saída — arrasta um cabo até uma entrada' : 'Entrada — liga aqui um cabo'}
                className="absolute z-30 grid place-items-center cursor-crosshair"
                style={{ left: j.x, top: j.y, width: 18, height: 18, transform: 'translate(-50%,-50%)' }}
              >
                <span
                  className="block rounded-full border-2 transition-all"
                  style={{
                    width: isTarget || hint ? 16 : 11,
                    height: isTarget || hint ? 16 : 11,
                    backgroundColor: isTarget ? 'var(--color-accent)' : 'var(--color-brass)',
                    borderColor: hint ? 'var(--color-accent)' : 'var(--color-ink)',
                    boxShadow: isTarget || hint ? '0 0 6px var(--color-accent)' : 'none',
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>

      <SettingsSheet chain={chainPedals} setupName={currentSetup.name} song={currentSetup.song} tune={tuneResult} />

      {showAddModal && <AddPedalModal onClose={() => setShowAddModal(false)} />}
      {editingPedal && (
        <PedalEditModal pedal={editingPedal} onClose={() => setEditingPedal(null)} />
      )}
    </div>
  )
}
