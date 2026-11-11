import { defaultContent } from '@ssr'
import { applyOverrides, flattenEditable, validateOverride, type ImageOverride, type Overrides } from '../../src/content/overrides'
import { loadContentVersion, loadOverrides, rememberContentVersion } from '../content/loadContent'
import type { AdminSession } from '../auth/session'
import type { Env } from '../env'
import { error, json, readJson } from '../http'

const HISTORY_LIMIT = 20
const MAX_CHANGES = 300

type MediaRow = { id: string; width: number; height: number }

async function mediaDimensions(env: Env, ids: string[]): Promise<Map<string, MediaRow>> {
  const found = new Map<string, MediaRow>()
  for (const id of ids) {
    const row = await env.DB.prepare('SELECT id, width, height FROM media WHERE id = ?1').bind(id).first<MediaRow>()
    if (row) found.set(id, row)
  }
  return found
}

async function read(env: Env): Promise<Response> {
  const overrides = await loadOverrides(env)
  const defaults = new Map(flattenEditable(defaultContent).map((field) => [field.path, field.value]))
  const fields = flattenEditable(applyOverrides(defaultContent, overrides)).map((field) => ({
    path: field.path,
    kind: field.kind,
    value: field.value,
    defaultValue: defaults.get(field.path),
    overridden: field.path in overrides,
  }))
  return json({ fields, version: await loadContentVersion(env, true) })
}

function historyStatements(env: Env, overrides: Overrides, email: string): D1PreparedStatement[] {
  return [
    env.DB.prepare('INSERT INTO content_history (json, created_by) VALUES (?1, ?2)').bind(JSON.stringify(overrides), email),
    env.DB.prepare(
      `DELETE FROM content_history WHERE version NOT IN (SELECT version FROM content_history ORDER BY version DESC LIMIT ${HISTORY_LIMIT})`,
    ),
  ]
}

async function bumpVersion(env: Env): Promise<{ statement: D1PreparedStatement; next: string }> {
  const next = String(Number(await loadContentVersion(env, true)) + 1)
  const statement = env.DB.prepare(
    "INSERT INTO settings (key, value) VALUES ('contentVersion', ?1) ON CONFLICT(key) DO UPDATE SET value = ?1",
  ).bind(next)
  return { statement, next }
}

async function write(request: Request, env: Env, session: AdminSession): Promise<Response> {
  const body = (await readJson(request, 262_144)) as { changes?: Record<string, unknown> } | undefined
  const changes = body?.changes
  if (!changes || typeof changes !== 'object' || Array.isArray(changes)) return error(400, 'invalid_body')
  const entries = Object.entries(changes)
  if (entries.length === 0 || entries.length > MAX_CHANGES) return error(400, 'invalid_body')

  const fields = flattenEditable(defaultContent)
  const imageIds = entries.flatMap(([, value]) => (isImageValue(value) ? [value.mediaId] : []))
  const media = await mediaDimensions(env, imageIds)

  const invalid: Record<string, string> = {}
  const statements: D1PreparedStatement[] = []
  const current = await loadOverrides(env)

  for (const [path, value] of entries) {
    if (value === null) {
      if (!fields.some((field) => field.path === path)) invalid[path] = 'unknown field'
      else statements.push(env.DB.prepare('DELETE FROM content_overrides WHERE path = ?1').bind(path))
      continue
    }
    let stored = value
    if (isImageValue(value)) {
      const row = media.get(value.mediaId)
      if (!row) {
        invalid[path] = 'unknown media'
        continue
      }
      stored = { mediaId: row.id, alt: value.alt, width: row.width, height: row.height } satisfies ImageOverride
    }
    const problem = validateOverride(fields, path, stored)
    if (problem) {
      invalid[path] = problem
      continue
    }
    statements.push(
      env.DB.prepare(
        `INSERT INTO content_overrides (path, value, updated_by) VALUES (?1, ?2, ?3)
         ON CONFLICT(path) DO UPDATE SET value = ?2, updated_by = ?3, updated_at = datetime('now')`,
      ).bind(path, JSON.stringify(stored), session.email),
    )
  }
  if (Object.keys(invalid).length > 0) return json({ error: 'invalid_changes', fields: invalid }, 422)

  const bump = await bumpVersion(env)
  await env.DB.batch([...historyStatements(env, current, session.email), ...statements, bump.statement])
  rememberContentVersion(bump.next)
  return json({ ok: true, version: bump.next })
}

function isImageValue(value: unknown): value is { mediaId: string; alt: string } {
  return typeof value === 'object' && value !== null && typeof (value as { mediaId?: unknown }).mediaId === 'string'
}

async function history(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    'SELECT version, created_at, created_by, json FROM content_history ORDER BY version DESC',
  ).all<{ version: number; created_at: string; created_by: string; json: string }>()
  return json({
    history: results.map((row) => ({
      version: row.version,
      createdAt: row.created_at,
      createdBy: row.created_by,
      edits: Object.keys(JSON.parse(row.json) as Overrides).length,
    })),
  })
}

async function restore(request: Request, env: Env, session: AdminSession): Promise<Response> {
  const body = (await readJson(request)) as { version?: unknown } | undefined
  if (typeof body?.version !== 'number') return error(400, 'invalid_body')
  const row = await env.DB.prepare('SELECT json FROM content_history WHERE version = ?1').bind(body.version).first<{ json: string }>()
  if (!row) return error(404, 'not_found')

  const snapshot = JSON.parse(row.json) as Overrides
  const ids = Object.values(snapshot).flatMap((value) => (isImageValue(value) ? [value.mediaId] : []))
  const media = await mediaDimensions(env, ids)
  const fields = flattenEditable(defaultContent)
  const current = await loadOverrides(env)

  const inserts: D1PreparedStatement[] = []
  for (const [path, value] of Object.entries(snapshot)) {
    if (isImageValue(value) && !media.has(value.mediaId)) continue
    if (validateOverride(fields, path, value) !== null) continue
    inserts.push(
      env.DB.prepare('INSERT INTO content_overrides (path, value, updated_by) VALUES (?1, ?2, ?3)').bind(
        path,
        JSON.stringify(value),
        session.email,
      ),
    )
  }
  const bump = await bumpVersion(env)
  await env.DB.batch([
    ...historyStatements(env, current, session.email),
    env.DB.prepare('DELETE FROM content_overrides'),
    ...inserts,
    bump.statement,
  ])
  rememberContentVersion(bump.next)
  return json({ ok: true, version: bump.next })
}

export async function handleContent(
  request: Request,
  env: Env,
  pathname: string,
  session: AdminSession,
): Promise<Response | undefined> {
  if (pathname === '/api/admin/content') {
    if (request.method === 'GET') return read(env)
    if (request.method === 'PUT') return write(request, env, session)
    return error(405, 'method_not_allowed')
  }
  if (pathname === '/api/admin/content/history' && request.method === 'GET') return history(env)
  if (pathname === '/api/admin/content/restore' && request.method === 'POST') return restore(request, env, session)
  return undefined
}
