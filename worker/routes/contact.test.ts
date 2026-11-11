import { describe, expect, it, vi } from 'vitest'
import { createTestEnv, testContext } from '../testing/fakeD1'
import { handleContact } from './contact'

const ORIGIN = 'https://natureefoodhub.com.br'
const VALID = { nome: 'Ana', email: 'ana@exemplo.com', assunto: 'Parceria', mensagem: 'Quero conhecer o catálogo.', elapsedMs: 9000 }

function post(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request(`${ORIGIN}/api/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: ORIGIN, 'cf-connecting-ip': '1.2.3.4', ...headers },
    body: JSON.stringify(body),
  })
}

async function leadCount(env: ReturnType<typeof createTestEnv>): Promise<number> {
  const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM leads').first<{ n: number }>()
  return row?.n ?? 0
}

describe('POST /api/contact', () => {
  it('stores a valid lead and answers 201', async () => {
    const env = createTestEnv()
    const response = await handleContact(post(VALID), env, testContext())
    expect(response.status).toBe(201)
    expect(await leadCount(env)).toBe(1)
  })

  it('rejects another origin and missing origin', async () => {
    const env = createTestEnv()
    expect((await handleContact(post(VALID, { origin: 'https://evil.example' }), env, testContext())).status).toBe(403)
    const noOrigin = new Request(`${ORIGIN}/api/contact`, { method: 'POST', body: JSON.stringify(VALID), headers: { 'content-type': 'application/json' } })
    expect((await handleContact(noOrigin, env, testContext())).status).toBe(403)
    expect(await leadCount(env)).toBe(0)
  })

  it('rejects other methods and non-json bodies', async () => {
    const env = createTestEnv()
    expect((await handleContact(new Request(`${ORIGIN}/api/contact`), env, testContext())).status).toBe(405)
    const text = new Request(`${ORIGIN}/api/contact`, { method: 'POST', body: 'x', headers: { origin: ORIGIN, 'content-type': 'text/plain' } })
    expect((await handleContact(text, env, testContext())).status).toBe(400)
  })

  it('returns field errors for invalid input', async () => {
    const env = createTestEnv()
    const response = await handleContact(post({ ...VALID, email: 'nope', nome: '' }), env, testContext())
    expect(response.status).toBe(422)
    expect(((await response.json()) as { fields: Record<string, string> }).fields).toEqual({ name: 'required', email: 'email' })
    expect(await leadCount(env)).toBe(0)
  })

  it('silently drops honeypot and too-fast submissions', async () => {
    const env = createTestEnv()
    expect((await handleContact(post({ ...VALID, website: 'http://spam' }), env, testContext())).status).toBe(201)
    expect((await handleContact(post({ ...VALID, elapsedMs: 200 }), env, testContext())).status).toBe(201)
    expect(await leadCount(env)).toBe(0)
  })

  it('stores hostile text as data, untouched', async () => {
    const env = createTestEnv()
    const hostile = "'); DROP TABLE leads;-- <script>alert(1)</script>"
    await handleContact(post({ ...VALID, mensagem: hostile }), env, testContext())
    const row = await env.DB.prepare('SELECT message FROM leads').first<{ message: string }>()
    expect(row?.message).toBe(hostile)
  })

  it('limits one address to five leads per hour', async () => {
    const env = createTestEnv()
    for (let i = 0; i < 5; i += 1) expect((await handleContact(post(VALID), env, testContext())).status).toBe(201)
    expect((await handleContact(post(VALID), env, testContext())).status).toBe(429)
    expect((await handleContact(post(VALID, { 'cf-connecting-ip': '9.9.9.9' }), env, testContext())).status).toBe(201)
  })

  it('emails the company when enabled and still answers 201 when mail fails', async () => {
    const env = createTestEnv({ RESEND_API_KEY: 'key' })
    await env.DB.prepare("INSERT INTO settings (key, value) VALUES ('emailEnabled', 'true'), ('leadNotifyEmail', 'equipe@naturee.com')").run()
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const ctx = testContext()
    expect((await handleContact(post(VALID), env, ctx)).status).toBe(201)
    await ctx.settled()
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    expect(sent.to).toEqual(['equipe@naturee.com'])
    expect(sent.reply_to).toBe('ana@exemplo.com')
    expect((await env.DB.prepare('SELECT emailed_at FROM leads').first<{ emailed_at: string }>())?.emailed_at).toBeTruthy()

    fetchMock.mockRejectedValueOnce(new Error('network'))
    const failing = testContext()
    expect((await handleContact(post(VALID, { 'cf-connecting-ip': '5.5.5.5' }), env, failing)).status).toBe(201)
    await failing.settled()
    vi.unstubAllGlobals()
  })
})
