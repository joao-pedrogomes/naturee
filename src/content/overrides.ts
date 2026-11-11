import type { Image, SiteContent } from '@/content/types'

/** An uploaded picture. */
export type MediaImageOverride = { mediaId: string; alt: string; width: number; height: number }
/** One of the pictures that ship with the site, named by the path where the default content uses it. */
export type BuiltinImageOverride = { ref: string; alt: string }
export type ImageOverride = MediaImageOverride | BuiltinImageOverride
export type BuiltinImage = { ref: string; image: Image; paths: string[] }
export type Overrides = Record<string, unknown>
export type FieldKind = 'text' | 'boolean' | 'image'
export type EditableField = { path: string; kind: FieldKind; value: string | boolean | Image }

export const MAX_TEXT_LENGTH = 2000
export const SMALL_IMAGE_WIDTH = 720

const SKIPPED_KEYS = new Set(['id', 'ids', 'icon', 'url', 'ogImage'])
/** Editable in the data model but never shown on the site, so the admin would mislead. */
const SKIPPED_PATH = /^(site\.email|brands\.\d+\.name)$/
export const MAX_ALT_LENGTH = 300

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

function isBuiltinOverride(value: unknown): value is BuiltinImageOverride {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.ref === 'string' && candidate.ref !== '' && typeof candidate.alt === 'string'
}

function isMediaOverride(value: unknown): value is MediaImageOverride {
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
    const childPath = path ? `${path}.${key}` : key
    if (!SKIPPED_PATH.test(childPath)) collect(child, childPath, out)
  }
}

/** Every leaf the admin may edit, in document order. */
export function flattenEditable(content: SiteContent): EditableField[] {
  const out: EditableField[] = []
  collect(content, '', out)
  return out
}

function isImageOverride(value: unknown): value is ImageOverride {
  return isMediaOverride(value) || isBuiltinOverride(value)
}

/** The distinct pictures of the default content, each with every place that uses it. */
export function builtinImages(content: SiteContent): BuiltinImage[] {
  const bySource = new Map<string, BuiltinImage>()
  for (const field of flattenEditable(content)) {
    if (field.kind !== 'image') continue
    const image = field.value as Image
    const known = bySource.get(image.src)
    if (known) known.paths.push(field.path)
    else bySource.set(image.src, { ref: field.path, image, paths: [field.path] })
  }
  return [...bySource.values()]
}

export function mediaUrl(mediaId: string, small = false): string {
  return small ? `/media/${mediaId}?w=${SMALL_IMAGE_WIDTH}` : `/media/${mediaId}`
}

export function imageFromOverride(override: MediaImageOverride, current: Image): Image {
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

function textProblem(path: string, value: string): string | null {
  if (value.length > MAX_TEXT_LENGTH) return 'text_too_long'
  if (LINK_PATH.test(path) && !SAFE_LINK.test(value.trim())) return 'unsafe_link'
  if (PHONE_PATH.test(path) && !/^\d{10,13}$/.test(value.replace(/\D/g, ''))) return 'invalid_phone'
  return null
}

/** Returns an error message, or null when the value fits the field at `path`. */
export function validateOverride(fields: EditableField[], path: string, value: unknown): string | null {
  const field = fields.find((candidate) => candidate.path === path)
  if (!field) return 'unknown_field'
  if (field.kind === 'boolean') return typeof value === 'boolean' ? null : 'expected_boolean'
  if (field.kind === 'image') {
    if (!isImageOverride(value)) return 'expected_image'
    if (value.alt.length > MAX_ALT_LENGTH) return 'text_too_long'
    if ('ref' in value && !fields.some((candidate) => candidate.kind === 'image' && candidate.path === value.ref)) return 'unknown_image'
    return null
  }
  if (typeof value !== 'string') return 'expected_text'
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
    if (isImage(current) && isMediaOverride(value)) {
      target.parent[target.key] = imageFromOverride(value, current)
      continue
    }
    if (isImage(current) && isBuiltinOverride(value)) {
      const source = walkTo(base, value.ref.split('.'))?.parent[value.ref.split('.').at(-1) as string]
      if (isImage(source)) target.parent[target.key] = { ...source, sizes: current.sizes, alt: value.alt }
      continue
    }
    if (typeof current === 'string' && typeof value === 'string') target.parent[target.key] = value
    if (typeof current === 'boolean' && typeof value === 'boolean') target.parent[target.key] = value
  }
  return content
}
