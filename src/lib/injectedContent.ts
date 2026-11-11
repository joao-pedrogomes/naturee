import type { SiteContent } from '@/content/types'

export const INJECTED_CONTENT_ID = 'siteContent'

/** JSON safe to embed inside a script tag: no sequence can close the tag or open a comment. */
export function serializeContent(content: SiteContent): string {
  return JSON.stringify(content).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
}

export function readInjectedContent(doc: Document): SiteContent | undefined {
  const node = doc.getElementById(INJECTED_CONTENT_ID)
  if (!node?.textContent) return undefined
  try {
    return JSON.parse(node.textContent) as SiteContent
  } catch {
    return undefined
  }
}
