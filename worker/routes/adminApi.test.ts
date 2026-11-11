import { describe, expect, it } from 'vitest'
import { adminEnv, call, webpBlob } from '../testing/adminHarness'

async function insertLead(env: Awaited<ReturnType<typeof adminEnv>>['env'], name: string, status = 'new', subject = 'Oi') {
  await env.DB.prepare('INSERT INTO leads (name, email, subject, message, status, ip_hash) VALUES (?1, ?2, ?3, ?4, ?5, ?6)')
    .bind(name, `${name.toLowerCase()}@x.com`, subject, '=cmd|calc', status, 'h')
    .run()
}

describe('admin API guard', () => {
  it('answers 401 without a session on every admin route', async () => {
    const { env } = await adminEnv()
    for (const [method, path] of [
      ['GET', '/api/admin/leads'],
      ['GET', '/api/admin/leads.csv'],
      ['GET', '/api/admin/content'],
      ['PUT', '/api/admin/content'],
      ['GET', '/api/admin/settings'],
      ['GET', '/api/admin/media'],
      ['POST', '/api/admin/media'],
    ]) {
      expect((await call(env, method, path, method === 'GET' ? undefined : {})).status, `${method} ${path}`).toBe(401)
    }
  })

  it('answers 403 to cross-origin mutations even with a valid session', async () => {
    const { env, cookie } = await adminEnv()
    const response = await call(env, 'PUT', '/api/admin/settings', {}, { cookie, origin: 'https://evil.example' })
    expect(response.status).toBe(403)
  })

  it('answers 404 for unknown admin paths', async () => {
    const { env, cookie } = await adminEnv()
    expect((await call(env, 'GET', '/api/admin/nope', undefined, { cookie })).status).toBe(404)
  })
})

describe('forced password change', () => {
  it('blocks admin data routes until the password is changed', async () => {
    const { env, cookie } = await adminEnv()
    await env.DB.prepare('UPDATE users SET must_change = 1').run()
    expect((await call(env, 'GET', '/api/admin/leads', undefined, { cookie })).status).toBe(403)
    expect((await call(env, 'GET', '/api/admin/me', undefined, { cookie })).status).toBe(200)
  })
})

describe('leads', () => {
  it('lists, filters, searches and counts', async () => {
    const { env, cookie } = await adminEnv()
    await insertLead(env, 'Ana')
    await insertLead(env, 'Bia', 'read')
    await insertLead(env, 'Caio', 'archived', '100% parceria')
    const all = (await (await call(env, 'GET', '/api/admin/leads', undefined, { cookie })).json()) as { leads: unknown[]; counts: Record<string, number> }
    expect(all.leads).toHaveLength(3)
    expect(all.counts).toEqual({ new: 1, read: 1, archived: 1 })
    const read = (await (await call(env, 'GET', '/api/admin/leads?status=read', undefined, { cookie })).json()) as { leads: { name: string }[] }
    expect(read.leads.map((lead) => lead.name)).toEqual(['Bia'])
    const search = (await (await call(env, 'GET', '/api/admin/leads?q=100%25', undefined, { cookie })).json()) as { leads: { name: string }[] }
    expect(search.leads.map((lead) => lead.name)).toEqual(['Caio'])
  })

  it('updates status and deletes', async () => {
    const { env, cookie } = await adminEnv()
    await insertLead(env, 'Ana')
    expect((await call(env, 'PATCH', '/api/admin/leads/1', { status: 'archived' }, { cookie })).status).toBe(200)
    expect((await call(env, 'PATCH', '/api/admin/leads/1', { status: 'weird' }, { cookie })).status).toBe(400)
    expect((await call(env, 'PATCH', '/api/admin/leads/99', { status: 'read' }, { cookie })).status).toBe(404)
    expect((await call(env, 'DELETE', '/api/admin/leads/1', undefined, { cookie })).status).toBe(200)
    expect((await call(env, 'DELETE', '/api/admin/leads/1', undefined, { cookie })).status).toBe(404)
  })

  it('exports CSV with formula cells neutralised', async () => {
    const { env, cookie } = await adminEnv()
    await insertLead(env, 'Ana')
    const response = await call(env, 'GET', '/api/admin/leads.csv', undefined, { cookie })
    expect(response.headers.get('content-type')).toContain('text/csv')
    const text = await response.text()
    expect(text).toContain('"\'=cmd|calc"')
    expect(text).toContain('"Ana"')
  })
})

