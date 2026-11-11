import type {
  AdminSettings,
  AdminUser,
  TemporaryAccess,
  ContentChange,
  ContentResponse,
  HistoryEntry,
  LeadList,
  LeadStatus,
  MediaItem,
  PreparedImage,
  SessionUser,
} from '@/admin/api/types'

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: unknown

  constructor(status: number, code: string, details?: unknown) {
    super(code)
    this.status = status
    this.code = code
    this.details = details
  }
}

type UnauthorizedHandler = () => void

let onUnauthorized: UnauthorizedHandler | undefined

/** Lets the session provider react when the server says the session is gone. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | undefined): void {
  onUnauthorized = handler
}

const AUTH_PATHS = ['/api/admin/login', '/api/admin/me', '/api/admin/logout']

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const isForm = body instanceof FormData
  const response = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: body === undefined || isForm ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  })
  const payload = (await response.json().catch(() => ({}))) as { error?: string }
  if (response.status === 401 && !AUTH_PATHS.includes(path)) onUnauthorized?.()
  if (!response.ok) throw new ApiError(response.status, payload.error ?? 'request_failed', payload)
  return payload as T
}

function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }
  const text = search.toString()
  return text ? `?${text}` : ''
}

export const adminApi = {
  me: () => request<SessionUser>('GET', '/api/admin/me'),
  login: (email: string, password: string) => request<SessionUser>('POST', '/api/admin/login', { email, password }),
  logout: () => request<{ ok: true }>('POST', '/api/admin/logout', {}),
  changePassword: (current: string, next: string) => request<{ ok: true }>('POST', '/api/admin/password', { current, next }),

  listLeads: (params: { status?: LeadStatus; q?: string; page?: number }) =>
    request<LeadList>('GET', `/api/admin/leads${query(params)}`),
  updateLead: (id: number, status: LeadStatus) => request<{ ok: true }>('PATCH', `/api/admin/leads/${id}`, { status }),
  deleteLead: (id: number) => request<{ ok: true }>('DELETE', `/api/admin/leads/${id}`),

  readContent: () => request<ContentResponse>('GET', '/api/admin/content'),
  saveContent: (changes: Record<string, ContentChange>) =>
    request<{ ok: true; version: string }>('PUT', '/api/admin/content', { changes }),
  contentHistory: () => request<{ history: HistoryEntry[] }>('GET', '/api/admin/content/history'),
  restoreContent: (version: number) => request<{ ok: true; skipped: number }>('POST', '/api/admin/content/restore', { version }),

  readSettings: () => request<AdminSettings>('GET', '/api/admin/settings'),
  saveSettings: (settings: Pick<AdminSettings, 'leadNotifyEmail' | 'emailEnabled'>) =>
    request<{ ok: true }>('PUT', '/api/admin/settings', settings),

  listUsers: () => request<{ users: AdminUser[] }>('GET', '/api/admin/users'),
  createUser: (email: string) => request<TemporaryAccess & { id: number }>('POST', '/api/admin/users', { email }),
  resetUser: (id: number) => request<TemporaryAccess>('POST', `/api/admin/users/${id}/reset`, {}),
  deleteUser: (id: number) => request<{ ok: true }>('DELETE', `/api/admin/users/${id}`),

  listMedia: () => request<{ media: MediaItem[] }>('GET', '/api/admin/media'),
  uploadMedia: (image: PreparedImage, alt: string) => {
    const form = new FormData()
    form.set('file', image.full, 'image.webp')
    if (image.small) form.set('small', image.small, 'small.webp')
    form.set('width', String(image.width))
    form.set('height', String(image.height))
    form.set('alt', alt)
    return request<MediaItem>('POST', '/api/admin/media', form)
  },
  deleteMedia: (id: string) => request<{ ok: true }>('DELETE', `/api/admin/media/${id}`),
}
