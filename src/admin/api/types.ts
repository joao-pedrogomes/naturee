import type { Image } from '@/content/types'

export type SessionUser = { email: string; mustChange: boolean }

export type LeadStatus = 'new' | 'read' | 'archived'

export type Lead = {
  id: number
  name: string
  email: string
  subject: string
  message: string
  status: LeadStatus
  emailedAt: string | null
  createdAt: string
}

export type LeadList = {
  leads: Lead[]
  total: number
  page: number
  pageSize: number
  counts: Record<LeadStatus, number>
}

export type FieldValue = string | boolean | Image

export type ContentField = {
  path: string
  kind: 'text' | 'boolean' | 'image'
  value: FieldValue
  defaultValue: FieldValue
  overridden: boolean
}

export type ContentResponse = { fields: ContentField[]; version: string }

/** `null` restores the default; an image change references an uploaded file. */
export type ContentChange = string | boolean | { mediaId: string; alt: string } | null

export type HistoryEntry = { version: number; createdAt: string; createdBy: string; edits: number }

export type MediaItem = {
  id: string
  width: number
  height: number
  size: number
  alt: string
  createdAt: string
  usedBy: string[]
}

export type AdminSettings = { leadNotifyEmail: string; emailEnabled: boolean; mailConfigured: boolean }

export type PreparedImage = { full: Blob; small: Blob | null; width: number; height: number }
