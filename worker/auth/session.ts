import type { Env } from '../env'
import { sha256Hex } from '../http'

export const SESSION_COOKIE = '__Host-naturee_session'
export const SESSION_SECONDS = 12 * 60 * 60

export type AdminSession = { userId: number; email: string; mustChange: boolean; tokenHash: string }

type SessionRow = { user_id: number; email: string; must_change: number }

function toBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function sessionCookie(token: string, maxAge = SESSION_SECONDS): string {
  return `${SESSION_COOKIE}=${token}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Strict`
}

export function clearedSessionCookie(): string {
  return sessionCookie('', 0)
}

export function readSessionToken(request: Request): string | undefined {
  const header = request.headers.get('cookie')
  if (!header) return undefined
  for (const part of header.split(';')) {
    const [name, ...value] = part.trim().split('=')
    if (name === SESSION_COOKIE) return value.join('=') || undefined
  }
  return undefined
}

export async function createSession(env: Env, userId: number, now = Date.now()): Promise<string> {
  const token = toBase64Url(crypto.getRandomValues(new Uint8Array(32)))
  const expiresAt = now + SESSION_SECONDS * 1000
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?1').bind(now),
    env.DB.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?1, ?2, ?3)').bind(
      await sha256Hex(token),
      userId,
      expiresAt,
    ),
  ])
  return token
}

export async function getSession(env: Env, request: Request, now = Date.now()): Promise<AdminSession | null> {
  const token = readSessionToken(request)
  if (!token) return null
  const tokenHash = await sha256Hex(token)
  const row = await env.DB.prepare(
    `SELECT s.user_id, u.email, u.must_change FROM sessions s
     JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?1 AND s.expires_at > ?2`,
  )
    .bind(tokenHash, now)
    .first<SessionRow>()
  if (!row) return null
  return { userId: row.user_id, email: row.email, mustChange: row.must_change === 1, tokenHash }
}

export async function destroySession(env: Env, tokenHash: string): Promise<void> {
  await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?1').bind(tokenHash).run()
}

export async function destroyOtherSessions(env: Env, userId: number, keepTokenHash: string): Promise<void> {
  await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?1 AND token_hash != ?2').bind(userId, keepTokenHash).run()
}
