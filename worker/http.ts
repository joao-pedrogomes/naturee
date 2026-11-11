const BASE_HEADERS = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
}

export function json(body: unknown, status = 200, extra: HeadersInit = {}): Response {
  const headers = new Headers({ ...BASE_HEADERS, 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  new Headers(extra).forEach((value, key) => headers.append(key, value))
  return new Response(JSON.stringify(body), { status, headers })
}

export function error(status: number, code: string): Response {
  return json({ error: code }, status)
}

/** Browsers always send Origin on cross-site and same-site POST/PUT/DELETE. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return false
  return origin === new URL(request.url).origin
}

export async function readJson(request: Request, maxBytes = 16_384): Promise<unknown> {
  const type = request.headers.get('content-type') ?? ''
  if (!type.includes('application/json')) return undefined
  const text = await request.text()
  if (text.length > maxBytes) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

export function clientIp(request: Request): string {
  return request.headers.get('cf-connecting-ip') ?? '0.0.0.0'
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}
