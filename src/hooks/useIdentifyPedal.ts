import { useCallback } from 'react'
import { usePedalboardStore } from '../store/usePedalboardStore'
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

export function useIdentifyPedal() {
  const { addPedal } = usePedalboardStore()

  const identify = useCallback(
    async (modelName: string): Promise<{ error?: string; recognized?: boolean }> => {
      const trimmed = modelName.trim()
      if (!trimmed) return { error: 'Escreve o nome do pedal.' }

      const seed = findSeedPedal(trimmed)
      if (seed) {
        addPedal(trimmed, seed)
        return { recognized: true }
      }

      // Fallback local: cria um pedal genérico editável
      addPedal(trimmed, genericPedal(trimmed))
      return { recognized: false }
    },
    [addPedal],
  )

  return { identify }
}
