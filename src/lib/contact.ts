import type { ContactFieldKey } from '@/content/types'

export type ContactFields = Record<ContactFieldKey, string>
export type ContactErrorKind = 'required' | 'email' | 'tooLong'
export type ContactErrors = Partial<Record<ContactFieldKey, ContactErrorKind>>
export type SubmitStatus = 'saved' | 'skipped' | 'failed'
export type SubmitResult = { status: SubmitStatus }

export const CONTACT_LIMITS: Record<ContactFieldKey, number> = {
  name: 120,
  email: 160,
  subject: 120,
  message: 2000,
}

export const CONTACT_FIELD_ORDER: ContactFieldKey[] = ['name', 'email', 'subject', 'message']

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const EMPTY_CONTACT: ContactFields = { name: '', email: '', subject: '', message: '' }

function validateField(key: ContactFieldKey, value: string): ContactErrorKind | undefined {
  const trimmed = value.trim()
  if (!trimmed) return 'required'
  if (trimmed.length > CONTACT_LIMITS[key]) return 'tooLong'
  if (key === 'email' && !EMAIL_PATTERN.test(trimmed)) return 'email'
  return undefined
}

export function validateContact(fields: ContactFields): ContactErrors {
  const errors: ContactErrors = {}
  for (const key of CONTACT_FIELD_ORDER) {
    const error = validateField(key, fields[key])
    if (error) errors[key] = error
  }
  return errors
}

export function buildContactMessage(fields: ContactFields): string {
  return [
    `Olá, Naturee! Meu nome é ${fields.name.trim()}.`,
    `Assunto: ${fields.subject.trim()}`,
    '',
    fields.message.trim(),
    '',
    `E-mail para contato: ${fields.email.trim()}`,
  ].join('\n')
}

type SubmitOptions = {
  apiUrl?: string
  fetchFn?: typeof fetch
  honeypot?: string
  elapsedMs?: number
}

/** Never throws: the caller always gets a status it can act on. */
export async function submitContact(
  fields: ContactFields,
  { apiUrl, fetchFn = fetch, honeypot = '', elapsedMs }: SubmitOptions = {},
): Promise<SubmitResult> {
  if (!apiUrl) return { status: 'skipped' }

  const payload = {
    nome: fields.name.trim(),
    email: fields.email.trim(),
    assunto: fields.subject.trim(),
    mensagem: fields.message.trim(),
    origem: 'site',
    website: honeypot,
    elapsedMs,
  }

  try {
    const response = await fetchFn(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return { status: response.ok ? 'saved' : 'failed' }
  } catch {
    return { status: 'failed' }
  }
}
