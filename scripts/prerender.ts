import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { buildSitemap, extractHead, fontPreloads, injectPage, outputPathsFor } from './prerenderLib.ts'

type ServerBundle = {
  render: (url: string) => string
  routesToPrerender: () => string[]
  siteUrl: string
}

const DIST_DIR = path.resolve('dist')
const SSR_BUNDLE = path.resolve('dist-ssr/entryServer.js')
const BASE = process.env.VITE_BASE ?? '/'

async function loadBundle(): Promise<ServerBundle> {
  if (!fs.existsSync(SSR_BUNDLE)) throw new Error(`Missing SSR bundle at ${SSR_BUNDLE}; run vite build --ssr first`)
  return (await import(pathToFileURL(SSR_BUNDLE).href)) as ServerBundle
}

function writeFile(file: string, content: string): void {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
}

async function run(): Promise<void> {
  const template = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8')
  const bundle = await loadBundle()
  const routes = bundle.routesToPrerender()
  const preloads = fontPreloads(path.join(DIST_DIR, 'assets'), BASE)

  for (const route of routes) {
    const page = extractHead(bundle.render(route))
    const html = injectPage(template, page, preloads)
    for (const file of outputPathsFor(DIST_DIR, route)) writeFile(file, html)
    console.log(`prerendered ${route}`)
  }

  // The 404 fallback must stay a bare shell so the client router owns unknown paths.
  const shell = injectPage(template, { head: '', body: '' }, preloads)
  writeFile(path.join(DIST_DIR, '404.html'), shell)
  writeFile(path.join(DIST_DIR, 'ssrTemplate.html'), shell)
  writeFile(path.join(DIST_DIR, 'sitemap.xml'), buildSitemap(routes, bundle.siteUrl, new Date().toISOString().slice(0, 10)))
  console.log(`sitemap with ${routes.length} routes`)
}

await run()
