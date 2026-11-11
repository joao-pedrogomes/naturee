import { describe, expect, it } from 'vitest'
import { hashPassword, passwordProblem, safeEqual, verifyPassword } from './password'

describe('password hashing', () => {
  it('verifies the right password and rejects a wrong one', async () => {
    const record = await hashPassword('correct horse battery', 1000)
    expect(await verifyPassword('correct horse battery', record)).toBe(true)
    expect(await verifyPassword('correct horse batterz', record)).toBe(false)
  })

  it('uses a fresh salt every time', async () => {
    const a = await hashPassword('same password here', 1000)
    const b = await hashPassword('same password here', 1000)
    expect(a.salt).not.toBe(b.salt)
    expect(a.hash).not.toBe(b.hash)
  })

  it('honours the stored iteration count', async () => {
    const record = await hashPassword('another password 1', 1000)
    expect(await verifyPassword('another password 1', { ...record, iterations: 2000 })).toBe(false)
  })

  it('compares bytes of equal length only when identical', () => {
    expect(safeEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2]))).toBe(true)
    expect(safeEqual(new Uint8Array([1, 2]), new Uint8Array([1, 3]))).toBe(false)
    expect(safeEqual(new Uint8Array([1]), new Uint8Array([1, 2]))).toBe(false)
  })

  it('flags short and trivial passwords', () => {
    expect(passwordProblem('short')).toBe('too_short')
    expect(passwordProblem('aaaaaaaaaaaaaaaa')).toBe('too_weak')
    expect(passwordProblem('x'.repeat(201))).toBe('too_long')
    expect(passwordProblem('a decent passphrase')).toBeNull()
  })
})
