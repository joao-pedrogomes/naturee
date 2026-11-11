import worker from '../index'
import { hashPassword } from '../auth/password'
import { createTestEnv, testContext } from './fakeD1'

export const ORIGIN = 'https://natureefoodhub.com.br'

export type TestEnv = ReturnType<typeof createTestEnv>

export async function adminEnv(): Promise<{ env: TestEnv; cookie: string }> {
  const env = createTestEnv()
  const record = await hashPassword('a very long secret 42', 1000)
  await env.DB.prepare('INSERT INTO users (email, password_hash, salt, iterations, must_change) VALUES (?1, ?2, ?3, ?4, 0)')
    .bind('admin@exemplo.com', record.hash, record.salt, record.iterations)
    .run()
  const login = await call(env, 'POST', '/api/admin/login', { email: 'admin@exemplo.com', password: 'a very long secret 42' })
  return { env, cookie: (login.headers.get('set-cookie') ?? '').split(';')[0] }
}

export function call(
  env: TestEnv,
  method: string,
  path: string,
  body?: unknown,
  headers: Record<string, string> = {},
): Promise<Response> {
  const isForm = body instanceof FormData
  const request = new Request(`${ORIGIN}${path}`, {
    method,
    headers: {
      origin: ORIGIN,
      'cf-connecting-ip': '8.8.8.8',
      ...(body === undefined || isForm ? {} : { 'content-type': 'application/json' }),
      ...headers,
    },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  })
  return worker.fetch(request, env, testContext())
}

export function webpBlob(size = 64): Blob {
  const bytes = new Uint8Array(size)
  bytes.set(new TextEncoder().encode('RIFF'), 0)
  bytes.set(new TextEncoder().encode('WEBP'), 8)
  return new Blob([bytes], { type: 'image/webp' })
}
