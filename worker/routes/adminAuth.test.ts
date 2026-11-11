import { describe, expect, it } from 'vitest'
import { hashPassword } from '../auth/password'
import { createTestEnv } from '../testing/fakeD1'
import { handleAdminAuth, requireAdmin } from './adminAuth'

const ORIGIN = 'https://natureefoodhub.com.br'
const EMAIL = 'admin@exemplo.com'
const PASSWORD = 'a very long secret 42'

async function setup() {
  const env = createTestEnv()
  const record = await hashPassword(PASSWORD, 1000)
  await env.DB.prepare('INSERT INTO users (email, password_hash, salt, iterations, must_change) VALUES (?1, ?2, ?3, ?4, 1)')
    .bind(EMAIL, record.hash, record.salt, record.iterations)
    .run()
  return env
}

function call(env: ReturnType<typeof createTestEnv>, path: string, body?: unknown, headers: Record<string, string> = {}) {
  const request = new Request(`${ORIGIN}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'content-type': 'application/json', origin: ORIGIN, 'cf-connecting-ip': '8.8.8.8', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return handleAdminAuth(request, env, path) as Promise<Response>
}

function cookieFrom(response: Response): string {
  return (response.headers.get('set-cookie') ?? '').split(';')[0]
}

describe('admin login', () => {
  it('logs in, sets a hardened cookie and reports mustChange', async () => {
    const env = await setup()
    const response = await call(env, '/api/admin/login', { email: ' Admin@Exemplo.com ', password: PASSWORD })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ email: EMAIL, mustChange: true })
    const cookie = response.headers.get('set-cookie') ?? ''
    for (const part of ['__Host-naturee_session=', 'HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/']) expect(cookie).toContain(part)
    expect(cookie).not.toContain('Domain')
  })

  it('stores only a hash of the session token', async () => {
    const env = await setup()
    const response = await call(env, '/api/admin/login', { email: EMAIL, password: PASSWORD })
    const token = cookieFrom(response).split('=')[1]
    const row = await env.DB.prepare('SELECT token_hash FROM sessions').first<{ token_hash: string }>()
    expect(row?.token_hash).toBeTruthy()
    expect(row?.token_hash).not.toBe(token)
    expect(row?.token_hash).toHaveLength(64)
  })

  it('answers the same for a wrong password and an unknown user', async () => {
    const env = await setup()
    const wrong = await call(env, '/api/admin/login', { email: EMAIL, password: 'nope nope nope nope' })
    const unknown = await call(env, '/api/admin/login', { email: 'ghost@exemplo.com', password: 'nope nope nope nope' })
    expect(wrong.status).toBe(401)
    expect(unknown.status).toBe(401)
    expect(await wrong.json()).toEqual(await unknown.json())
  })

  it('blocks the sixth attempt for the same account', async () => {
    const env = await setup()
    for (let i = 0; i < 5; i += 1) expect((await call(env, '/api/admin/login', { email: EMAIL, password: 'bad bad bad bad' })).status).toBe(401)
    expect((await call(env, '/api/admin/login', { email: EMAIL, password: PASSWORD })).status).toBe(429)
  })

  it('rejects other origins and malformed bodies', async () => {
    const env = await setup()
    expect((await call(env, '/api/admin/login', { email: EMAIL, password: PASSWORD }, { origin: 'https://evil.example' })).status).toBe(403)
    expect((await call(env, '/api/admin/login', { email: EMAIL })).status).toBe(400)
  })

  it('treats SQL in the email as plain text', async () => {
    const env = await setup()
    const response = await call(env, '/api/admin/login', { email: "' OR 1=1 --", password: 'whatever whatever' })
    expect(response.status).toBe(401)
  })
})

describe('session', () => {
  async function loggedIn() {
    const env = await setup()
    const login = await call(env, '/api/admin/login', { email: EMAIL, password: PASSWORD })
    return { env, cookie: cookieFrom(login) }
  }

  it('serves /me with a valid cookie and 401 without', async () => {
    const { env, cookie } = await loggedIn()
    expect((await call(env, '/api/admin/me', undefined, { cookie })).status).toBe(200)
    expect((await call(env, '/api/admin/me')).status).toBe(401)
    expect((await call(env, '/api/admin/me', undefined, { cookie: '__Host-naturee_session=forged' })).status).toBe(401)
  })

  it('rejects expired sessions', async () => {
    const { env, cookie } = await loggedIn()
    await env.DB.prepare('UPDATE sessions SET expires_at = 1').run()
    expect((await call(env, '/api/admin/me', undefined, { cookie })).status).toBe(401)
  })

  it('logout deletes the session', async () => {
    const { env, cookie } = await loggedIn()
    const out = await call(env, '/api/admin/logout', {}, { cookie })
    expect(out.headers.get('set-cookie')).toContain('Max-Age=0')
    expect((await call(env, '/api/admin/me', undefined, { cookie })).status).toBe(401)
  })

  it('requireAdmin guards mutating requests by origin', async () => {
    const { env, cookie } = await loggedIn()
    const cross = new Request(`${ORIGIN}/api/admin/leads`, { method: 'DELETE', headers: { cookie, origin: 'https://evil.example' } })
    const result = await requireAdmin(cross, env)
    expect(result instanceof Response && result.status).toBe(403)
    const anonymous = await requireAdmin(new Request(`${ORIGIN}/api/admin/leads`), env)
    expect(anonymous instanceof Response && anonymous.status).toBe(401)
  })
})

describe('change password', () => {
  it('updates the hash, clears mustChange and revokes other sessions', async () => {
    const env = await setup()
    const first = cookieFrom(await call(env, '/api/admin/login', { email: EMAIL, password: PASSWORD }, { 'cf-connecting-ip': '1.1.1.1' }))
    const second = cookieFrom(await call(env, '/api/admin/login', { email: EMAIL, password: PASSWORD }, { 'cf-connecting-ip': '2.2.2.2' }))
    const changed = await call(env, '/api/admin/password', { current: PASSWORD, next: 'brand new passphrase 7' }, { cookie: first })
    expect(changed.status).toBe(200)
    expect((await call(env, '/api/admin/me', undefined, { cookie: second })).status).toBe(401)
    const me = await call(env, '/api/admin/me', undefined, { cookie: first })
    expect(await me.json()).toEqual({ email: EMAIL, mustChange: false })
    const again = await call(env, '/api/admin/login', { email: EMAIL, password: 'brand new passphrase 7' }, { 'cf-connecting-ip': '3.3.3.3' })
    expect(again.status).toBe(200)
  })

  it('rejects a wrong current password and weak new ones', async () => {
    const env = await setup()
    const cookie = cookieFrom(await call(env, '/api/admin/login', { email: EMAIL, password: PASSWORD }))
    expect((await call(env, '/api/admin/password', { current: 'wrong wrong wrong', next: 'brand new passphrase 7' }, { cookie })).status).toBe(401)
    expect((await call(env, '/api/admin/password', { current: PASSWORD, next: 'short' }, { cookie })).status).toBe(422)
    expect((await call(env, '/api/admin/password', { current: PASSWORD, next: PASSWORD }, { cookie })).status).toBe(422)
  })
})
