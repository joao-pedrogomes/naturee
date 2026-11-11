import type { Env } from '../env'
import { error } from '../http'

type ChunkRow = { data: number[] | ArrayBuffer | Uint8Array }

function toBytes(value: ChunkRow['data']): Uint8Array {
  if (value instanceof ArrayBuffer) return new Uint8Array(value)
  return Uint8Array.from(value as ArrayLike<number>)
}

/** Public and immutable: every upload gets a fresh id, so a link never changes content. */
export async function handlePublicFile(request: Request, env: Env, ctx: ExecutionContext, pathname: string): Promise<Response> {
  if (request.method !== 'GET') return error(405, 'method_not_allowed')
  const match = /^\/catalogo\/([a-f0-9]{16})(?:\/[^/]*)?$/.exec(pathname)
  if (!match) return error(404, 'not_found')

  const origin = new URL(request.url).origin
  const cacheKey = new Request(`${origin}/catalogo/${match[1]}`)
  const cache = typeof caches === 'undefined' ? undefined : caches.default
  const cached = await cache?.match(cacheKey)
  if (cached) return cached

  const file = await env.DB.prepare('SELECT size, slug, mime FROM files WHERE id = ?1')
    .bind(match[1])
    .first<{ size: number; slug: string; mime: string }>()
  if (!file) return error(404, 'not_found')

  const { results } = await env.DB.prepare('SELECT data FROM file_chunks WHERE file_id = ?1 ORDER BY idx').bind(match[1]).all<ChunkRow>()
  const body = new Uint8Array(file.size)
  let offset = 0
  for (const row of results) {
    const part = toBytes(row.data)
    body.set(part, offset)
    offset += part.length
  }
  if (offset !== file.size) return error(500, 'incomplete_file')

  const response = new Response(body, {
    headers: {
      'content-type': file.mime,
      'content-disposition': `inline; filename="${file.slug}"`,
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
    },
  })
  if (cache) ctx.waitUntil(cache.put(cacheKey, response.clone()).catch((failure) => console.error('file cache put failed', failure)))
  return response
}
