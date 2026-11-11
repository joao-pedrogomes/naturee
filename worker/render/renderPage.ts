import { render } from '@ssr'
import { extractHead, injectContentScript, injectPage } from '../../scripts/htmlShell'
import { serializeContent } from '../../src/lib/serializeContent'
import { ROUTES, type RouteDef } from '../../src/routes'
import type { Env } from '../env'
import { loadContent, loadContentVersion } from '../content/loadContent'

const TEMPLATE_PATH = '/ssrTemplate.html'
const CACHE_SECONDS = 86_400
const PRISTINE_VERSION = '0'

export function matchPageRoute(pathname: string): RouteDef | undefined {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return ROUTES.find((route) => route.path === normalized)
}

async function loadTemplate(env: Env, origin: string): Promise<string> {
  const response = await env.ASSETS.fetch(new Request(`${origin}${TEMPLATE_PATH}`))
  if (!response.ok) throw new Error(`template ${response.status}`)
  return response.text()
}

async function renderFresh(env: Env, route: RouteDef, origin: string): Promise<Response> {
  const [content, template] = await Promise.all([loadContent(env), loadTemplate(env, origin)])
  const page = extractHead(render(route.path, content))
  const html = injectContentScript(injectPage(template, page, ''), serializeContent(content))
  const status = content.pages[route.key].enabled ? 200 : 404
  return new Response(html, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': `public, s-maxage=${CACHE_SECONDS}` },
  })
}

/** Falls back to the prerendered static page so a backend failure never takes the site down. */
async function staticFallback(env: Env, request: Request): Promise<Response> {
  const response = await env.ASSETS.fetch(request)
  const marked = new Response(response.body, response)
  marked.headers.set('x-render-fallback', '1')
  return marked
}

export async function renderPage(
  env: Env,
  ctx: ExecutionContext,
  request: Request,
  route: RouteDef,
): Promise<Response> {
  const url = new URL(request.url)
  const cache = caches.default

  try {
    const version = await loadContentVersion(env)
    if (version === PRISTINE_VERSION) return await staticFallback(env, request)
    const cacheKey = new Request(`${url.origin}/__page/${env.CF_VERSION?.id ?? 'dev'}/${version}${route.path}`)
    const hit = await cache.match(cacheKey)
    if (hit) return hit
    const response = await renderFresh(env, route, url.origin)
    ctx.waitUntil(cache.put(cacheKey, response.clone()).catch((failure) => console.error('page cache put failed', failure)))
    return response
  } catch (failure) {
    console.error('render failed, serving static page', route.path, failure)
    return staticFallback(env, request)
  }
}
