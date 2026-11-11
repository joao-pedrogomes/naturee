const DEFAULT_LINE_LIMIT = 48

/**
 * Desktop layouts hold short copy on one line. Longer text without an explicit line break
 * is allowed to wrap so an edit can never push content out of its box.
 */
export function holdLine(text: string, limit = DEFAULT_LINE_LIMIT): string {
  return text.includes('\n') || text.length <= limit ? 'lg:whitespace-nowrap' : ''
}
