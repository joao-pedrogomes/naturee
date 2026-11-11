import { describe, expect, it } from 'vitest'
import worker from '../index'
import { testContext } from '../testing/fakeD1'
import { ORIGIN, adminEnv, call, type TestEnv } from '../testing/adminHarness'

function pdfBytes(size: number): Uint8Array {
  const bytes = new Uint8Array(size)
  bytes.set(new TextEncoder().encode('%PDF-1.7\n'), 0)
  bytes.fill(7, 9)
  return bytes
}

async function uploadPdf(env: TestEnv, cookie: string, bytes: Uint8Array, name = 'Catálogo Naturee 2026.pdf') {
  return worker.fetch(
    new Request(`${ORIGIN}/api/admin/files?name=${encodeURIComponent(name)}`, {
      method: 'POST',
      headers: { origin: ORIGIN, cookie, 'content-type': 'application/pdf', 'content-length': String(bytes.length), 'cf-connecting-ip': '8.8.8.8' },
      body: bytes,
    }),
    env,
    testContext(),
  )
}

type Created = { id: string; url: string; size: number; name: string }

describe('catalog files', () => {
  it('stores a multi-chunk PDF and serves it back byte for byte', async () => {
    const { env, cookie } = await adminEnv()
    const bytes = pdfBytes(2_500_000)
    const response = await uploadPdf(env, cookie, bytes)
    expect(response.status).toBe(201)
    const created = (await response.json()) as Created
    expect(created.url).toMatch(/^\/catalogo\/[a-f0-9]{16}\/catalogo-naturee-2026\.pdf$/)

    const served = await call(env, 'GET', created.url)
    expect(served.status).toBe(200)
    expect(served.headers.get('content-type')).toBe('application/pdf')
    expect(served.headers.get('cache-control')).toContain('immutable')
    expect(new Uint8Array(await served.arrayBuffer())).toEqual(bytes)
  })

  it('serves the public file without a session and 404s unknown ids', async () => {
    const { env, cookie } = await adminEnv()
    const created = (await (await uploadPdf(env, cookie, pdfBytes(5000))).json()) as Created
    expect((await call(env, 'GET', created.url)).status).toBe(200)
    expect((await call(env, 'GET', '/catalogo/0000000000000000/x.pdf')).status).toBe(404)
  })

  it('only accepts PDFs and bounded sizes', async () => {
    const { env, cookie } = await adminEnv()
    expect((await uploadPdf(env, cookie, new TextEncoder().encode('<html>not a pdf at all</html>'))).status).toBe(415)
    expect((await uploadPdf(env, cookie, pdfBytes(15 * 1024 * 1024 + 1))).status).toBe(413)
  })

  it('requires a session', async () => {
    const { env } = await adminEnv()
    expect((await call(env, 'GET', '/api/admin/files')).status).toBe(401)
    expect((await call(env, 'POST', '/api/admin/files', {})).status).toBe(401)
  })

  it('cleans odd file names', async () => {
    const { env, cookie } = await adminEnv()
    const created = (await (await uploadPdf(env, cookie, pdfBytes(100), '../../etc/pa<ss>wd "x".pdf')).json()) as Created
    expect(created.name).toBe('passwd x.pdf')
    expect(created.url).toMatch(/\/passwd-x\.pdf$/)
  })

  it('lists files and blocks deleting one that a content link uses', async () => {
    const { env, cookie } = await adminEnv()
    const created = (await (await uploadPdf(env, cookie, pdfBytes(3000))).json()) as Created
    const listed = (await (await call(env, 'GET', '/api/admin/files', undefined, { cookie })).json()) as { files: { id: string; inUse: boolean }[] }
    expect(listed.files).toEqual([expect.objectContaining({ id: created.id, inUse: false })])

    const saved = await call(env, 'PUT', '/api/admin/content', { changes: { 'site.catalogPdfUrl': created.url } }, { cookie })
    expect(saved.status).toBe(200)
    expect((await call(env, 'DELETE', `/api/admin/files/${created.id}`, undefined, { cookie })).status).toBe(409)

    await call(env, 'PUT', '/api/admin/content', { changes: { 'site.catalogPdfUrl': null } }, { cookie })
    expect((await call(env, 'DELETE', `/api/admin/files/${created.id}`, undefined, { cookie })).status).toBe(200)
    expect((await call(env, 'GET', created.url)).status).toBe(404)
    const chunks = await env.DB.prepare('SELECT COUNT(*) AS n FROM file_chunks').first<{ n: number }>()
    expect(chunks?.n).toBe(0)
  })
})
