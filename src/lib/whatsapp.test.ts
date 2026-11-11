import { describe, expect, it } from 'vitest'
import { buildWhatsAppUrl, normalizePhone, resolveHref } from '@/lib/whatsapp'
import type { SiteInfo } from '@/content/types'

const site = {
  whatsapp: '48 99196 3383',
  catalogPdfUrl: '/catalogoNaturee.pdf',
} as SiteInfo

describe('normalizePhone', () => {
  it('strips formatting and adds the country code to local numbers', () => {
    expect(normalizePhone('48 99196 3383')).toBe('5548991963383')
    expect(normalizePhone('(48) 3333-4444')).toBe('554833334444')
  })

  it('keeps numbers that already carry the country code', () => {
    expect(normalizePhone('+55 48 99196-3383')).toBe('5548991963383')
  })
})

describe('buildWhatsAppUrl', () => {
  it('builds a bare link without a message', () => {
    expect(buildWhatsAppUrl('48 99196 3383')).toBe('https://wa.me/5548991963383')
  })

  it('encodes accents and ampersands in the message', () => {
    const url = buildWhatsAppUrl('48 99196 3383', 'Olá & até logo')
    expect(url).toBe('https://wa.me/5548991963383?text=Ol%C3%A1%20%26%20at%C3%A9%20logo')
  })
})

describe('resolveHref', () => {
  it('treats worker-served files as external so they are not routed in the app', () => {
    expect(resolveHref('/catalogo/0123456789abcdef/catalogo.pdf', site)).toEqual({ href: '/catalogo/0123456789abcdef/catalogo.pdf', external: true })
    expect(resolveHref('/media/0123456789abcdef', site).external).toBe(true)
    expect(resolveHref('/contato', site).external).toBe(false)
  })

  it('resolves the whatsapp sentinel with an optional message', () => {
    expect(resolveHref('#whatsapp', site, 'Oi')).toEqual({
      href: 'https://wa.me/5548991963383?text=Oi',
      external: true,
    })
  })

  it('resolves the catalog sentinel to the PDF', () => {
    expect(resolveHref('#catalog', site)).toEqual({ href: '/catalogoNaturee.pdf', external: true })
  })

  it('marks absolute URLs external and routes internal', () => {
    expect(resolveHref('https://instagram.com/x', site).external).toBe(true)
    expect(resolveHref('/sobre', site)).toEqual({ href: '/sobre', external: false })
  })
})
