import type { PedalboardSetup } from '../types'

/** Faz download de um setup como ficheiro JSON. */
export function exportSetupJson(setup: PedalboardSetup): void {
  const blob = new Blob([JSON.stringify(setup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pedaleira-${setup.name.replace(/\s+/g, '-').toLowerCase()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/** Lê e valida um ficheiro JSON de setup. */
export function importSetupJson(file: File): Promise<PedalboardSetup> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as PedalboardSetup
        if (!data || !Array.isArray(data.pedals)) {
          reject(new Error('Ficheiro inválido: não contém uma pedaleira.'))
          return
        }
        resolve(data)
      } catch {
        reject(new Error('Ficheiro inválido: não é JSON válido.'))
      }
    }
    reader.onerror = () => reject(new Error('Não foi possível ler o ficheiro.'))
    reader.readAsText(file)
  })
}
