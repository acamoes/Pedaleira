import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base = '/Pedaleira/' para servir a partir de github.com/acamoes/Pedaleira via GitHub Pages
export default defineConfig({
  base: '/Pedaleira/',
  plugins: [react()],
})
