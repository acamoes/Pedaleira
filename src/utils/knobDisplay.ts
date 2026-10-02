import type { Knob } from '../types'

// Como mostrar o valor de um knob: número, posição de seletor ("Crunch") ou
// zona + intensidade ("Chorus 6") nos knobs de zonas do THR5.

const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1))

/** Zona atual de um knob de zonas (null = desligado) e a intensidade dentro dela (0–10). */
export function zoneOf(k: Knob): { zone: string | null; amount: number } {
  const zones = k.zones ?? []
  if (!zones.length || k.value <= 0) return { zone: null, amount: 0 }
  const i = Math.min(zones.length - 1, Math.ceil(k.value / 10) - 1)
  return { zone: zones[i], amount: Math.round((k.value - i * 10) * 10) / 10 }
}

/** Valor bruto de um knob de zonas a partir de "zona + intensidade". */
export function zoneValue(k: Knob, zone: string, amount: number): number | null {
  const i = (k.zones ?? []).findIndex((z) => z.toLowerCase() === zone.toLowerCase())
  if (i === -1) return null
  return i * 10 + Math.max(0.1, Math.min(10, amount))
}

/** Texto do valor atual (o que aparece por baixo do knob e na folha impressa). */
export function knobDisplay(k: Knob): string {
  if (k.zones?.length) {
    const { zone, amount } = zoneOf(k)
    return zone ? `${zone} ${fmt(amount)}` : 'Off'
  }
  const label = k.labels?.[Math.round(k.value - k.min)]
  if (label) return label
  const sign = k.min < 0 && k.value > 0 ? '+' : ''
  return sign + fmt(k.value)
}
