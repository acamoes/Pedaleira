// Paleta de cores partilhada pelo AddPedalModal e pelo PedalEditModal.
// Cores escolhidas para cobrir os corpos reais dos pedais (verdes, dourados,
// laranjas, azuis…). hex '' = cor de papel (sem cor de corpo).

export interface PaletteColor {
  label: string
  hex: string
}

export const PALETTE: PaletteColor[] = [
  // Neutros
  { label: 'Papel',        hex: ''        },
  { label: 'Preto',        hex: '#1a1a1a' },
  { label: 'Ardósia',      hex: '#3d4a5c' },
  { label: 'Cinza',        hex: '#7d8288' },
  { label: 'Prata',        hex: '#b9c0c4' },
  { label: 'Branco',       hex: '#f2ede0' },
  // Quentes
  { label: 'Vermelho',     hex: '#b5312a' },
  { label: 'Borgonha',     hex: '#6d1c2c' },
  { label: 'Laranja',      hex: '#d98a1f' },
  { label: 'Dourado',      hex: '#caa64a' },
  { label: 'Creme',        hex: '#d8cb9f' },
  { label: 'Verde',        hex: '#3f8f4a' },
  // Frios
  { label: 'Verde-escuro', hex: '#2f6b4a' },
  { label: 'Petróleo',     hex: '#2f7d7a' },
  { label: 'Turquesa',     hex: '#2f9fa0' },
  { label: 'Azul',         hex: '#3a7ec0' },
  { label: 'Marinha',      hex: '#23407a' },
  { label: 'Roxo',         hex: '#5a3a9b' },
]

/** Luminância percebida — true se a cor é escura (pede texto claro por cima). */
export function isDarkColor(hex: string): boolean {
  if (!hex || hex.length < 7) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5
}