describe('settings', () => {
  it('round-trips and validates', async () => {
    const { env, cookie } = await adminEnv()
    expect((await call(env, 'PUT', '/api/admin/settings', { leadNotifyEmail: 'equipe@naturee.com', emailEnabled: true }, { cookie })).status).toBe(200)
    const read = (await (await call(env, 'GET', '/api/admin/settings', undefined, { cookie })).json()) as Record<string, unknown>
    expect(read).toMatchObject({ leadNotifyEmail: 'equipe@naturee.com', emailEnabled: true, mailConfigured: false })
    expect((await call(env, 'PUT', '/api/admin/settings', { leadNotifyEmail: 'bad', emailEnabled: true }, { cookie })).status).toBe(422)
    expect((await call(env, 'PUT', '/api/admin/settings', { leadNotifyEmail: '', emailEnabled: true }, { cookie })).status).toBe(422)
  })
})

describe('media', () => {
  async function upload(env: Parameters<typeof call>[0], cookie: string, size = 64) {
    const form = new FormData()
    form.set('file', webpBlob(size), 'a.webp')
    form.set('small', webpBlob(32), 'b.webp')
    form.set('width', '1440')
    form.set('height', '700')
    form.set('alt', 'Foto')
    return call(env, 'POST', '/api/admin/media', form, { cookie })
  }

  it('stores webp uploads and serves them publicly with immutable caching', async () => {
    const { env, cookie } = await adminEnv()
    const created = (await (await upload(env, cookie)).json()) as { id: string }
    expect(created.id).toMatch(/^[a-f0-9]{16}$/)
    const full = await call(env, 'GET', `/media/${created.id}`)
    expect(full.status).toBe(200)
    expect(full.headers.get('content-type')).toBe('image/webp')
    expect(full.headers.get('cache-control')).toContain('immutable')
    expect((await full.arrayBuffer()).byteLength).toBe(64)
    expect((await (await call(env, 'GET', `/media/${created.id}?w=720`)).arrayBuffer()).byteLength).toBe(32)
    expect((await call(env, 'GET', '/media/0000000000000000')).status).toBe(404)
  })

  it('rejects non-webp and oversized files', async () => {
    const { env, cookie } = await adminEnv()
    const form = new FormData()
    form.set('file', new Blob(['<svg onload=alert(1)>'], { type: 'image/svg+xml' }), 'x.svg')
    form.set('width', '10')
    form.set('height', '10')
    expect((await call(env, 'POST', '/api/admin/media', form, { cookie })).status).toBe(415)
    expect((await upload(env, cookie, 700_000)).status).toBe(413)
  })

  it('refuses to delete media that content still uses', async () => {
    const { env, cookie } = await adminEnv()
    const { id } = (await (await upload(env, cookie)).json()) as { id: string }
    await call(env, 'PUT', '/api/admin/content', { changes: { 'pages.home.hero.image': { mediaId: id, alt: 'Nova' } } }, { cookie })
    const blocked = await call(env, 'DELETE', `/api/admin/media/${id}`, undefined, { cookie })
    expect(blocked.status).toBe(409)
    await call(env, 'PUT', '/api/admin/content', { changes: { 'pages.home.hero.image': null } }, { cookie })
    expect((await call(env, 'DELETE', `/api/admin/media/${id}`, undefined, { cookie })).status).toBe(200)
  })
})

