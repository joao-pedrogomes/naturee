import fs from 'fs'
import path from 'path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Static hosts serve 404.html for unknown paths. A copy of index.html there
 * hands deep links back to the client router.
 */
function spaFallback(): Plugin {
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    closeBundle() {
      const dist = path.resolve(__dirname, 'dist')
      const index = path.join(dist, 'index.html')
      if (!fs.existsSync(index)) return
      fs.copyFileSync(index, path.join(dist, '404.html'))
    },
  }
}

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss(), spaFallback()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    modulePreload: { polyfill: false },
  },
})
