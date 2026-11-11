import { generatePassword } from '../auth/generatePassword'
import { hashPassword } from '../auth/password'
import type { AdminSession } from '../auth/session'
import type { Env } from '../env'
import { error, json, readJson } from '../http'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type UserRow = { id: number; email: string; must_change: number; created_at: string }

async function list(env: Env, session: AdminSession): Promise<Response> {
  const { results } = await env.DB.prepare('SELECT id, email, must_change, created_at FROM users ORDER BY created_at, id').all<UserRow>()
  return json({
    users: results.map((row) => ({
      id: row.id,
      email: row.email,
      mustChange: row.must_change === 1,
      createdAt: row.created_at,
      isSelf: row.id === session.userId,
    })),
  })
}

async function create(request: Request, env: Env): Promise<Response> {
  const body = (await readJson(request)) as { email?: unknown } | undefined
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!EMAIL_PATTERN.test(email) || email.length > 160) return error(422, 'invalid_email')

  const exists = await env.DB.prepare('SELECT id FROM users WHERE email = ?1').bind(email).first()
  if (exists) return error(409, 'email_taken')

  const temporaryPassword = generatePassword()
  const record = await hashPassword(temporaryPassword)
  const result = await env.DB.prepare(
    'INSERT INTO users (email, password_hash, salt, iterations, must_change) VALUES (?1, ?2, ?3, ?4, 1)',
  )
    .bind(email, record.hash, record.salt, record.iterations)
    .run()
  return json({ id: Number(result.meta.last_row_id), email, temporaryPassword }, 201)
}

async function reset(env: Env, session: AdminSession, id: number): Promise<Response> {
  if (id === session.userId) return error(400, 'use_account_page')
  const user = await env.DB.prepare('SELECT id, email FROM users WHERE id = ?1').bind(id).first<{ id: number; email: string }>()
  if (!user) return error(404, 'not_found')

  const temporaryPassword = generatePassword()
  const record = await hashPassword(temporaryPassword)
  await env.DB.batch([
    env.DB.prepare('UPDATE users SET password_hash = ?1, salt = ?2, iterations = ?3, must_change = 1 WHERE id = ?4').bind(
      record.hash,
      record.salt,
      record.iterations,
      id,
    ),
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?1').bind(id),
  ])
  return json({ email: user.email, temporaryPassword })
}

async function remove(env: Env, session: AdminSession, id: number): Promise<Response> {
  if (id === session.userId) return error(400, 'cannot_delete_self')
  const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM users').first<{ n: number }>()
  if ((count?.n ?? 0) <= 1) return error(409, 'last_user')

  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?1').bind(id),
    env.DB.prepare('DELETE FROM users WHERE id = ?1').bind(id),
  ])
  return json({ ok: true })
}

export async function handleUsers(
  request: Request,
  env: Env,
  pathname: string,
  session: AdminSession,
): Promise<Response | undefined> {
  if (pathname === '/api/admin/users') {
    if (request.method === 'GET') return list(env, session)
    if (request.method === 'POST') return create(request, env)
    return error(405, 'method_not_allowed')
  }
  const match = /^\/api\/admin\/users\/(\d+)(\/reset)?$/.exec(pathname)
  if (!match) return undefined
  const id = Number(match[1])
  if (match[2] && request.method === 'POST') return reset(env, session, id)
  if (!match[2] && request.method === 'DELETE') return remove(env, session, id)
  return error(405, 'method_not_allowed')
}
