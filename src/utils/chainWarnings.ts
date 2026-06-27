import type { Pedal, EffectType } from '../types'

// "Posição ideal" típica de cada família na cadeia (quanto menor, mais cedo).
// Regras de bolso: dinâmica/filtro → ganho → modulação → tempo (delay/reverb).
const IDEAL_ORDER: Record<EffectType, number> = {
  tuner: 0,
  wah: 1,
  compressor: 2,
  octaver: 2,
  fuzz: 3,
  overdrive: 4,
  distortion: 4,
  boost: 5,
  EQ: 6,
  chorus: 7,
  flanger: 7,
  phaser: 7,
  tremolo: 8,
  delay: 9,
  reverb: 10,
  looper: 11,
  unknown: 6,
}

/**
 * Avisos de "boa prática" para a ordem da cadeia de pedais ATIVOS.
 * `chain` deve vir já ordenado (esq → dir).
 */
export function chainWarnings(chain: Pedal[]): string[] {
  const warnings: string[] = []
  if (chain.length < 2) return warnings

  // 1) pares fora da ordem típica (ex.: reverb antes do drive)
  for (let i = 0; i < chain.length - 1; i++) {
    const a = chain[i]
    const b = chain[i + 1]
    if (IDEAL_ORDER[a.type] > IDEAL_ORDER[b.type] + 2) {
      warnings.push(
        `${a.model} (${a.type}) costuma vir DEPOIS de ${b.model} (${b.type}), não antes.`,
      )
    }
  }

  // 2) regras específicas frequentes
  const idx = (t: EffectType) => chain.findIndex((p) => p.type === t)
  const wahI = idx('wah')
  const fuzzI = idx('fuzz')
  if (wahI !== -1 && fuzzI !== -1 && wahI > fuzzI) {
    warnings.push('Normalmente o wah vem ANTES do fuzz (senão pode soar instável).')
  }

  const firstTime = chain.findIndex((p) => p.type === 'delay' || p.type === 'reverb')
  const lastGain = chain.map((p) => p.type).lastIndexOf('overdrive') // aprox
  if (firstTime !== -1 && lastGain !== -1 && firstTime < lastGain) {
    warnings.push('Delay/reverb costumam ficar no FIM da cadeia, depois dos drives.')
  }

  return Array.from(new Set(warnings))
}
