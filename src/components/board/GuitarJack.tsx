/**
 * Fender Stratocaster — vista frontal, sketch style.
 *
 * Silhueta FIXA, validada por rasterização (resvg) até ler como uma Strat real:
 * - Cornos de cutaway ARREDONDADOS (tangente horizontal no ápice)
 * - Lower bout = ponto mais largo; cintura côncava definida
 * - Cabeçote 6-in-line (tarrachas no lado grave)
 * - Pickguard em vírgula, 3 single-coils (bridge inclinado), 5-way, 1 vol + 2 tone
 * - Synchronized tremolo bridge com 6 selas
 * - Jack de saída no lado direito a y=200 (alinhado pelo Pedalboard ao centro)
 *
 * viewBox 0 0 90 300 (1 unidade = 1px).
 */
export function GuitarJack() {
  return (
    <svg
      width="90"
      height="300"
      viewBox="0 0 90 300"
      fill="none"
      className="text-ink"
      overflow="visible"
    >
      {/* ═══════════ CORPO (cornos arredondados) ═══════════ */}
      <path
        d="M 15 133
           C 13 133, 11 135, 10 140
           C 9 152, 10 168, 11 182
           C 12 197, 19 204, 19 214
           C 19 228, 8 236, 6 248
           C 5 268, 25 292, 45 292
           C 65 292, 85 268, 84 248
           C 82 236, 71 228, 71 214
           C 71 204, 78 197, 79 182
           C 80 168, 81 152, 80 140
           C 79 135, 77 133, 75 133
           C 73 133, 71 135, 68 140
           C 63 148, 53 153, 46 153
           C 45 153, 44 153, 44 153
           C 37 153, 30 148, 25 140
           C 22 135, 17 133, 15 133 Z"
        fill="var(--color-paper-dark)"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Forearm contour bevel (linha interior subtil) */}
      <path
        d="M 16 150 C 26 145, 40 144, 52 148 C 64 152, 74 160, 78 172"
        stroke="currentColor"
        strokeWidth="0.7"
        opacity="0.14"
        fill="none"
      />

      {/* ═══════════ CABEÇOTE ═══════════ */}
      <path
        d="M 33 40 L 56 40
           C 58 33, 58 23, 54 17
           C 51 11, 45 7, 39 8
           C 33 8, 29 11, 26 15
           C 21 22, 22 32, 33 40 Z"
        fill="var(--color-paper-dark)"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* 6 tarrachas (lado grave) */}
      {[[28, 12], [25, 18], [24, 25], [26, 31], [29, 36], [34, 41]].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="1.5" fill="currentColor" opacity="0.6" />
          <line x1={cx} y1={cy} x2={cx - 8} y2={cy - 1} stroke="currentColor" strokeWidth="1" opacity="0.55" />
          <ellipse cx={cx - 10} cy={cy - 1} rx="2.2" ry="1.5" fill="var(--color-paper)" stroke="currentColor" strokeWidth="0.9" opacity="0.6" />
        </g>
      ))}

      {/* ═══════════ PORCA ═══════════ */}
      <rect x="30" y="38.5" width="30" height="3" rx="0.5" fill="currentColor" opacity="0.75" />

      {/* ═══════════ BRAÇO + TRASTOS ═══════════ */}
      <path d="M 32 40 L 58 40 L 62 152 L 28 152 Z" fill="var(--color-paper-dark)" stroke="currentColor" strokeWidth="1.6" />
      {[...Array(13)].map((_, i) => {
        const y = 48 + i * 7.8
        const w = i * 0.28
        return <line key={i} x1={30 + w} y1={y} x2={60 - w} y2={y} stroke="currentColor" strokeWidth="0.9" opacity="0.4" />
      })}
      {/* Marcadores 3,5,7,9 + duplo no 12 */}
      {[2, 4, 6, 8].map((i) => (
        <circle key={i} cx="45" cy={51.9 + i * 7.8} r="1.7" fill="currentColor" opacity="0.2" />
      ))}
      <circle cx="42" cy={51.9 + 10 * 7.8} r="1.4" fill="currentColor" opacity="0.2" />
      <circle cx="48" cy={51.9 + 10 * 7.8} r="1.4" fill="currentColor" opacity="0.2" />

      {/* ═══════════ PICKGUARD ═══════════ */}
      <path
        d="M 28 156
           C 34 161, 40 163, 45 163
           C 50 163, 56 161, 62 156
           C 69 151, 75 154, 76 166
           L 75 205 L 69 236
           C 66 248, 58 254, 47 254 L 37 254
           C 27 254, 23 245, 23 235 L 17 200 L 17 168
           C 18 158, 23 153, 28 156 Z"
        fill="var(--color-paper)"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.9"
      />

      {/* ═══════════ 3 SINGLE-COILS ═══════════ */}
      <rect x="30" y="170" width="27" height="8" rx="2" fill="var(--color-paper)" stroke="currentColor" strokeWidth="1.3" />
      <rect x="30" y="195" width="27" height="8" rx="2" fill="var(--color-paper)" stroke="currentColor" strokeWidth="1.3" />
      <path d="M 31 219 L 57 216 L 58 224 L 32 227 Z" fill="var(--color-paper)" stroke="currentColor" strokeWidth="1.3" />
      {/* Polo pieces neck + mid */}
      {[174, 199].map((cy) =>
        [...Array(6)].map((_, i) => (
          <circle key={`${cy}-${i}`} cx={33 + i * 3.5} cy={cy} r="0.9" fill="currentColor" opacity="0.4" />
        )),
      )}

      {/* 5-way selector */}
      <rect x="60" y="181" width="5" height="18" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55" />
      <rect x="61.5" y="183" width="2" height="6" rx="0.5" fill="currentColor" opacity="0.45" />

      {/* Volume + 2 tone */}
      {[[68, 210, 4], [65, 228, 3.6], [65, 240, 3.6]].map(([cx, cy, r], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r} fill="var(--color-paper-dark)" stroke="currentColor" strokeWidth="1.3" />
          <line x1={cx} y1={cy - r} x2={cx} y2={cy - r + 2} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </g>
      ))}

      {/* ═══════════ TREMOLO BRIDGE ═══════════ */}
      <rect x="33" y="250" width="22" height="13" rx="2" fill="var(--color-paper)" stroke="currentColor" strokeWidth="1.5" />
      {[...Array(6)].map((_, i) => (
        <rect key={i} x={34.2 + i * 3.3} y="251" width="2.6" height="6.5" rx="0.6" fill="var(--color-paper-dark)" stroke="currentColor" strokeWidth="0.6" />
      ))}
      {/* Whammy bar */}
      <path d="M 53 262 Q 63 268 66 281" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />

      {/* ═══════════ 6 CORDAS ═══════════ */}
      {[...Array(6)].map((_, i) => (
        <line key={i} x1={33 + i * 3.2} y1="41" x2={34 + i * 3.3} y2="251" stroke="currentColor" strokeWidth={0.3 + i * 0.07} opacity="0.18" />
      ))}

      {/* Botão de correia inferior */}
      <ellipse cx="45" cy="287" rx="4.5" ry="3" fill="var(--color-paper-dark)" stroke="currentColor" strokeWidth="1.3" />

      {/* ═══════════ JACK DE SAÍDA (y=200) ═══════════ */}
      <line x1="84" y1="200" x2="90" y2="200" stroke="currentColor" strokeWidth="3" />
      <circle cx="80" cy="200" r="6" fill="var(--color-paper)" stroke="currentColor" strokeWidth="2" />
      <circle cx="80" cy="200" r="2.3" fill="currentColor" />
    </svg>
  )
}
