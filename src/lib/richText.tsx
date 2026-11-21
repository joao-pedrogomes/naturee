import type { ReactNode } from 'react'

const MARKUP_PATTERN = /\*\*([^*]+)\*\*|\*([^*]+)\*/g

/**
 * A newline becomes a space plus a <br> that only applies on desktop, to reproduce the
 * artboard's line breaks; `||` does the same for phones only (under 640px), where the
 * lines wrap at different words. The space keeps words apart wherever the <br> is hidden.
 */
function withBreaks(text: string, keyPrefix: number): ReactNode[] {
  const parts = text.split(/(\n|\|\|)/)
  return parts.flatMap((part, index) => {
    if (index === 0) return [part]
    if (part === '\n') return [' ', <br key={`${keyPrefix}-${index}`} className="hidden lg:inline" />]
    if (part === '||') return [' ', <br key={`${keyPrefix}-${index}`} className="sm:hidden" />]
    return [part]
  })
}

/**
 * Turns `**text**` into <strong> and `*text*` into <em>; a lone asterisk stays literal.
 * Newlines inside or outside a span become desktop-only line breaks.
 */
export function renderRichText(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let cursor = 0

  for (const match of text.matchAll(MARKUP_PATTERN)) {
    const start = match.index
    if (start > cursor) nodes.push(...withBreaks(text.slice(cursor, start), cursor))
    const [, bold, italic] = match
    nodes.push(bold ? <strong key={start}>{withBreaks(bold, start)}</strong> : <em key={start}>{withBreaks(italic, start)}</em>)
    cursor = start + match[0].length
  }

  if (cursor < text.length) nodes.push(...withBreaks(text.slice(cursor), cursor))
  return nodes
}
