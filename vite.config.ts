import fs from 'fs'
import path from 'path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * GitHub Pages serves static files only: a deep link like /produtos?marca=x
 * would 404 on refresh. Pages falls back to 404.html, so shipping a copy of
 * index.html under that name hands the route back to the SPA router.
 */
function spaFallback(): Plugin {
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    closeBundle() {
      const dist = path.resolve(__dirname, 'dist')
      const index = path.join(dist, 'index.html')
      if (fs.existsSync(index)) {
        fs.copyFileSync(index, path.join(dist, '404.html'))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // The project is served from a repository subpath on GitHub Pages.
  base: command === 'build' ? '/naturee/' : '/',
  plugins: [react(), tailwindcss(), spaFallback()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}))
