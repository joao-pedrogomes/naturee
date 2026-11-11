import { defaultContent } from '@ssr'
import { builtinImages } from '../../src/content/overrides'
import { loadOverrides } from '../content/loadContent'
import type { Env } from '../env'
import { error, json } from '../http'

const MAX_FULL_BYTES = 600_000
const MAX_SMALL_BYTES = 300_000
const MAX_DIMENSION = 4000

type MediaRow = { id: string; width: number; height: number; size: number; alt: string; created_at: string }

function isWebp(bytes: Uint8Array): boolean {
  const text = (from: number) => String.fromCharCode(...bytes.slice(from, from + 4))
  return bytes.length > 12 && text(0) === 'RIFF' && text(8) === 'WEBP'
}

function dimension(value: string | File | null): number | null {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 && parsed <= MAX_DIMENSION ? parsed : null
}

async function usageById(env: Env): Promise<Map<string, string[]>> {
  const usage = new Map<string, string[]>()
  for (const [path, value] of Object.entries(await loadOverrides(env))) {
    const id = (value as { mediaId?: unknown } | null)?.mediaId
    if (typeof id !== 'string') continue
    usage.set(id, [...(usage.get(id) ?? []), path])
  }
  return usage
}

/** Places that show a shipped picture right now: its own default spots, minus replaced ones, plus spots that point to it. */
async function builtinList(env: Env) {
  const overrides = await loadOverrides(env)
  const images = builtinImages(defaultContent)
  return images.map((entry) => {
    const kept = entry.paths.filter((path) => !(path in overrides))
    const pointing = Object.entries(overrides)
      .filter(([, value]) => (value as { ref?: unknown } | null)?.ref === entry.ref)
      .map(([path]) => path)
    return { ...entry, usedBy: [...kept, ...pointing.filter((path) => !kept.includes(path))] }
  })
}

async function list(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    'SELECT id, width, height, size, alt, created_at FROM media ORDER BY created_at DESC, id DESC',
  ).all<MediaRow>()
  const usage = await usageById(env)
  return json({
    builtin: (await builtinList(env)).map((entry) => ({
      ref: entry.ref,
      src: entry.image.src,
      srcSet: entry.image.srcSet,
      alt: entry.image.alt,
      width: entry.image.width,
      height: entry.image.height,
      usedBy: entry.usedBy,
    })),
    media: results.map((row) => ({
      id: row.id,
      width: row.width,
      height: row.height,
      size: row.size,
      alt: row.alt,
      createdAt: row.created_at,
      usedBy: usage.get(row.id) ?? [],
    })),
  })
}

async function upload(request: Request, env: Env): Promise<Response> {
  const length = Number(request.headers.get('content-length'))
  if (!Number.isFinite(length) || length <= 0) return error(411, 'length_required')
  if (length > MAX_FULL_BYTES + MAX_SMALL_BYTES + 20_000) return error(413, 'too_large')
  if (!(request.headers.get('content-type') ?? '').includes('multipart/form-data')) return error(400, 'invalid_body')

  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  const small = form?.get('small')
  const width = dimension(form?.get('width') ?? null)
  const height = dimension(form?.get('height') ?? null)
  if (!form || !(file instanceof Blob) || !width || !height) return error(400, 'invalid_body')

  const full = new Uint8Array(await file.arrayBuffer())
  if (full.length > MAX_FULL_BYTES) return error(413, 'too_large')
  if (!isWebp(full)) return error(415, 'webp_only')

  let smallBytes: ArrayBuffer | null = null
  if (small instanceof Blob) {
    const bytes = new Uint8Array(await small.arrayBuffer())
    if (bytes.length > MAX_SMALL_BYTES) return error(413, 'too_large')
    if (!isWebp(bytes)) return error(415, 'webp_only')
    smallBytes = bytes.buffer as ArrayBuffer
  }

  const alt = String(form.get('alt') ?? '').trim().slice(0, 300)
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
  await env.DB.prepare(
    'INSERT INTO media (id, mime, width, height, size, data, data_small, alt) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)',
  )
    .bind(id, 'image/webp', width, height, full.length, full.buffer, smallBytes, alt)
    .run()
  return json({ id, width, height, size: full.length, alt }, 201)
}

async function remove(env: Env, id: string): Promise<Response> {
  const usedBy = (await usageById(env)).get(id)
  if (usedBy) return json({ error: 'in_use', usedBy }, 409)
  const result = await env.DB.prepare('DELETE FROM media WHERE id = ?1').bind(id).run()
  return result.meta.changes === 0 ? error(404, 'not_found') : json({ ok: true })
}

export async function handleMedia(request: Request, env: Env, pathname: string): Promise<Response | undefined> {
  if (pathname === '/api/admin/media') {
    if (request.method === 'GET') return list(env)
    if (request.method === 'POST') return upload(request, env)
    return error(405, 'method_not_allowed')
  }
  const match = /^\/api\/admin\/media\/([a-f0-9]{16})$/.exec(pathname)
  if (match && request.method === 'DELETE') return remove(env, match[1])
  return undefined
}
