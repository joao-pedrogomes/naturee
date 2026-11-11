import { hashPassword, passwordProblem, verifyPassword, type PasswordRecord } from '../auth/password'
import {
  clearedSessionCookie,
  createSession,
  destroyOtherSessions,
  destroySession,
  getSession,
  sessionCookie,
  type AdminSession,
} from '../auth/session'
import type { Env } from '../env'
import { clientIp, error, isSameOrigin, json, readJson, sha256Hex } from '../http'
import { registerHit } from '../rateLimit'

const LOGIN_ATTEMPTS = 5
const LOGIN_IP_ATTEMPTS = 20
const LOGIN_WINDOW_SECONDS = 15 * 60

type UserRow = { id: number; email: string; password_hash: string; salt: string; iterations: number; must_change: number }

/** Verified when the email is unknown so both paths cost the same time. */
const DUMMY_RECORD: PasswordRecord = {
  hash: 'Ki+SHxue+T/1ojOPP2wbkFWcak9uQPlqZutKhGQekwo=',
  salt: 'iOg6aZLggQ9zJ9IeXpG6TA==',
  iterations: 100000,
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export async function requireAdmin(request: Request, env: Env): Promise<AdminSession | Response> {
  const session = await getSession(env, request)
  if (!session) return error(401, 'unauthorized')
  if (request.method !== 'GET' && request.method !== 'HEAD' && !isSameOrigin(request)) return error(403, 'forbidden_origin')
  return session
}

async function login(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return error(405, 'method_not_allowed')
  if (!isSameOrigin(request)) return error(403, 'forbidden_origin')

  const body = (await readJson(request)) as { email?: unknown; password?: unknown } | undefined
  const email = asText(body?.email).trim().toLowerCase()
  const password = asText(body?.password)
  if (!email || !password || password.length > 200) return error(400, 'invalid_body')

  const ipHash = (await sha256Hex(`${clientIp(request)}:${env.IP_PEPPER ?? 'dev'}`)).slice(0, 32)
  const withinAccount = await registerHit(env, `login:${ipHash}:${email}`, LOGIN_ATTEMPTS, LOGIN_WINDOW_SECONDS)
  const withinIp = await registerHit(env, `login-ip:${ipHash}`, LOGIN_IP_ATTEMPTS, LOGIN_WINDOW_SECONDS)
  if (!withinAccount || !withinIp) return error(429, 'too_many_attempts')

  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?1').bind(email).first<UserRow>()
  const record: PasswordRecord = user
    ? { hash: user.password_hash, salt: user.salt, iterations: user.iterations }
    : DUMMY_RECORD
  const valid = await verifyPassword(password, record)
  if (!user || !valid) return error(401, 'invalid_credentials')

  const token = await createSession(env, user.id)
  return json({ email: user.email, mustChange: user.must_change === 1 }, 200, { 'set-cookie': sessionCookie(token) })
}

async function logout(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return error(405, 'method_not_allowed')
  if (!isSameOrigin(request)) return error(403, 'forbidden_origin')
  const session = await getSession(env, request)
  if (session) await destroySession(env, session.tokenHash)
  return json({ ok: true }, 200, { 'set-cookie': clearedSessionCookie() })
}

async function me(request: Request, env: Env): Promise<Response> {
  const session = await getSession(env, request)
  if (!session) return error(401, 'unauthorized')
  return json({ email: session.email, mustChange: session.mustChange })
}

async function changePassword(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return error(405, 'method_not_allowed')
  const session = await requireAdmin(request, env)
  if (session instanceof Response) return session

  const body = (await readJson(request)) as { current?: unknown; next?: unknown } | undefined
  const current = asText(body?.current)
  const next = asText(body?.next)
  const problem = passwordProblem(next)
  if (problem) return json({ error: 'weak_password', reason: problem }, 422)
  if (next === current) return json({ error: 'weak_password', reason: 'same_as_current' }, 422)

  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?1').bind(session.userId).first<UserRow>()
  if (!user) return error(401, 'unauthorized')
  const valid = await verifyPassword(current, { hash: user.password_hash, salt: user.salt, iterations: user.iterations })
  if (!valid) return error(401, 'invalid_credentials')

  const record = await hashPassword(next)
  await env.DB.prepare('UPDATE users SET password_hash = ?1, salt = ?2, iterations = ?3, must_change = 0 WHERE id = ?4')
    .bind(record.hash, record.salt, record.iterations, user.id)
    .run()
  await destroyOtherSessions(env, user.id, session.tokenHash)
  return json({ ok: true })
}

export async function handleAdminAuth(request: Request, env: Env, pathname: string): Promise<Response | undefined> {
  if (pathname === '/api/admin/login') return login(request, env)
  if (pathname === '/api/admin/logout') return logout(request, env)
  if (pathname === '/api/admin/me') return me(request, env)
  if (pathname === '/api/admin/password') return changePassword(request, env)
  return undefined
}
