import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ROUTES } from '../src/routes'

const config = JSON.parse(fs.readFileSync('wrangler.jsonc', 'utf8')) as { assets: { run_worker_first: string[] } }

describe('wrangler config', () => {
  it('routes every page, the sitemap, the admin, the API and media through the Worker', () => {
    const patterns = config.assets.run_worker_first
    for (const route of ROUTES) expect(patterns).toContain(route.path)
    for (const required of ['/sitemap.xml', '/admin', '/admin/*', '/api/*', '/media/*', '/catalogo/*']) {
      expect(patterns).toContain(required)
    }
  })
})
