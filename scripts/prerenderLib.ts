import fs from 'node:fs'
import path from 'node:path'

const HEAD_TAG_PATTERN =
  /<title>[\s\S]*?<\/title>|<meta\s[^>]*>|<link\s+rel="(?:canonical|preload)"[^>]*>/g
const TEMPLATE_TITLE_PATTERN = /\s*<title>[\s\S]*?<\/title>/
const TEMPLATE_DESCRIPTION_PATTERN = /\s*<meta name="description"[^>]*>/
const FONT_FILES = [
  'playfair-display-latin-wght-normal',
  'playfair-display-latin-wght-italic',
  'mulish-latin-wght-normal',
]

export type RenderedPage = { head: string; body: string }

/** React 19 emits hoistable head tags inline; move them out of the body markup. */
export function extractHead(html: string): RenderedPage {
  const tags = html.match(HEAD_TAG_PATTERN) ?? []
  const body = html.replace(HEAD_TAG_PATTERN, '')
  return { head: tags.join('\n    '), body }
}

export function fontPreloads(assetsDir: string, base: string): string {
  if (!fs.existsSync(assetsDir)) return ''
  const files = fs.readdirSync(assetsDir)
  const prefix = base.endsWith('/') ? base : `${base}/`

  return FONT_FILES.map((name) => files.find((file) => file.startsWith(`${name}-`) && file.endsWith('.woff2')))
    .filter((file): file is string => Boolean(file))
    .map((file) => `<link rel="preload" as="font" type="font/woff2" crossorigin href="${prefix}assets/${file}">`)
    .join('\n    ')
}

export function injectPage(template: string, page: RenderedPage, extraHead: string): string {
  const headTags = [page.head, extraHead].filter(Boolean).join('\n    ')
  return template
    .replace(TEMPLATE_TITLE_PATTERN, '')
    .replace(TEMPLATE_DESCRIPTION_PATTERN, '')
    .replace('</head>', `    ${headTags}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${page.body}</div>`)
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

export function buildSitemap(routes: string[], siteUrl: string, lastmod: string): string {
  const base = siteUrl.replace(/\/+$/, '')
  const entries = routes
    .map((route) => `  <url><loc>${base}${route === '/' ? '/' : route}</loc><lastmod>${lastmod}</lastmod></url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
}
