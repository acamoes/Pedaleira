import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        title:   ['"Cyber Brush"', '"Bebas Neue"', '"Caveat Brush"', 'cursive'],
        sketch:  ['"Caveat"', 'cursive'],
        mono:    ['"Special Elite"', 'serif'],
        body:    ['"Inconsolata"', 'monospace'],
      },
      colors: {
        ink:           'var(--color-ink)',
        paper:         'var(--color-paper)',
        'paper-dark':  'var(--color-paper-dark)',
        'gray-sketch': 'var(--color-gray-sketch)',
        'gray-light':  'var(--color-gray-light)',
      },
      boxShadow: {
        sketch:       '2px 3px 0 var(--color-ink)',
        'sketch-sm':  '1px 2px 0 var(--color-ink)',
        'sketch-inner': 'inset 1px 2px 0 rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
} satisfies Config
