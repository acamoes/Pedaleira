import { useMemo } from 'react'
import type { Pedal } from '../../types'
import { pedalWave, samplesToPath, selectorLabel } from '../../utils/signal'

interface Props {
  pedal: Pedal
  color?: string
}

const TYPE_DESC: Record<string, string> = {
  overdrive: 'soft clip', distortion: 'hard clip', fuzz: 'square',
  delay: 'echo', reverb: 'tail', chorus: 'detune', flanger: 'sweep comb',
  phaser: 'sweep', tremolo: 'amp mod', compressor: 'leveled',
  octaver: 'octave', wah: 'resonant', EQ: 'tone', boost: 'gain', looper: 'loop',
  tuner: 'clean', unknown: 'signal',
}

const W = 96
const H = 26

/** Onda do pedal: o que este pedal faz, isoladamente, a uma nota limpa (ver utils/signal). */
export function WaveformViz({ pedal, color = 'currentColor' }: Props) {
  const { refPath, outPath } = useMemo(() => {
    const wave = pedalWave(pedal)
    if (wave.kind === 'freq') {
      // curva em dB; a referência é a linha plana dos 0 dB
      const toY = (db: number) => db / wave.rangeDb
      return {
        refPath: `M 0 ${H / 2} L ${W} ${H / 2}`,
        outPath: samplesToPath(wave.output.map((db) => Math.max(-1, Math.min(1, toY(db)))), W, H),
      }
    }
    return { refPath: samplesToPath(wave.input, W, H), outPath: samplesToPath(wave.output, W, H) }
  }, [pedal])

  const label = selectorLabel(pedal) ?? TYPE_DESC[pedal.type] ?? 'signal'

  return (
    <div className="flex flex-col items-center gap-0.5 w-full">
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ color }}>
        <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="currentColor" strokeWidth="0.4" opacity="0.2" />
        <path d={refPath} fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.25" />
        <path d={outPath} fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <span className="font-body text-[7px] uppercase tracking-wide opacity-50 leading-none">
        {label}
      </span>
    </div>
  )
}
