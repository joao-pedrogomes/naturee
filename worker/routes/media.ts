import type { Env } from '../env'
import { error } from '../http'

type BlobRow = { data: number[] | ArrayBuffer | Uint8Array; data_small: number[] | ArrayBuffer | Uint8Array | null }

function toBytes(value: BlobRow['data']): Uint8Array<ArrayBuffer> {
  if (value instanceof ArrayBuffer) return new Uint8Array(value)
  return Uint8Array.from(value as ArrayLike<number>)
}

/** Public, immutable: an id never changes content, so browsers and the edge may keep it for a year. */
export async function handlePublicMedia(request: Request, env: Env, ctx: ExecutionContext, pathname: string): Promise<Response> {
  if (request.method !== 'GET') return error(405, 'method_not_allowed')
  const match = /^\/media\/([a-f0-9]{16})$/.exec(pathname)
  if (!match) return error(404, 'not_found')

  const wantsSmallVariant = new URL(request.url).searchParams.get('w') === '720'
  const cacheKey = new Request(`${new URL(request.url).origin}/media/${match[1]}${wantsSmallVariant ? '?w=720' : ''}`)
  const cache = typeof caches === 'undefined' ? undefined : caches.default
  const cached = await cache?.match(cacheKey)
  if (cached) return cached

  const row = await env.DB.prepare('SELECT data, data_small FROM media WHERE id = ?1').bind(match[1]).first<BlobRow>()
  if (!row) return error(404, 'not_found')

  const wantsSmall = wantsSmallVariant && row.data_small
  const response = new Response(toBytes(wantsSmall ? (row.data_small as BlobRow['data']) : row.data), {
    headers: {
      'content-type': 'image/webp',
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
    },
  })
  if (cache) ctx.waitUntil(cache.put(cacheKey, response.clone()))
  return response
}
