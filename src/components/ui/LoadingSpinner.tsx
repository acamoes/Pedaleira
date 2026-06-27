export function LoadingSpinner({ label = 'A processar...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-ink font-sketch text-sm">
      <svg
        className="animate-spin"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        {/* Sketchy arc */}
        <path d="M12 2 A10 10 0 0 1 22 12" />
        <path d="M22 12 A10 10 0 0 1 12 22" />
        <path d="M12 22 A10 10 0 0 1 2 12" />
      </svg>
      <span>{label}</span>
    </div>
  )
}
