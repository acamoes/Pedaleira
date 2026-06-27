import { useMemo, useRef, useState, useEffect } from 'react'
import type { Pedal } from '../../types'
import { cleanSine, chainSignal, samplesToPath, SAMPLES } from '../../utils/signal'

interface Props {
  pedals: Pedal[]                 // cadeia ativa, já ordenada
  isPlaying?: boolean
  analyser?: AnalyserNode | null
}

const LIVE_COLOR = '#2fae4f'   // verde "a dar som"

/** Efeito acumulado da cadeia; ao tocar, anima o sinal REAL da saída. */
export function ChainWaveform({ pedals, isPlaying = false, analyser = null }: Props) {
  const W = 240
  const Hstatic = 44
  const Hlive = 64
  const H = isPlaying ? Hlive : Hstatic

  const [livePath, setLivePath] = useState<string>('')
  const rafRef = useRef<number | null>(null)

  // Sinais estáticos (quando não está a tocar)
  const { inputPath, outputPath } = useMemo(() => {
    const input = cleanSine()
    return {
      inputPath: samplesToPath(input, W, Hstatic),
      outputPath: samplesToPath(chainSignal(pedals), W, Hstatic),
    }
  }, [pedals])

  // Loop de animação em tempo real a partir do AnalyserNode
  useEffect(() => {
    if (!isPlaying || !analyser) { setLivePath(''); return }
    const buf = new Float32Array(analyser.fftSize)
    const draw = () => {
      analyser.getFloatTimeDomainData(buf)
      // sub-amostra para SAMPLES pontos
      const step = Math.floor(buf.length / SAMPLES)
      const pts: number[] = []
      for (let i = 0; i < SAMPLES; i++) pts.push(buf[i * step] * 1.4)
      setLivePath(samplesToPath(pts, W, Hlive))
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [isPlaying, analyser])

  return (
    <div
      className={`flex items-center gap-2 border-2 px-3 py-1.5 transition-all duration-200
        ${isPlaying ? 'border-[3px] shadow-sketch' : 'border-2 shadow-sketch-sm'}`}
      style={{
        borderColor: isPlaying ? LIVE_COLOR : 'var(--color-ink)',
        backgroundColor: 'var(--color-paper)',
      }}
    >
      <span
        className="font-sketch text-xs whitespace-nowrap"
        style={{ color: isPlaying ? LIVE_COLOR : 'var(--color-ink)' }}
      >
        {isPlaying ? '♪ a tocar' : `Sinal final${pedals.length ? '' : ' (limpo)'}`}
      </span>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="flex-1">
        <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="var(--color-ink)" strokeWidth="0.5" opacity="0.2" />
        {isPlaying && livePath ? (
          <path d={livePath} fill="none" stroke={LIVE_COLOR} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        ) : (
          <>
            <path d={inputPath} fill="none" stroke="var(--color-ink)" strokeWidth="0.8" opacity="0.25" />
            <path d={outputPath} fill="none" stroke="var(--color-ink)" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
          </>
        )}
      </svg>
      <span className="font-body text-[9px] text-gray-sketch whitespace-nowrap">{pedals.length} ped.</span>
    </div>
  )
}
