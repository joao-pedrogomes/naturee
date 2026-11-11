import { defaultContent, enabledRoutes } from '@ssr'
import { buildSitemap } from '../scripts/htmlShell'
import type { Env } from './env'
import { error } from './http'
import { loadContent } from './content/loadContent'
import { handleAdminAuth, requireAdmin } from './routes/adminAuth'
import { handleContent } from './routes/adminContent'
import { handleLeads } from './routes/adminLeads'
import { handleMedia } from './routes/adminMedia'
import { handleSettings } from './routes/adminSettings'
import { handlePublicMedia } from './routes/media'
import { handleContact } from './routes/contact'
import { matchPageRoute, renderPage } from './render/renderPage'

async function sitemap(env: Env): Promise<Response> {
  const content = await loadContent(env).catch(() => defaultContent)
  const paths = enabledRoutes(content).map((route) => route.path)
  const xml = buildSitemap(paths, content.site.url, new Date().toISOString().slice(0, 10))
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } })
}

const ADMIN_CSP =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"

async function adminShell(env: Env, request: Request): Promise<Response> {
  const shell = await env.ASSETS.fetch(new Request(new URL('/ssrTemplate.html', request.url)))
  return new Response(shell.body, {
    status: shell.status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'content-security-policy': ADMIN_CSP,
      'x-robots-tag': 'noindex, nofollow',
      'x-frame-options': 'DENY',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
    },
  })
}

async function handle(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const { pathname } = new URL(request.url)

  if (pathname === '/sitemap.xml') return sitemap(env)
  if (pathname === '/api/contact') return handleContact(request, env, ctx)
  if (pathname.startsWith('/api/admin/')) {
    const response = await handleAdminAuth(request, env, pathname)
    if (response) return response
    const session = await requireAdmin(request, env)
    if (session instanceof Response) return session
    if (session.mustChange) return error(403, 'password_change_required')
    const admin =
      (await handleLeads(request, env, pathname)) ??
      (await handleContent(request, env, pathname, session)) ??
      (await handleSettings(request, env, pathname)) ??
      (await handleMedia(request, env, pathname))
    return admin ?? error(404, 'not_found')
  }
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return adminShell(env, request)
  if (pathname.startsWith('/media/')) return handlePublicMedia(request, env, ctx, pathname)
  if (pathname.startsWith('/api/')) return error(404, 'not_found')

  const route = matchPageRoute(pathname)
  if (route && request.method === 'GET') return renderPage(env, ctx, request, route, false)

  return env.ASSETS.fetch(request)
}

export default { fetch: handle } satisfies ExportedHandler<Env>
