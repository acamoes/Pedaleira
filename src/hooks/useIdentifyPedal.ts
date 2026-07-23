import { useCallback } from 'react'
import { findSeedPedal } from '../constants/seedPedals'
import type { IdentifyPedalResponse } from '../types'

// Pedal genérico criado quando o modelo não é reconhecido (sem IA).
// O utilizador pode depois editar o tipo/cor; os knobs são genéricos.
function genericPedal(modelName: string): IdentifyPedalResponse {
  return {
    recognized: false,
    brand: '',
    model: modelName,
    type: 'unknown',
    knobs: [
      { name: 'Level', min: 0, max: 10, default: 5 },
      { name: 'Tone',  min: 0, max: 10, default: 5 },
      { name: 'Gain',  min: 0, max: 10, default: 5 },
    ],
    switches: [],
  }
}

export type ResolveResult =
  | { data: IdentifyPedalResponse; recognized: boolean }
  | { error: string }

export function useIdentifyPedal() {
  // Resolve o pedal (seed reconhecido ou genérico) SEM o adicionar à board.
  // Quem chama fica livre para intercalar um passo de cor antes de gravar.
  const resolvePedal = useCallback((modelName: string): ResolveResult => {
    const trimmed = modelName.trim()
    if (!trimmed) return { error: 'Escreve o nome do pedal.' }

    const seed = findSeedPedal(trimmed)
    if (seed) return { data: seed, recognized: true }

    return { data: genericPedal(trimmed), recognized: false }
  }, [])

  return { resolvePedal }
}