describe('content', () => {
  type Field = { path: string; value: unknown; defaultValue: unknown; overridden: boolean }
  async function fields(env: Parameters<typeof call>[0], cookie: string) {
    const data = (await (await call(env, 'GET', '/api/admin/content', undefined, { cookie })).json()) as { fields: Field[]; version: string }
    return { ...data, byPath: new Map(data.fields.map((field) => [field.path, field])) }
  }

  it('applies text edits, bumps the version and can restore a default', async () => {
    const { env, cookie } = await adminEnv()
    const before = await fields(env, cookie)
    const original = before.byPath.get('site.whatsapp')?.value
    const saved = (await (await call(env, 'PUT', '/api/admin/content', { changes: { 'site.whatsapp': '11 90000 0000' } }, { cookie })).json()) as { version: string }
    expect(Number(saved.version)).toBe(Number(before.version) + 1)
    const after = await fields(env, cookie)
    expect(after.byPath.get('site.whatsapp')).toMatchObject({ value: '11 90000 0000', defaultValue: original, overridden: true })
    await call(env, 'PUT', '/api/admin/content', { changes: { 'site.whatsapp': null } }, { cookie })
    expect((await fields(env, cookie)).byPath.get('site.whatsapp')).toMatchObject({ value: original, overridden: false })
  })

  it('rejects unknown paths, wrong types, protected fields and unknown media', async () => {
    const { env, cookie } = await adminEnv()
    const response = await call(
      env,
      'PUT',
      '/api/admin/content',
      { changes: { 'site.url': 'https://evil.example', 'pages.home.enabled': 'no', 'pages.home.hero.image': { mediaId: 'ffffffffffffffff', alt: 'x' } } },
      { cookie },
    )
    expect(response.status).toBe(422)
    expect(Object.keys(((await response.json()) as { fields: object }).fields)).toHaveLength(3)
    expect((await fields(env, cookie)).fields.every((field) => !field.overridden)).toBe(true)
  })

  it('keeps history and restores an earlier state', async () => {
    const { env, cookie } = await adminEnv()
    await call(env, 'PUT', '/api/admin/content', { changes: { 'site.tagline': 'um@x.com' } }, { cookie })
    await call(env, 'PUT', '/api/admin/content', { changes: { 'site.tagline': 'dois@x.com' } }, { cookie })
    const history = (await (await call(env, 'GET', '/api/admin/content/history', undefined, { cookie })).json()) as { history: { version: number; edits: number }[] }
    expect(history.history).toHaveLength(2)
    const firstSnapshot = history.history[history.history.length - 1].version
    expect((await call(env, 'POST', '/api/admin/content/restore', { version: firstSnapshot }, { cookie })).status).toBe(200)
    expect((await fields(env, cookie)).byPath.get('site.tagline')?.overridden).toBe(false)
    expect((await call(env, 'POST', '/api/admin/content/restore', { version: 9999 }, { cookie })).status).toBe(404)
  })

  it('saves and restores dozens of fields while staying far below the D1 query limit', async () => {
    const { env, cookie } = await adminEnv()
    const all = (await (await call(env, 'GET', '/api/admin/content', undefined, { cookie })).json()) as { fields: Field[] }
    const paths = all.fields.filter((field) => field.path.startsWith('pages.') && typeof field.value === 'string' && !/href/i.test(field.path)).slice(0, 120).map((field) => field.path)
    expect(paths.length).toBeGreaterThan(100)

    let queries = 0
    const prepare = env.DB.prepare.bind(env.DB)
    env.DB.prepare = ((sql: string) => {
      queries += 1
      return prepare(sql)
    }) as typeof env.DB.prepare

    const changes = Object.fromEntries(paths.map((path, index) => [path, `valor ${index}`]))
    expect((await call(env, 'PUT', '/api/admin/content', { changes }, { cookie })).status).toBe(200)
    expect(queries).toBeLessThan(15)
    expect((await fields(env, cookie)).fields.filter((field) => field.overridden)).toHaveLength(paths.length)

    await call(env, 'PUT', '/api/admin/content', { changes: { 'site.tagline': 'novo@x.com' } }, { cookie })
    queries = 0
    const history = (await (await call(env, 'GET', '/api/admin/content/history', undefined, { cookie })).json()) as { history: { version: number; edits: number }[] }
    const withMany = history.history.find((entry) => entry.edits === paths.length)!
    expect((await call(env, 'POST', '/api/admin/content/restore', { version: withMany.version }, { cookie })).status).toBe(200)
    expect(queries).toBeLessThan(15)
    expect((await fields(env, cookie)).fields.filter((field) => field.overridden)).toHaveLength(paths.length)
  })

  it('never hands two concurrent saves the same version', async () => {
    const { env, cookie } = await adminEnv()
    const results = await Promise.all(
      ['a', 'b', 'c'].map(async (suffix) =>
        ((await (await call(env, 'PUT', '/api/admin/content', { changes: { 'site.tagline': `texto ${suffix}` } }, { cookie })).json()) as { version: string }).version,
      ),
    )
    const final = (await fields(env, cookie)).version
    expect(Number(final)).toBe(3)
    expect(results).toContain('3')
  })

  it('stores hostile text as inert data', async () => {
    const { env, cookie } = await adminEnv()
    const hostile = '</script><img src=x onerror=alert(1)>'
    await call(env, 'PUT', '/api/admin/content', { changes: { 'site.tagline': hostile } }, { cookie })
    expect((await fields(env, cookie)).byPath.get('site.tagline')?.value).toBe(hostile)
  })
})
