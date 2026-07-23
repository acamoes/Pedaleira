import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        title:   ['"Cyber Brush"', '"Bebas Neue"', '"Caveat Brush"', 'cursive'],
        sketch:  ['"Caveat"', 'cursive'],
        mono:    ['"Special Elite"', 'ui-monospace', 'monospace'],
        // Body agora é sans humanista legível (era Inconsolata mono, minúsculo).
        body:    ['ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      colors: {
        ink:           'var(--color-ink)',
        paper:         'var(--color-paper)',
        'paper-dark':  'var(--color-paper-dark)',
        'gray-sketch': 'var(--color-gray-sketch)',
        'gray-light':  'var(--color-gray-light)',
        accent:        'var(--color-accent)',
        'accent-2':    'var(--color-accent-2)',
        live:          'var(--color-live)',
        brass:         'var(--color-brass)',
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
