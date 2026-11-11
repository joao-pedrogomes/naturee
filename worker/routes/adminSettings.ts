import type { Env } from '../env'
import { error, json, readJson } from '../http'
import { getSetting, setSettings } from '../settings'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

async function read(env: Env): Promise<Response> {
  return json({
    leadNotifyEmail: (await getSetting(env, 'leadNotifyEmail')) ?? '',
    emailEnabled: (await getSetting(env, 'emailEnabled')) === 'true',
    mailConfigured: Boolean(env.RESEND_API_KEY),
  })
}

async function write(request: Request, env: Env): Promise<Response> {
  const body = (await readJson(request)) as { leadNotifyEmail?: unknown; emailEnabled?: unknown } | undefined
  if (!body) return error(400, 'invalid_body')

  const email = typeof body.leadNotifyEmail === 'string' ? body.leadNotifyEmail.trim() : ''
  if (email && (!EMAIL_PATTERN.test(email) || email.length > 160)) return error(422, 'invalid_email')
  if (typeof body.emailEnabled !== 'boolean') return error(422, 'invalid_enabled')
  if (body.emailEnabled && !email) return error(422, 'email_required')

  await setSettings(env, { leadNotifyEmail: email, emailEnabled: String(body.emailEnabled) })
  return json({ ok: true })
}

export async function handleSettings(request: Request, env: Env, pathname: string): Promise<Response | undefined> {
  if (pathname !== '/api/admin/settings') return undefined
  if (request.method === 'GET') return read(env)
  if (request.method === 'PUT') return write(request, env)
  return error(405, 'method_not_allowed')
}
