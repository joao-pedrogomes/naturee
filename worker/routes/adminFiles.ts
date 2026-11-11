import { loadOverrides } from '../content/loadContent'
import type { Env } from '../env'
import { error, json } from '../http'

export const MAX_FILE_BYTES = 15 * 1024 * 1024
const CHUNK_BYTES = 1_000_000
const MAX_NAME_LENGTH = 120

type FileRow = { id: string; name: string; slug: string; size: number; created_at: string }

export function fileUrl(id: string, slug: string): string {
  return `/catalogo/${id}/${slug}`
}

function isPdf(bytes: Uint8Array): boolean {
  return bytes.length > 8 && String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-'
}

function displayName(raw: string): string {
  const base = raw.split(/[\\/]/).pop() ?? ''
  const cleaned = base.replace(/[^\p{L}\p{N} ._()-]/gu, '').trim().slice(0, MAX_NAME_LENGTH)
  return cleaned || 'catalogo.pdf'
}

function slugFor(name: string): string {
  const stem = name.replace(/\.pdf$/i, '').normalize('NFD').replace(/[̀-ͯ]/g, '')
  const slug = stem.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
  return `${slug || 'catalogo'}.pdf`
}

async function referencedIds(env: Env): Promise<Set<string>> {
  const ids = new Set<string>()
  for (const value of Object.values(await loadOverrides(env))) {
    if (typeof value !== 'string') continue
    for (const match of value.matchAll(/\/catalogo\/([a-f0-9]{16})\//g)) ids.add(match[1])
  }
  return ids
}

async function list(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare('SELECT id, name, slug, size, created_at FROM files ORDER BY created_at DESC, id DESC').all<FileRow>()
  const used = await referencedIds(env)
  return json({
    files: results.map((row) => ({
      id: row.id,
      name: row.name,
      size: row.size,
      createdAt: row.created_at,
      url: fileUrl(row.id, row.slug),
      inUse: used.has(row.id),
    })),
    maxBytes: MAX_FILE_BYTES,
  })
}

async function upload(request: Request, env: Env): Promise<Response> {
  const length = Number(request.headers.get('content-length'))
  if (!Number.isFinite(length) || length <= 0) return error(411, 'length_required')
  if (length > MAX_FILE_BYTES) return error(413, 'too_large')

  const bytes = new Uint8Array(await request.arrayBuffer())
  if (bytes.length > MAX_FILE_BYTES) return error(413, 'too_large')
  if (!isPdf(bytes)) return error(415, 'pdf_only')

  const name = displayName(new URL(request.url).searchParams.get('name') ?? '')
  const slug = slugFor(name)
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
  const chunkCount = Math.ceil(bytes.length / CHUNK_BYTES)

  const statements = [
    env.DB.prepare('INSERT INTO files (id, name, slug, mime, size, chunks) VALUES (?1, ?2, ?3, ?4, ?5, ?6)').bind(
      id,
      name,
      slug,
      'application/pdf',
      bytes.length,
      chunkCount,
    ),
  ]
  for (let index = 0; index < chunkCount; index += 1) {
    const part = bytes.slice(index * CHUNK_BYTES, (index + 1) * CHUNK_BYTES)
    statements.push(env.DB.prepare('INSERT INTO file_chunks (file_id, idx, data) VALUES (?1, ?2, ?3)').bind(id, index, part.buffer))
  }
  await env.DB.batch(statements)
  return json({ id, name, size: bytes.length, url: fileUrl(id, slug) }, 201)
}

async function remove(env: Env, id: string): Promise<Response> {
  if ((await referencedIds(env)).has(id)) return error(409, 'in_use')
  const result = await env.DB.prepare('DELETE FROM files WHERE id = ?1').bind(id).run()
  return result.meta.changes === 0 ? error(404, 'not_found') : json({ ok: true })
}

export async function handleFiles(request: Request, env: Env, pathname: string): Promise<Response | undefined> {
  if (pathname === '/api/admin/files') {
    if (request.method === 'GET') return list(env)
    if (request.method === 'POST') return upload(request, env)
    return error(405, 'method_not_allowed')
  }
  const match = /^\/api\/admin\/files\/([a-f0-9]{16})$/.exec(pathname)
  if (match && request.method === 'DELETE') return remove(env, match[1])
  return undefined
}
