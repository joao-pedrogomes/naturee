import { describe, expect, it } from 'vitest'
import { adminEnv, call, type TestEnv } from '../testing/adminHarness'

type Created = { id: number; email: string; temporaryPassword: string }

async function create(env: TestEnv, cookie: string, email: string) {
  const response = await call(env, 'POST', '/api/admin/users', { email }, { cookie })
  return { response, body: (await response.json()) as Created }
}

describe('admin users', () => {
  it('lists users and marks the current one', async () => {
    const { env, cookie } = await adminEnv()
    const body = (await (await call(env, 'GET', '/api/admin/users', undefined, { cookie })).json()) as { users: { email: string; isSelf: boolean }[] }
    expect(body.users).toEqual([expect.objectContaining({ email: 'admin@exemplo.com', isSelf: true })])
  })

  it('creates a user with a one-time temporary password that must be changed', async () => {
    const { env, cookie } = await adminEnv()
    const { response, body } = await create(env, cookie, ' Nova.Pessoa@Exemplo.com ')
    expect(response.status).toBe(201)
    expect(body.email).toBe('nova.pessoa@exemplo.com')
    expect(body.temporaryPassword).toHaveLength(20)

    const login = await call(env, 'POST', '/api/admin/login', { email: body.email, password: body.temporaryPassword }, { 'cf-connecting-ip': '7.7.7.7' })
    expect(await login.json()).toEqual({ email: body.email, mustChange: true })

    const list = (await (await call(env, 'GET', '/api/admin/users', undefined, { cookie })).json()) as { users: object[] }
    expect(JSON.stringify(list)).not.toContain(body.temporaryPassword)
  })

  it('rejects bad and duplicate e-mails', async () => {
    const { env, cookie } = await adminEnv()
    expect((await create(env, cookie, 'nope')).response.status).toBe(422)
    expect((await create(env, cookie, 'ADMIN@exemplo.com')).response.status).toBe(409)
  })

  it('resets a password, ends that user sessions and forces a change', async () => {
    const { env, cookie } = await adminEnv()
    const { body } = await create(env, cookie, 'outra@exemplo.com')
    const login = await call(env, 'POST', '/api/admin/login', { email: body.email, password: body.temporaryPassword }, { 'cf-connecting-ip': '7.7.7.7' })
    const theirCookie = (login.headers.get('set-cookie') ?? '').split(';')[0]

    const reset = await call(env, 'POST', `/api/admin/users/${body.id}/reset`, {}, { cookie })
    const fresh = (await reset.json()) as { temporaryPassword: string }
    expect(fresh.temporaryPassword).not.toBe(body.temporaryPassword)
    expect((await call(env, 'GET', '/api/admin/me', undefined, { cookie: theirCookie })).status).toBe(401)
    expect((await call(env, 'POST', '/api/admin/login', { email: body.email, password: body.temporaryPassword }, { 'cf-connecting-ip': '8.7.7.7' })).status).toBe(401)
    expect((await call(env, 'POST', '/api/admin/login', { email: body.email, password: fresh.temporaryPassword }, { 'cf-connecting-ip': '9.7.7.7' })).status).toBe(200)
  })

  it('deletes other users but never yourself', async () => {
    const { env, cookie } = await adminEnv()
    const self = (await (await call(env, 'GET', '/api/admin/users', undefined, { cookie })).json()) as { users: { id: number }[] }
    const { body } = await create(env, cookie, 'sai@exemplo.com')
    expect((await call(env, 'DELETE', `/api/admin/users/${self.users[0].id}`, undefined, { cookie })).status).toBe(400)
    expect((await call(env, 'POST', `/api/admin/users/${self.users[0].id}/reset`, {}, { cookie })).status).toBe(400)
    expect((await call(env, 'DELETE', `/api/admin/users/${body.id}`, undefined, { cookie })).status).toBe(200)
    expect((await call(env, 'POST', '/api/admin/login', { email: body.email, password: body.temporaryPassword }, { 'cf-connecting-ip': '6.6.6.6' })).status).toBe(401)
  })

  it('refuses anonymous callers and users who still must change their password', async () => {
    const { env, cookie } = await adminEnv()
    expect((await call(env, 'GET', '/api/admin/users')).status).toBe(401)
    const { body } = await create(env, cookie, 'novo@exemplo.com')
    const login = await call(env, 'POST', '/api/admin/login', { email: body.email, password: body.temporaryPassword }, { 'cf-connecting-ip': '5.5.5.5' })
    const pending = (login.headers.get('set-cookie') ?? '').split(';')[0]
    expect((await call(env, 'GET', '/api/admin/users', undefined, { cookie: pending })).status).toBe(403)
  })
})
