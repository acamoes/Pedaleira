import { useMemo } from 'react'
import type { EffectType } from '../../types'
import { cleanSine, applyEffect, samplesToPath } from '../../utils/signal'

interface Props {
  type: EffectType
  color?: string
  amount?: number
}

const TYPE_DESC: Record<string, string> = {
  overdrive: 'soft clip', distortion: 'hard clip', fuzz: 'square',
  delay: 'echo', reverb: 'tail', chorus: 'detune', flanger: 'sweep comb',
  phaser: 'sweep', tremolo: 'amp mod', compressor: 'leveled',
  octaver: 'octave', wah: 'resonant', EQ: 'tone', boost: 'gain', looper: 'loop',
  tuner: 'clean', unknown: 'signal',
}

export function WaveformViz({ type, color = 'currentColor', amount = 0.5 }: Props) {
  const W = 96
  const H = 26
  const { inputPath, outputPath } = useMemo(() => {
    const input = cleanSine()
    return {
      inputPath: samplesToPath(input, W, H),
      outputPath: samplesToPath(applyEffect(type, input, amount), W, H),
    }
  }, [type, amount])

  return (
    <div className="flex flex-col items-center gap-0.5 w-full">
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ color }}>
        <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="currentColor" strokeWidth="0.4" opacity="0.2" />
        <path d={inputPath} fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.25" />
        <path d={outputPath} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <span className="font-body text-[7px] uppercase tracking-wide opacity-50 leading-none">
        {TYPE_DESC[type] ?? 'signal'}
      </span>
    </div>
  )
}
