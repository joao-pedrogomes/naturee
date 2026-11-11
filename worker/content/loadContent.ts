import { defaultContent } from '@ssr'
import { applyOverrides, type Overrides } from '../../src/content/overrides'
import type { SiteContent } from '../../src/content/types'
import type { Env } from '../env'

type OverrideRow = { path: string; value: string }

export async function loadOverrides(env: Env): Promise<Overrides> {
  const { results } = await env.DB.prepare('SELECT path, value FROM content_overrides').all<OverrideRow>()
  const overrides: Overrides = {}
  for (const row of results) overrides[row.path] = JSON.parse(row.value)
  return overrides
}

export async function loadContent(env: Env): Promise<SiteContent> {
  return applyOverrides(defaultContent, await loadOverrides(env))
}

const VERSION_MEMO_MS = 30_000
let versionMemo: { value: string; at: number } | undefined

export function rememberContentVersion(value: string): void {
  versionMemo = { value, at: Date.now() }
}

/** Page caches are keyed by this value, so a publish invalidates every colo without purging. */
export async function loadContentVersion(env: Env): Promise<string> {
  if (versionMemo && Date.now() - versionMemo.at < VERSION_MEMO_MS) return versionMemo.value
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'contentVersion'").first<{ value: string }>()
  const value = row?.value ?? '0'
  rememberContentVersion(value)
  return value
}
