import type { ReactNode } from 'react'

const MARKUP_PATTERN = /\*\*([^*]+)\*\*|\*([^*]+)\*/g

/** Turns `**text**` into <strong> and `*text*` into <em>; a lone asterisk stays literal. */
export function renderRichText(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let cursor = 0

  for (const match of text.matchAll(MARKUP_PATTERN)) {
    const start = match.index
    if (start > cursor) nodes.push(text.slice(cursor, start))
    const [, bold, italic] = match
    nodes.push(bold ? <strong key={start}>{bold}</strong> : <em key={start}>{italic}</em>)
    cursor = start + match[0].length
  }

  if (cursor < text.length) nodes.push(text.slice(cursor))
  return nodes
}
