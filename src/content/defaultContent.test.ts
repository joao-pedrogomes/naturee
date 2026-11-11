import { describe, expect, it } from 'vitest'
import { defaultContent } from '@/content/defaultContent'
import type { Image, Link } from '@/content/types'
import { isRoutePath, ROUTES } from '@/routes'

function isImage(value: unknown): value is Image {
  return (
    typeof value === 'object' &&
    value !== null &&
    'src' in value &&
    'alt' in value &&
    'width' in value &&
    'height' in value
  )
}

function collectImages(value: unknown, found: Image[] = []): Image[] {
  if (isImage(value)) {
    found.push(value)
    return found
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectImages(item, found))
    return found
  }
  if (typeof value === 'object' && value !== null) {
    Object.values(value).forEach((item) => collectImages(item, found))
  }
  return found
}

function isValidHref(href: string): boolean {
  return isRoutePath(href) || href.startsWith('http') || href.startsWith('#')
}

function collectHrefs(value: unknown, found: string[] = []): string[] {
  if (Array.isArray(value)) {
    value.forEach((item) => collectHrefs(item, found))
    return found
  }
  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>
    if (typeof record.href === 'string') found.push(record.href)
    Object.values(record).forEach((item) => collectHrefs(item, found))
  }
  return found
}

describe('defaultContent', () => {
  it('gives every image an alt text and dimensions', () => {
    const images = collectImages(defaultContent)
    expect(images.length).toBeGreaterThan(20)
    for (const image of images) {
      expect(image.alt.trim()).not.toBe('')
      expect(image.width).toBeGreaterThan(0)
      expect(image.height).toBeGreaterThan(0)
    }
  })

  it('gives every page SEO metadata', () => {
    for (const route of ROUTES) {
      const page = defaultContent.pages[route.key]
      expect(page.seo.title.trim()).not.toBe('')
      expect(page.seo.description.length).toBeGreaterThan(40)
      expect(page.seo.description.length).toBeLessThanOrEqual(160)
    }
  })

  it('only links to known routes, URLs or sentinels', () => {
    for (const href of collectHrefs(defaultContent)) {
      expect(isValidHref(href), href).toBe(true)
    }
  })

  it('exposes five enabled nav links matching the routes', () => {
    const enabled = defaultContent.nav.filter((link: Link) => link.enabled)
    expect(enabled.map((link) => link.href)).toEqual(ROUTES.map((route) => route.path))
  })

  it('references existing categories from the home page', () => {
    const ids = new Set(defaultContent.categories.map((category) => category.id))
    for (const id of defaultContent.pages.home.categories.ids) {
      expect(ids.has(id), id).toBe(true)
    }
  })
})
