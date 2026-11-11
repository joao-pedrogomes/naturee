import type { Env } from '../env'
import { error, json, readJson } from '../http'

const PAGE_SIZE = 50
const STATUSES = ['new', 'read', 'archived'] as const
type LeadStatus = (typeof STATUSES)[number]

type LeadRow = {
  id: number
  name: string
  email: string
  subject: string
  message: string
  status: LeadStatus
  emailed_at: string | null
  created_at: string
}

function isStatus(value: unknown): value is LeadStatus {
  return typeof value === 'string' && (STATUSES as readonly string[]).includes(value)
}

function toLead(row: LeadRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    status: row.status,
    emailedAt: row.emailed_at,
    createdAt: row.created_at,
  }
}

function likePattern(term: string): string {
  return `%${term.replace(/[\\%_]/g, '\\$&')}%`
}

async function list(url: URL, env: Env): Promise<Response> {
  const status = url.searchParams.get('status')
  const term = (url.searchParams.get('q') ?? '').trim().slice(0, 100)
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)

  const where: string[] = []
  const params: unknown[] = []
  if (isStatus(status)) {
    where.push('status = ?')
    params.push(status)
  }
  if (term) {
    where.push("(name LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\' OR subject LIKE ? ESCAPE '\\')")
    params.push(likePattern(term), likePattern(term), likePattern(term))
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const rows = await env.DB.prepare(`SELECT * FROM leads ${clause} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`)
    .bind(...params, PAGE_SIZE, (page - 1) * PAGE_SIZE)
    .all<LeadRow>()
  const total = await env.DB.prepare(`SELECT COUNT(*) AS n FROM leads ${clause}`).bind(...params).first<{ n: number }>()
  const grouped = await env.DB.prepare('SELECT status, COUNT(*) AS n FROM leads GROUP BY status').all<{ status: LeadStatus; n: number }>()

  const counts = { new: 0, read: 0, archived: 0 }
  for (const row of grouped.results) counts[row.status] = row.n
  return json({ leads: rows.results.map(toLead), total: total?.n ?? 0, page, pageSize: PAGE_SIZE, counts })
}

function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return `"${safe.replace(/"/g, '""')}"`
}

async function exportCsv(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare('SELECT * FROM leads ORDER BY created_at DESC, id DESC').all<LeadRow>()
  const header = ['Data', 'Nome', 'E-mail', 'Assunto', 'Mensagem', 'Status']
  const lines = results.map((row) =>
    [row.created_at, row.name, row.email, row.subject, row.message, row.status].map(csvCell).join(','),
  )
  return new Response(`﻿${[header.map(csvCell).join(','), ...lines].join('\r\n')}\r\n`, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="leads-naturee.csv"',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  })
}

async function update(request: Request, env: Env, id: number): Promise<Response> {
  const body = (await readJson(request)) as { status?: unknown } | undefined
  if (!isStatus(body?.status)) return error(400, 'invalid_status')
  const result = await env.DB.prepare('UPDATE leads SET status = ?1 WHERE id = ?2').bind(body.status, id).run()
  return result.meta.changes === 0 ? error(404, 'not_found') : json({ ok: true })
}

async function remove(env: Env, id: number): Promise<Response> {
  const result = await env.DB.prepare('DELETE FROM leads WHERE id = ?1').bind(id).run()
  return result.meta.changes === 0 ? error(404, 'not_found') : json({ ok: true })
}

export async function handleLeads(request: Request, env: Env, pathname: string): Promise<Response | undefined> {
  if (pathname === '/api/admin/leads' && request.method === 'GET') return list(new URL(request.url), env)
  if (pathname === '/api/admin/leads.csv' && request.method === 'GET') return exportCsv(env)

  const match = /^\/api\/admin\/leads\/(\d+)$/.exec(pathname)
  if (!match) return undefined
  const id = Number(match[1])
  if (request.method === 'PATCH') return update(request, env, id)
  if (request.method === 'DELETE') return remove(env, id)
  return error(405, 'method_not_allowed')
}
