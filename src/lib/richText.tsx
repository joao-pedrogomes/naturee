import type { ReactNode } from 'react'

const MARKUP_PATTERN = /\*\*([^*]+)\*\*|\*([^*]+)\*/g

/** A newline becomes a <br> that only applies on desktop, to reproduce the artboard's line breaks. */
function withBreaks(text: string, keyPrefix: number): ReactNode[] {
  const lines = text.split('\n')
  return lines.flatMap((line, index) => {
    if (index === 0) return [line]
    return [<br key={`${keyPrefix}-${index}`} className="hidden lg:inline" />, line]
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
