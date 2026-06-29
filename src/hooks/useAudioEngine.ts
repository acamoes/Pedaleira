import { useState, useRef, useCallback, useEffect } from 'react'
import type { Pedal } from '../types'
import { playStrum } from '../audio/engine'

export function useAudioEngine() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const timerRef = useRef<number | null>(null)

  const play = useCallback((pedals: Pedal[]) => {
    const { analyser: an, duration } = playStrum(pedals)
    setAnalyser(an)
    setIsPlaying(true)
    if (timerRef.current) window.clearTimeout(timerRef.current)
    // mantém o estado "a tocar" enquanto o som decai
    timerRef.current = window.setTimeout(() => setIsPlaying(false), Math.min(duration, 3.2) * 1000)
  }, [])

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current) }, [])

  return { play, isPlaying, analyser }
}
