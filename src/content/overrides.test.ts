import { describe, expect, it } from 'vitest'
import { defaultContent } from '@/content/defaultContent'
import {
  applyOverrides,
  flattenEditable,
  MAX_TEXT_LENGTH,
  validateOverride,
  type ImageOverride,
} from '@/content/overrides'

const fields = flattenEditable(defaultContent)
const image: ImageOverride = { mediaId: 'abc123', alt: 'Nova foto', width: 1440, height: 700 }

describe('flattenEditable', () => {
  it('lists text, boolean and image leaves with dotted paths', () => {
    const byPath = new Map(fields.map((field) => [field.path, field]))
    expect(byPath.get('pages.home.hero.title')?.kind).toBe('text')
    expect(byPath.get('pages.home.enabled')?.kind).toBe('boolean')
    expect(byPath.get('pages.home.hero.image')?.kind).toBe('image')
    expect(byPath.get('pages.home.features.cards.0.title')?.kind).toBe('text')
  })

  it('skips structural keys that must not be edited', () => {
    const paths = fields.map((field) => field.path)
    expect(paths.some((path) => path.endsWith('.icon') || path.endsWith('.id') || path.endsWith('.ids'))).toBe(false)
    expect(paths).not.toContain('site.url')
    expect(paths).not.toContain('site.ogImage')
  })

  it('only offers fields the site renders', () => {
    const paths = fields.map((field) => field.path)
    expect(paths).toContain('site.email')
    expect(paths.some((path) => /^brands\.\d+\.name$/.test(path))).toBe(false)
  })

  it('does not descend into images', () => {
    expect(fields.some((field) => field.path.endsWith('.image.src'))).toBe(false)
  })
})

describe('applyOverrides', () => {
  it('replaces text and boolean leaves without mutating the base', () => {
    const next = applyOverrides(defaultContent, { 'site.whatsapp': '11 99999 0000', 'pages.about.enabled': false })
    expect(next.site.whatsapp).toBe('11 99999 0000')
    expect(next.pages.about.enabled).toBe(false)
    expect(defaultContent.pages.about.enabled).toBe(true)
  })

  it('turns an image override into a media url with a small variant', () => {
    const next = applyOverrides(defaultContent, { 'pages.home.hero.image': image })
    const hero = next.pages.home.hero.image
    expect(hero.src).toBe('/media/abc123')
    expect(hero.srcSet).toBe('/media/abc123?w=720 720w, /media/abc123 1440w')
    expect(hero.alt).toBe('Nova foto')
    expect(hero.sizes).toBe(defaultContent.pages.home.hero.image.sizes)
  })

  it('skips stale paths and mismatched types', () => {
    const next = applyOverrides(defaultContent, {
      'pages.gone.title': 'x',
      'pages.home.enabled': 'yes',
      'pages.home.hero.title': 42,
    })
    expect(next).toEqual(defaultContent)
  })
})

describe('validateOverride', () => {
  it('accepts matching values', () => {
    expect(validateOverride(fields, 'site.tagline', 'Nova frase')).toBeNull()
    expect(validateOverride(fields, 'pages.home.enabled', true)).toBeNull()
    expect(validateOverride(fields, 'pages.home.hero.image', image)).toBeNull()
  })

  it('rejects unknown paths, wrong types and oversized text', () => {
    expect(validateOverride(fields, 'site.url', 'https://x.com')).toBe('unknown_field')
    expect(validateOverride(fields, 'site.tagline', 5)).toBe('expected_text')
    expect(validateOverride(fields, 'pages.home.enabled', 'no')).toBe('expected_boolean')
    expect(validateOverride(fields, 'pages.home.hero.image', { mediaId: '' })).toBe('expected_image')
    expect(validateOverride(fields, 'pages.home.hero.image', { ...image, alt: 'x'.repeat(301) })).toBe('text_too_long')
    expect(validateOverride(fields, 'site.tagline', 'x'.repeat(MAX_TEXT_LENGTH + 1))).toBe('text_too_long')
  })

  it('only lets links use safe schemes', () => {
    const hrefPath = fields.find((field) => field.path.endsWith('.href'))!.path
    for (const ok of ['/contato', '#whatsapp', 'https://exemplo.com/x', 'mailto:a@b.com']) {
      expect(validateOverride(fields, hrefPath, ok), ok).toBeNull()
    }
    for (const bad of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,x', '//evil.com', 'vbscript:x']) {
      expect(validateOverride(fields, hrefPath, bad), bad).toBe('unsafe_link')
    }
    expect(validateOverride(fields, 'site.instagramUrl', 'javascript:1')).toBe('unsafe_link')
  })

  it('validates phone numbers and hides fields the site never shows', () => {
    expect(validateOverride(fields, 'site.whatsapp', '48 99196-3383')).toBeNull()
    expect(validateOverride(fields, 'site.whatsapp', '123')).toBe('invalid_phone')
    expect(validateOverride(fields, 'site.formWhatsapp', 'abc')).toBe('invalid_phone')
    expect(validateOverride(fields, 'site.email', 'a@b.com')).toBeNull()
    expect(validateOverride(fields, 'site.email', 'sem arroba')).toBe('invalid_email')
  })
})
