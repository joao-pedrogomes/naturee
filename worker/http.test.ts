import { describe, expect, it } from 'vitest'
import { clientHash, ipPrefix, readJson, readText } from './http'

describe('ipPrefix', () => {
  it('leaves IPv4 untouched', () => {
    expect(ipPrefix('203.0.113.9')).toBe('203.0.113.9')
  })

  it('keeps only the /64 of IPv6 addresses, expanding ::', () => {
    expect(ipPrefix('2001:db8:1:2:aaaa:bbbb:cccc:dddd')).toBe('2001:db8:1:2')
    expect(ipPrefix('2001:db8:1:2::1')).toBe('2001:db8:1:2')
    expect(ipPrefix('2001:db8::1')).toBe('2001:db8:0:0')
    expect(ipPrefix('2001:0DB8:0001:0002:0:0:0:9')).toBe('2001:db8:1:2')
  })

  it('hashes hosts inside one /64 to the same client', async () => {
    const a = new Request('https://x.test', { headers: { 'cf-connecting-ip': '2001:db8:1:2::1' } })
    const b = new Request('https://x.test', { headers: { 'cf-connecting-ip': '2001:db8:1:2:ffff::2' } })
    const c = new Request('https://x.test', { headers: { 'cf-connecting-ip': '2001:db8:1:3::1' } })
    expect(await clientHash(a)).toBe(await clientHash(b))
    expect(await clientHash(a)).not.toBe(await clientHash(c))
  })
})

describe('readText', () => {
  it('rejects a declared length above the cap without reading', async () => {
    const request = new Request('https://x.test', { method: 'POST', body: 'abc', headers: { 'content-length': '999999' } })
    expect(await readText(request, 100)).toBeUndefined()
  })

  it('stops reading a stream that grows past the cap', async () => {
    const stream = new ReadableStream({
      start(controller) {
        for (let i = 0; i < 10; i += 1) controller.enqueue(new TextEncoder().encode('x'.repeat(50)))
        controller.close()
      },
    })
    const request = new Request('https://x.test', { method: 'POST', body: stream, duplex: 'half' } as RequestInit)
    expect(await readText(request, 120)).toBeUndefined()
  })

  it('reads bodies within the cap and counts bytes, not characters', async () => {
    expect(await readText(new Request('https://x.test', { method: 'POST', body: 'hello' }), 100)).toBe('hello')
    expect(await readText(new Request('https://x.test', { method: 'POST', body: 'ã'.repeat(60) }), 100)).toBeUndefined()
  })

  it('readJson returns undefined for non-JSON content types and bad JSON', async () => {
    const wrongType = new Request('https://x.test', { method: 'POST', body: '{}', headers: { 'content-type': 'text/plain' } })
    expect(await readJson(wrongType)).toBeUndefined()
    const broken = new Request('https://x.test', { method: 'POST', body: '{nope', headers: { 'content-type': 'application/json' } })
    expect(await readJson(broken)).toBeUndefined()
  })
})
