import type { Pedal } from '../types'

const INK = '#1a1a1a'
const PAPER = '#f5f0e8'
const PAPER_DK = '#e8e0d0'

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Gera um PNG (download) com a cadeia de pedais LIGADOS:
 * Guitarra → [pedal + valores] → ... → Amp.
 */
export function exportChainPng(chain: Pedal[], setupName: string): void {
  const BOX_W = 150
  const GAP = 46
  const PED_H = 110
  const padX = 30
  const padTop = 70
  const count = chain.length

  const innerW = 90 /*guitar*/ + GAP + count * (BOX_W + GAP) + 90 /*amp*/
  const W = padX * 2 + Math.max(innerW, 480)
  const H = padTop + PED_H + 60

  const midY = padTop + PED_H / 2

  let x = padX
  const parts: string[] = []

  // Título
  parts.push(`<text x="${padX}" y="40" font-family="Caveat, cursive" font-size="34" fill="${INK}">Pedaleira — ${esc(setupName)}</text>`)

  // Guitarra
  parts.push(box(x, midY - 30, 90, 60, 'GUITARRA'))
  let prevRight = x + 90
  x += 90 + GAP

  // Pedais
  chain.forEach((p) => {
    parts.push(`<line x1="${prevRight}" y1="${midY}" x2="${x}" y2="${midY}" stroke="${INK}" stroke-width="3"/>`)
    parts.push(`<circle cx="${prevRight}" cy="${midY}" r="3.5" fill="${INK}"/>`)
    parts.push(`<circle cx="${x}" cy="${midY}" r="3.5" fill="${INK}"/>`)

    const boxY = padTop
    parts.push(`<rect x="${x}" y="${boxY}" width="${BOX_W}" height="${PED_H}" rx="4" fill="${p.color || PAPER}" stroke="${INK}" stroke-width="2.5"/>`)
    parts.push(`<text x="${x + BOX_W / 2}" y="${boxY + 20}" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="17" fill="${INK}">${esc(p.brand)}</text>`)
    parts.push(`<text x="${x + BOX_W / 2}" y="${boxY + 38}" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="15" fill="${INK}">${esc(p.model)}</text>`)

    const lines = p.knobs.map((k) => `${k.name}: ${Number.isInteger(k.value) ? k.value : k.value.toFixed(1)}`)
    lines.forEach((ln, i) => {
      parts.push(`<text x="${x + 10}" y="${boxY + 60 + i * 14}" font-family="Inconsolata, monospace" font-size="11" fill="${INK}">${esc(ln)}</text>`)
    })

    prevRight = x + BOX_W
    x += BOX_W + GAP
  })

  // Amp
  parts.push(`<line x1="${prevRight}" y1="${midY}" x2="${x}" y2="${midY}" stroke="${INK}" stroke-width="3"/>`)
  parts.push(box(x, midY - 35, 90, 70, 'AMP'))

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${PAPER}"/>
    ${parts.join('\n')}
  </svg>`

  rasterizeAndDownload(svg, W, H, `pedaleira-${setupName.replace(/\s+/g, '-').toLowerCase()}.png`)

  function box(bx: number, by: number, w: number, h: number, label: string): string {
    return `<rect x="${bx}" y="${by}" width="${w}" height="${h}" rx="4" fill="${PAPER_DK}" stroke="${INK}" stroke-width="2.5"/>` +
      `<text x="${bx + w / 2}" y="${by + h / 2 + 5}" text-anchor="middle" font-family="Inconsolata, monospace" font-size="13" fill="${INK}">${esc(label)}</text>`
  }
}

function rasterizeAndDownload(svg: string, w: number, h: number, filename: string): void {
  const scale = 2
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = w * scale
    canvas.height = h * scale
    const ctx = canvas.getContext('2d')!
    ctx.scale(scale, scale)
    ctx.drawImage(img, 0, 0)
    URL.revokeObjectURL(url)
    canvas.toBlob((png) => {
      if (!png) return
      const a = document.createElement('a')
      a.href = URL.createObjectURL(png)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
    }, 'image/png')
  }
  img.src = url
}
