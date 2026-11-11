import { defaultContent } from '@ssr'
import { applyOverrides, flattenEditable, validateOverride, type ImageOverride, type Overrides } from '../../src/content/overrides'
import { loadContentVersion, loadOverrides, rememberContentVersion } from '../content/loadContent'
import type { AdminSession } from '../auth/session'
import type { Env } from '../env'
import { error, json, readJson } from '../http'

const HISTORY_LIMIT = 20
const MAX_CHANGES = 300

type MediaRow = { id: string; width: number; height: number }
type StoredRow = { p: string; v: string }

/** One statement per kind keeps every save far below D1's per-invocation query limit. */
const UPSERT_SQL = `INSERT INTO content_overrides (path, value, updated_by)
  SELECT json_extract(value, '$.p'), json_extract(value, '$.v'), ?2 FROM json_each(?1) WHERE true
  ON CONFLICT(path) DO UPDATE SET value = excluded.value, updated_by = excluded.updated_by, updated_at = datetime('now')`

function isImageValue(value: unknown): value is { mediaId: string; alt: string } {
  return typeof value === 'object' && value !== null && typeof (value as { mediaId?: unknown }).mediaId === 'string'
}

async function mediaDimensions(env: Env, ids: string[]): Promise<Map<string, MediaRow>> {
  if (ids.length === 0) return new Map()
  const { results } = await env.DB.prepare('SELECT id, width, height FROM media WHERE id IN (SELECT value FROM json_each(?1))')
    .bind(JSON.stringify(ids))
    .all<MediaRow>()
  return new Map(results.map((row) => [row.id, row]))
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

/** Incremented inside the same batch, so concurrent saves can never share a version. */
function bumpVersionStatement(env: Env): D1PreparedStatement {
  return env.DB.prepare(
    `INSERT INTO settings (key, value) VALUES ('contentVersion', '1')
     ON CONFLICT(key) DO UPDATE SET value = CAST(value AS INTEGER) + 1`,
  )
}

async function publish(env: Env, statements: D1PreparedStatement[]): Promise<string> {
  await env.DB.batch([...statements, bumpVersionStatement(env)])
  const version = await loadContentVersion(env, true)
  rememberContentVersion(version)
  return version
}

function upsertStatement(env: Env, rows: StoredRow[], email: string): D1PreparedStatement[] {
  if (rows.length === 0) return []
  return [env.DB.prepare(UPSERT_SQL).bind(JSON.stringify(rows), email)]
}

async function write(request: Request, env: Env, session: AdminSession): Promise<Response> {
  const body = (await readJson(request, 262_144)) as { changes?: Record<string, unknown> } | undefined
  const changes = body?.changes
  if (!changes || typeof changes !== 'object' || Array.isArray(changes)) return error(400, 'invalid_body')
  const entries = Object.entries(changes)
  if (entries.length === 0 || entries.length > MAX_CHANGES) return error(400, 'invalid_body')

  const fields = flattenEditable(defaultContent)
  const media = await mediaDimensions(
    env,
    entries.flatMap(([, value]) => (isImageValue(value) ? [value.mediaId] : [])),
  )

  const invalid: Record<string, string> = {}
  const rows: StoredRow[] = []
  const removals: string[] = []

  for (const [path, value] of entries) {
    if (value === null) {
      if (fields.some((field) => field.path === path)) removals.push(path)
      else invalid[path] = 'unknown_field'
      continue
    }
    let stored = value
    if (isImageValue(value)) {
      const row = media.get(value.mediaId)
      if (!row) {
        invalid[path] = 'unknown_media'
        continue
      }
      stored = { mediaId: row.id, alt: value.alt, width: row.width, height: row.height } satisfies ImageOverride
    }
    const problem = validateOverride(fields, path, stored)
    if (problem) invalid[path] = problem
    else rows.push({ p: path, v: JSON.stringify(stored) })
  }
  if (Object.keys(invalid).length > 0) return json({ error: 'invalid_changes', fields: invalid }, 422)

  const current = await loadOverrides(env)
  const statements = [...historyStatements(env, current, session.email), ...upsertStatement(env, rows, session.email)]
  if (removals.length > 0) {
    statements.push(
      env.DB.prepare('DELETE FROM content_overrides WHERE path IN (SELECT value FROM json_each(?1))').bind(JSON.stringify(removals)),
    )
  }
  return json({ ok: true, version: await publish(env, statements) })
}

function countEdits(snapshot: string): number {
  try {
    return Object.keys(JSON.parse(snapshot) as Overrides).length
  } catch {
    return 0
  }
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
      edits: countEdits(row.json),
    })),
  })
}

async function restore(request: Request, env: Env, session: AdminSession): Promise<Response> {
  const body = (await readJson(request)) as { version?: unknown } | undefined
  if (typeof body?.version !== 'number') return error(400, 'invalid_body')
  const row = await env.DB.prepare('SELECT json FROM content_history WHERE version = ?1').bind(body.version).first<{ json: string }>()
  if (!row) return error(404, 'not_found')

  const snapshot = JSON.parse(row.json) as Overrides
  const media = await mediaDimensions(
    env,
    Object.values(snapshot).flatMap((value) => (isImageValue(value) ? [value.mediaId] : [])),
  )
  const fields = flattenEditable(defaultContent)
  const rows: StoredRow[] = []
  let skipped = 0
  for (const [path, value] of Object.entries(snapshot)) {
    if ((isImageValue(value) && !media.has(value.mediaId)) || validateOverride(fields, path, value) !== null) {
      skipped += 1
      continue
    }
    rows.push({ p: path, v: JSON.stringify(value) })
  }

  const current = await loadOverrides(env)
  const statements = [
    ...historyStatements(env, current, session.email),
    env.DB.prepare('DELETE FROM content_overrides'),
    ...upsertStatement(env, rows, session.email),
  ]
  return json({ ok: true, version: await publish(env, statements), skipped })
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
