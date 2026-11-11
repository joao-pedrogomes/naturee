import { validateContact, type ContactFields } from '../../src/lib/contact'
import { sendMail } from '../email/resend'
import type { Env } from '../env'
import { clientHash, error, isSameOrigin, json, readJson } from '../http'
import { pruneRateLimits, registerHit } from '../rateLimit'
import { getSetting } from '../settings'

const MIN_FILL_MS = 1500
const HOURLY_LIMIT = 5

type ContactBody = {
  nome?: unknown
  email?: unknown
  assunto?: unknown
  mensagem?: unknown
  website?: unknown
  elapsedMs?: unknown
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function isBot(body: ContactBody): boolean {
  if (asText(body.website) !== '') return true
  return typeof body.elapsedMs === 'number' && body.elapsedMs < MIN_FILL_MS
}

async function notify(env: Env, id: number, fields: ContactFields): Promise<void> {
  const enabled = (await getSetting(env, 'emailEnabled')) === 'true'
  const to = await getSetting(env, 'leadNotifyEmail')
  if (!enabled || !to) return
  const sent = await sendMail(env, {
    to,
    replyTo: fields.email,
    subject: `Novo contato pelo site: ${fields.subject}`,
    text: `Nome: ${fields.name}\nE-mail: ${fields.email}\nAssunto: ${fields.subject}\n\n${fields.message}`,
  })
  if (!sent) return
  await env.DB.prepare("UPDATE leads SET emailed_at = datetime('now') WHERE id = ?1").bind(id).run()
}

export async function handleContact(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== 'POST') return error(405, 'method_not_allowed')
  if (!isSameOrigin(request)) return error(403, 'forbidden_origin')

  const body = (await readJson(request)) as ContactBody | undefined
  if (!body || typeof body !== 'object') return error(400, 'invalid_body')
  if (isBot(body)) return json({ ok: true }, 201)

  const fields: ContactFields = {
    name: asText(body.nome).trim(),
    email: asText(body.email).trim(),
    subject: asText(body.assunto).trim(),
    message: asText(body.mensagem).trim(),
  }
  const errors = validateContact(fields)
  if (Object.keys(errors).length > 0) return json({ error: 'invalid_fields', fields: errors }, 422)

  const ipHash = await clientHash(request, env.IP_PEPPER)
  const allowed = await registerHit(env, `contact:${ipHash}`, HOURLY_LIMIT, 3600)
  if (!allowed) return error(429, 'too_many_requests')

  const result = await env.DB.prepare(
    'INSERT INTO leads (name, email, subject, message, ip_hash) VALUES (?1, ?2, ?3, ?4, ?5)',
  )
    .bind(fields.name, fields.email, fields.subject, fields.message, ipHash)
    .run()
  const id = Number(result.meta.last_row_id)
  ctx.waitUntil(notify(env, id, fields))
  ctx.waitUntil(pruneRateLimits(env))
  return json({ ok: true, id }, 201)
}
