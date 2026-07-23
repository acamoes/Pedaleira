import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

const base =
  'font-body font-semibold border-2 border-ink rounded-hand transition-all duration-100 active:translate-y-px active:shadow-none select-none'

const variants = {
  // hover:brightness-90 funciona tanto em claro (botão escuro) como em escuro (botão claro)
  primary: 'bg-ink text-paper hover:brightness-90 shadow-sketch',
  ghost:   'bg-transparent text-ink hover:bg-paper-dark shadow-sketch',
  danger:  'bg-transparent text-ink hover:bg-paper-dark border-ink shadow-sketch',
}

const sizes = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
}

export function SketchButton({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}
