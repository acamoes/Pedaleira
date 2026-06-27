// Representação sketch de um amplificador de guitarra combo.
// O jack de entrada está no lado ESQUERDO (x=0, y=95) para receber o cabo.
export function Amplifier() {
  return (
    <svg
      width="88"
      height="190"
      viewBox="0 0 88 190"
      fill="none"
      className="text-ink"
      overflow="visible"
    >
      {/* Cabinet exterior */}
      <rect x="4" y="4" width="80" height="182" rx="4"
        fill="var(--color-paper-dark)" stroke="currentColor" strokeWidth="2.2" />

      {/* Painel de controlos — topo */}
      <rect x="8" y="8" width="72" height="34" rx="2"
        fill="var(--color-paper)" stroke="currentColor" strokeWidth="1.5" />

      {/* Knobs no painel */}
      {[18, 34, 50, 66].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="25" r="6" fill="var(--color-paper-dark)" stroke="currentColor" strokeWidth="1.5" />
          <line x1={cx} y1="19" x2={cx} y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      ))}

      {/* Altifalante — grelha */}
      <rect x="8" y="48" width="72" height="128" rx="2"
        fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* Linhas horizontais da grelha */}
      {[...Array(9)].map((_, i) => (
        <line
          key={i}
          x1="10" y1={62 + i * 13}
          x2="78" y2={62 + i * 13}
          stroke="currentColor" strokeWidth="0.8" opacity="0.35"
        />
      ))}
      {/* Círculo do speaker */}
      <circle cx="44" cy="112" r="30" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25" />
      <circle cx="44" cy="112" r="10" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25" />

      {/* Pés */}
      <rect x="10" y="180" width="14" height="8" rx="2" fill="currentColor" opacity="0.7" />
      <rect x="64" y="180" width="14" height="8" rx="2" fill="currentColor" opacity="0.7" />

      {/* Jack de entrada — lado esquerdo (y=95) */}
      <line x1="0" y1="95" x2="4" y2="95" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="8" cy="95" r="6" fill="var(--color-paper)" stroke="currentColor" strokeWidth="2" />
      <circle cx="8" cy="95" r="2.5" fill="currentColor" />

      {/* Label */}
      <text
        x="44" y="42"
        textAnchor="middle"
        fontSize="7"
        fill="currentColor"
        fontFamily="Inconsolata, monospace"
        opacity="0.55"
      >
        AMP
      </text>
    </svg>
  )
}
