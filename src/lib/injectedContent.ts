import type { SiteContent } from '@/content/types'
import { INJECTED_CONTENT_ID } from '@/lib/serializeContent'

export function readInjectedContent(doc: Document): SiteContent | undefined {
  const node = doc.getElementById(INJECTED_CONTENT_ID)
  if (!node?.textContent) return undefined
  try {
    return JSON.parse(node.textContent) as SiteContent
  } catch {
    return undefined
  }
}
