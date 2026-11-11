import type { ContentChange, ContentField, FieldValue } from '@/admin/api/types'
import type { Image } from '@/content/types'

export function displayedValue(field: ContentField, draft: ContentChange | undefined): FieldValue {
  if (draft === undefined) return field.value
  if (draft === null) return field.defaultValue
  if (typeof draft === 'object') {
    const current = field.value as Image
    return { ...current, src: `/media/${draft.mediaId}`, srcSet: `/media/${draft.mediaId}?w=720 720w`, alt: draft.alt }
  }
  return draft
}
