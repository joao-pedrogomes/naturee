import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { rememberContentVersion } from '../content/loadContent'
import { adminEnv, call, type TestEnv } from '../testing/adminHarness'
import { ROUTES } from '../../src/routes'

const TEMPLATE = '<!doctype html><html><head></head><body><div id="root"></div></body></html>'
const STATIC = '<html>static prerendered page</html>'

function fakeCaches() {
  const store = new Map<string, Response>()
  return {
    store,
    default: {
      match: async (request: Request) => store.get(request.url)?.clone(),
      put: async (request: Request, response: Response) => void store.set(request.url, response),
    },
  }
}

function installAssets(env: TestEnv, options: { templateFails?: boolean } = {}) {
  env.ASSETS = {
    fetch: async (request: Request) => {
      if (new URL(request.url).pathname === '/ssrTemplate.html') {
        return options.templateFails ? new Response('nope', { status: 500 }) : new Response(TEMPLATE)
      }
      return new Response(STATIC)
    },
  } as unknown as Fetcher
}

async function publish(env: TestEnv, cookie: string, changes: Record<string, unknown>) {
  const response = await call(env, 'PUT', '/api/admin/content', { changes }, { cookie })
  expect(response.status).toBe(200)
}

beforeEach(() => {
  vi.stubGlobal('caches', fakeCaches())
  rememberContentVersion('0')
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('public pages served by the Worker', () => {
  it('serves the prerendered static page while nothing was ever published', async () => {
    const { env } = await adminEnv()
    installAssets(env)
    expect(await (await call(env, 'GET', '/sobre')).text()).toBe(STATIC)
  })

  it.each(ROUTES.map((route) => [route.key, route.path]))('%s shows an edited title, SEO tags and injected content', async (key, path) => {
    const { env, cookie } = await adminEnv()
    installAssets(env)
    const seoPath = `pages.${key}.seo.title`
    await publish(env, cookie, { [seoPath]: `Titulo SEO ${key}` })

    const response = await call(env, 'GET', path)
    const html = await response.text()
    expect(response.status).toBe(200)
    expect(html).toContain(`Titulo SEO ${key}`)
    expect(html).toMatch(/<title>[^<]*Titulo SEO/)
    expect(html).toContain('<script id="siteContent" type="application/json">')
    expect(html).toContain('id="root"><')
  })

  it('renders edited visible text, including italic markup', async () => {
    const { env, cookie } = await adminEnv()
    installAssets(env)
    await publish(env, cookie, { 'pages.about.hero.title': 'Titulo *editado* aqui' })
    const html = await (await call(env, 'GET', '/sobre')).text()
    expect(html).toContain('<em>editado</em>')
  })

  it('answers 404 for a disabled page and drops it from the sitemap', async () => {
    const { env, cookie } = await adminEnv()
    installAssets(env)
    await publish(env, cookie, { 'pages.logistics.enabled': false })
    expect((await call(env, 'GET', '/logistica')).status).toBe(404)
    const sitemap = await (await call(env, 'GET', '/sitemap.xml')).text()
    expect(sitemap).not.toContain('/logistica')
    expect(sitemap).toContain('/sobre')
  })

  it('caches by content version and re-renders after the next publish', async () => {
    const { env, cookie } = await adminEnv()
    installAssets(env)
    await publish(env, cookie, { 'pages.about.seo.title': 'Primeiro' })
    const first = await (await call(env, 'GET', '/sobre')).text()

    const prepare = env.DB.prepare.bind(env.DB)
    let overrideReads = 0
    env.DB.prepare = ((sql: string) => {
      if (sql.includes('FROM content_overrides')) overrideReads += 1
      return prepare(sql)
    }) as typeof env.DB.prepare
    expect(await (await call(env, 'GET', '/sobre')).text()).toBe(first)
    expect(overrideReads).toBe(0)

    await publish(env, cookie, { 'pages.about.seo.title': 'Segundo' })
    expect(await (await call(env, 'GET', '/sobre')).text()).toContain('Segundo')
  })

  it('falls back to the static page when rendering cannot complete', async () => {
    const { env, cookie } = await adminEnv()
    await publish(env, cookie, { 'pages.about.seo.title': 'Qualquer' })
    installAssets(env, { templateFails: true })
    expect(await (await call(env, 'GET', '/sobre')).text()).toBe(STATIC)
  })

  it('answers the sitemap from defaults when the database is unavailable', async () => {
    const { env } = await adminEnv()
    installAssets(env)
    env.DB.prepare = (() => {
      throw new Error('d1 down')
    }) as typeof env.DB.prepare
    const sitemap = await (await call(env, 'GET', '/sitemap.xml')).text()
    for (const route of ROUTES) expect(sitemap).toContain(route.path === '/' ? '/</loc>' : route.path)
  })
})
