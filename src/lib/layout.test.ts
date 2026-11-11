import { describe, expect, it } from 'vitest'
import { holdLine } from '@/lib/layout'

describe('holdLine', () => {
  it('keeps short copy on one line at desktop', () => {
    expect(holdLine('Uma frase curta')).toBe('lg:whitespace-nowrap')
  })

  it('keeps hand-broken copy on its authored lines', () => {
    expect(holdLine(`${'x'.repeat(80)}\nsegunda linha`)).toBe('lg:whitespace-nowrap')
  })

  it('lets long unbroken copy wrap', () => {
    expect(holdLine('x '.repeat(40))).toBe('')
  })
})
