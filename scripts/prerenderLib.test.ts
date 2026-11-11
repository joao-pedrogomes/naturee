import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { buildSitemap, extractHead, fontPreloads, injectPage, outputPathsFor } from './prerenderLib.ts'

const tempDirs: string[] = []

function makeTempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prerender-'))
  tempDirs.push(dir)
  return dir
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true })
})

describe('extractHead', () => {
  it('moves title, meta and canonical out of the body', () => {
    const html = '<title>Sobre · X</title><meta name="description" content="d"/><link rel="canonical" href="https://x/sobre"/><div>corpo</div><meta property="og:title" content="t"/>'
    const page = extractHead(html)
    expect(page.body).toBe('<div>corpo</div>')
    expect(page.head).toContain('<title>Sobre · X</title>')
    expect(page.head).toContain('og:title')
    expect(page.head).toContain('rel="canonical"')
  })
})

describe('fontPreloads', () => {
  it('links the hashed latin font files under the base path', () => {
    const dir = makeTempDir()
    fs.writeFileSync(path.join(dir, 'playfair-display-latin-wght-normal-ABC123.woff2'), '')
    fs.writeFileSync(path.join(dir, 'mulish-latin-wght-normal-DEF456.woff2'), '')
    fs.writeFileSync(path.join(dir, 'mulish-cyrillic-wght-normal-XYZ.woff2'), '')
    const links = fontPreloads(dir, '/naturee/')
    expect(links).toContain('href="/naturee/assets/playfair-display-latin-wght-normal-ABC123.woff2"')
    expect(links).toContain('href="/naturee/assets/mulish-latin-wght-normal-DEF456.woff2"')
    expect(links).not.toContain('cyrillic')
    expect(links.match(/<link/g)).toHaveLength(2)
  })
})

describe('injectPage', () => {
  it('replaces the template title and description and fills the root', () => {
    const template = '<html><head>\n    <title>Padrão</title>\n    <meta name="description" content="x" />\n  </head><body><div id="root"></div></body></html>'
    const out = injectPage(template, { head: '<title>Sobre</title>', body: '<p>oi</p>' }, '<link rel="preload">')
    expect(out).not.toContain('Padrão')
    expect(out.match(/<title>/g)).toHaveLength(1)
    expect(out).toContain('<div id="root"><p>oi</p></div>')
    expect(out).toContain('<link rel="preload">')
  })
})

describe('outputPathsFor', () => {
  it('maps routes to nested index files plus a flat html twin', () => {
    expect(outputPathsFor('/d', '/')).toEqual([path.join('/d', 'index.html')])
    expect(outputPathsFor('/d', '/sobre')).toEqual([path.join('/d', 'sobre', 'index.html'), path.join('/d', 'sobre.html')])
  })
})

describe('buildSitemap', () => {
  it('lists every route with the site origin', () => {
    const xml = buildSitemap(['/', '/sobre'], 'https://naturee.com.br/', '2026-11-10')
    expect(xml).toContain('<loc>https://naturee.com.br/</loc>')
    expect(xml).toContain('<loc>https://naturee.com.br/sobre</loc>')
    expect(xml.match(/<url>/g)).toHaveLength(2)
  })
})

describe('injectContentScript', () => {
  it('adds the content script before the closing body tag', async () => {
    const { injectContentScript } = await import('./htmlShell.ts')
    const html = injectContentScript('<html><body><div id="root"></div></body></html>', '{"a":1}')
    expect(html).toContain('<script id="siteContent" type="application/json">{"a":1}</script>')
    expect(html.indexOf('siteContent')).toBeLessThan(html.indexOf('</body>'))
  })
})
