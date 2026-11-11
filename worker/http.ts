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

/** Reads at most `maxBytes`; a larger or oversized-chunked body yields undefined without buffering it all. */
export async function readText(request: Request, maxBytes: number): Promise<string | undefined> {
  const declared = Number(request.headers.get('content-length'))
  if (Number.isFinite(declared) && declared > maxBytes) return undefined
  const reader = request.body?.getReader()
  if (!reader) return ''
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > maxBytes) {
      await reader.cancel()
      return undefined
    }
    chunks.push(value)
  }
  const bytes = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder().decode(bytes)
}

export async function readJson(request: Request, maxBytes = 16_384): Promise<unknown> {
  const type = request.headers.get('content-type') ?? ''
  if (!type.includes('application/json')) return undefined
  const text = await readText(request, maxBytes)
  if (text === undefined) return undefined
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

/** Groups IPv6 addresses by their /64 so rotating the host part does not reset a limit. */
export function ipPrefix(ip: string): string {
  if (!ip.includes(':')) return ip
  const [head, tail = ''] = ip.split('::')
  const headParts = head ? head.split(':') : []
  const tailParts = tail ? tail.split(':') : []
  const gap = ip.includes('::') ? Array<string>(Math.max(0, 8 - headParts.length - tailParts.length)).fill('0') : []
  return [...headParts, ...gap, ...tailParts]
    .slice(0, 4)
    .map((group) => group.toLowerCase().replace(/^0+(?=.)/, ''))
    .join(':')
}

export async function clientHash(request: Request, pepper = 'dev'): Promise<string> {
  return (await sha256Hex(`${ipPrefix(clientIp(request))}:${pepper}`)).slice(0, 32)
}
