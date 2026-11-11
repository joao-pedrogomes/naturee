import { ApiError } from '@/admin/api/adminApi'
import { copy } from '@/admin/copy'

/** Turns the server's `{ path: code }` map into editor-facing sentences. */
export function fieldErrorsFrom(failure: unknown): Record<string, string> {
  if (!(failure instanceof ApiError)) return {}
  const codes = (failure.details as { fields?: Record<string, string> } | undefined)?.fields ?? {}
  return Object.fromEntries(Object.entries(codes).map(([path, code]) => [path, copy.fieldErrors[code] ?? copy.content.failed]))
}
