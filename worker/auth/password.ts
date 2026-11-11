/** workerd rejects PBKDF2 above 100k iterations; the per-record value lets us raise it elsewhere. */
export const PASSWORD_ITERATIONS = 100_000
export const MIN_PASSWORD_LENGTH = 12

export type PasswordRecord = { hash: string; salt: string; iterations: number }

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0))
}

async function derive(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256)
  return new Uint8Array(bits)
}

export function safeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i]
  return diff === 0
}

export async function hashPassword(password: string, iterations = PASSWORD_ITERATIONS): Promise<PasswordRecord> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await derive(password, salt, iterations)
  return { hash: toBase64(hash), salt: toBase64(salt), iterations }
}

export async function verifyPassword(password: string, record: PasswordRecord): Promise<boolean> {
  const candidate = await derive(password, fromBase64(record.salt), record.iterations)
  return safeEqual(candidate, fromBase64(record.hash))
}

export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return 'too_short'
  if (password.length > 200) return 'too_long'
  if (/^(.)\1+$/.test(password)) return 'too_weak'
  return null
}
