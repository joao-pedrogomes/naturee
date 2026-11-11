// Pure HTML helpers shared by the prerender script and the Worker (no node imports).
const HEAD_TAG_PATTERN =
  /<title>[\s\S]*?<\/title>|<meta\s[^>]*>|<link\s+rel="(?:canonical|preload)"[^>]*>/g
const TEMPLATE_TITLE_PATTERN = /\s*<title>[\s\S]*?<\/title>/
const TEMPLATE_DESCRIPTION_PATTERN = /\s*<meta name="description"[^>]*>/
export type RenderedPage = { head: string; body: string }

/** React 19 emits hoistable head tags inline; move them out of the body markup. */
export function extractHead(html: string): RenderedPage {
  const tags = html.match(HEAD_TAG_PATTERN) ?? []
  const body = html.replace(HEAD_TAG_PATTERN, '')
  return { head: tags.join('\n    '), body }
}

export function injectPage(template: string, page: RenderedPage, extraHead: string): string {
  const headTags = [page.head, extraHead].filter(Boolean).join('\n    ')
  return template
    .replace(TEMPLATE_TITLE_PATTERN, '')
    .replace(TEMPLATE_DESCRIPTION_PATTERN, '')
    .replace('</head>', `    ${headTags}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${page.body}</div>`)
}

export function buildSitemap(routes: string[], siteUrl: string, lastmod: string): string {
  const base = siteUrl.replace(/\/+$/, '')
  const entries = routes
    .map((route) => `  <url><loc>${base}${route === '/' ? '/' : route}</loc><lastmod>${lastmod}</lastmod></url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
}

export function injectContentScript(html: string, json: string): string {
  return html.replace('</body>', `<script id="siteContent" type="application/json">${json}</script>\n  </body>`)
}
