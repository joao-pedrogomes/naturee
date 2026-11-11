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
    expect(validateOverride(fields, 'site.email', 'a@b.com')).toBeNull()
    expect(validateOverride(fields, 'pages.home.enabled', true)).toBeNull()
    expect(validateOverride(fields, 'pages.home.hero.image', image)).toBeNull()
  })

  it('rejects unknown paths, wrong types and oversized text', () => {
    expect(validateOverride(fields, 'site.url', 'https://x.com')).toBe('unknown field')
    expect(validateOverride(fields, 'site.email', 5)).toBe('expected text')
    expect(validateOverride(fields, 'pages.home.enabled', 'no')).toBe('expected boolean')
    expect(validateOverride(fields, 'pages.home.hero.image', { mediaId: '' })).toBe('expected image reference')
    expect(validateOverride(fields, 'site.email', 'x'.repeat(MAX_TEXT_LENGTH + 1))).toBe('text too long')
  })
})
