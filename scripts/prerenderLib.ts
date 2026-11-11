import fs from 'node:fs'
import path from 'node:path'

const FONT_FILES = [
  'playfair-display-latin-wght-normal',
  'playfair-display-latin-wght-italic',
  'mulish-latin-wght-normal',
]

export function fontPreloads(assetsDir: string, base: string): string {
  if (!fs.existsSync(assetsDir)) return ''
  const files = fs.readdirSync(assetsDir)
  const prefix = base.endsWith('/') ? base : `${base}/`

  return FONT_FILES.map((name) => files.find((file) => file.startsWith(`${name}-`) && file.endsWith('.woff2')))
    .filter((file): file is string => Boolean(file))
    .map((file) => `<link rel="preload" as="font" type="font/woff2" crossorigin href="${prefix}assets/${file}">`)
    .join('\n    ')
}

/**
 * Static hosts differ on whether `/sobre` maps to `sobre.html` or `sobre/index.html`,
 * so both files are written and either URL form serves the prerendered page.
 */
export function outputPathsFor(distDir: string, route: string): string[] {
  if (route === '/') return [path.join(distDir, 'index.html')]
  const slug = route.replace(/^\//, '')
  return [path.join(distDir, slug, 'index.html'), path.join(distDir, `${slug}.html`)]
}

export { buildSitemap, extractHead, injectPage, type RenderedPage } from './htmlShell.ts'
