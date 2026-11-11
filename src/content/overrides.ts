import type { Image, SiteContent } from '@/content/types'

export type ImageOverride = { mediaId: string; alt: string; width: number; height: number }
export type Overrides = Record<string, unknown>
export type FieldKind = 'text' | 'boolean' | 'image'
export type EditableField = { path: string; kind: FieldKind; value: string | boolean | Image }

export const MAX_TEXT_LENGTH = 2000
export const SMALL_IMAGE_WIDTH = 720

const SKIPPED_KEYS = new Set(['id', 'ids', 'icon', 'url', 'ogImage'])

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

function isImageOverride(value: unknown): value is ImageOverride {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.mediaId === 'string' &&
    candidate.mediaId !== '' &&
    typeof candidate.alt === 'string' &&
    typeof candidate.width === 'number' &&
    typeof candidate.height === 'number'
  )
}

function collect(value: unknown, path: string, out: EditableField[]): void {
  if (isImage(value)) {
    out.push({ path, kind: 'image', value })
    return
  }
  if (typeof value === 'string') {
    out.push({ path, kind: 'text', value })
    return
  }
  if (typeof value === 'boolean') {
    out.push({ path, kind: 'boolean', value })
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collect(item, `${path}.${index}`, out))
    return
  }
  if (typeof value !== 'object' || value === null) return
  for (const [key, child] of Object.entries(value)) {
    if (SKIPPED_KEYS.has(key)) continue
    collect(child, path ? `${path}.${key}` : key, out)
  }
}

/** Every leaf the admin may edit, in document order. */
export function flattenEditable(content: SiteContent): EditableField[] {
  const out: EditableField[] = []
  collect(content, '', out)
  return out
}

export function mediaUrl(mediaId: string, small = false): string {
  return small ? `/media/${mediaId}?w=${SMALL_IMAGE_WIDTH}` : `/media/${mediaId}`
}

export function imageFromOverride(override: ImageOverride, current: Image): Image {
  const small = SMALL_IMAGE_WIDTH < override.width
  return {
    src: mediaUrl(override.mediaId),
    srcSet: small
      ? `${mediaUrl(override.mediaId, true)} ${SMALL_IMAGE_WIDTH}w, ${mediaUrl(override.mediaId)} ${override.width}w`
      : undefined,
    sizes: current.sizes,
    alt: override.alt,
    width: override.width,
    height: override.height,
  }
}

const LINK_PATH = /(^|\.)(href|instagramUrl|catalogPdfUrl)$/
const SAFE_LINK = /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i
const PHONE_PATH = /^site\.(whatsapp|formWhatsapp)$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function textProblem(path: string, value: string): string | null {
  if (value.length > MAX_TEXT_LENGTH) return 'text too long'
  if (LINK_PATH.test(path) && !SAFE_LINK.test(value.trim())) return 'unsafe link'
  if (PHONE_PATH.test(path) && !/^\d{10,13}$/.test(value.replace(/\D/g, ''))) return 'invalid phone'
  if (path === 'site.email' && !EMAIL_PATTERN.test(value.trim())) return 'invalid email'
  return null
}

/** Returns an error message, or null when the value fits the field at `path`. */
export function validateOverride(fields: EditableField[], path: string, value: unknown): string | null {
  const field = fields.find((candidate) => candidate.path === path)
  if (!field) return 'unknown field'
  if (field.kind === 'boolean') return typeof value === 'boolean' ? null : 'expected boolean'
  if (field.kind === 'image') return isImageOverride(value) ? null : 'expected image reference'
  if (typeof value !== 'string') return 'expected text'
  return textProblem(path, value)
}

function walkTo(root: unknown, segments: string[]): { parent: Record<string, unknown>; key: string } | null {
  let cursor = root
  for (const segment of segments.slice(0, -1)) {
    if (typeof cursor !== 'object' || cursor === null) return null
    cursor = (cursor as Record<string, unknown>)[segment]
  }
  if (typeof cursor !== 'object' || cursor === null) return null
  return { parent: cursor as Record<string, unknown>, key: segments[segments.length - 1] }
}

/**
 * Overrides whose path no longer exists or whose type no longer matches are skipped,
 * so a new build never breaks because of an old edit.
 */
export function applyOverrides(base: SiteContent, overrides: Overrides): SiteContent {
  const content = structuredClone(base)
  for (const [path, value] of Object.entries(overrides)) {
    const target = walkTo(content, path.split('.'))
    if (!target) continue
    const current = target.parent[target.key]
    if (isImage(current) && isImageOverride(value)) {
      target.parent[target.key] = imageFromOverride(value, current)
      continue
    }
    if (typeof current === 'string' && typeof value === 'string') target.parent[target.key] = value
    if (typeof current === 'boolean' && typeof value === 'boolean') target.parent[target.key] = value
  }
  return content
}
