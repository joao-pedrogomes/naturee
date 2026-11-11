import { describe, expect, it, vi } from 'vitest'
import {
  buildContactMessage,
  CONTACT_LIMITS,
  submitContact,
  validateContact,
  type ContactFields,
} from '@/lib/contact'

const valid: ContactFields = {
  name: 'Ana',
  email: 'ana@exemplo.com',
  subject: 'Parceria',
  message: 'Quero conhecer os produtos.',
}

describe('validateContact', () => {
  it('passes a valid form', () => {
    expect(validateContact(valid)).toEqual({})
  })

  it('flags blank fields as required', () => {
    expect(validateContact({ name: ' ', email: '', subject: '', message: '' })).toEqual({
      name: 'required',
      email: 'required',
      subject: 'required',
      message: 'required',
    })
  })

  it('flags a malformed email', () => {
    expect(validateContact({ ...valid, email: 'ana@exemplo' })).toEqual({ email: 'email' })
  })

  it('flags fields over their limit', () => {
    const message = 'x'.repeat(CONTACT_LIMITS.message + 1)
    expect(validateContact({ ...valid, message })).toEqual({ message: 'tooLong' })
  })
})

describe('buildContactMessage', () => {
  it('includes every field in Portuguese', () => {
    const text = buildContactMessage(valid)
    expect(text).toContain('Meu nome é Ana')
    expect(text).toContain('Assunto: Parceria')
    expect(text).toContain('Quero conhecer os produtos.')
    expect(text).toContain('ana@exemplo.com')
  })
})

describe('submitContact', () => {
  it('skips when no API URL is configured', async () => {
    await expect(submitContact(valid)).resolves.toEqual({ status: 'skipped' })
  })

  it('posts JSON and reports saved on 2xx', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: true, status: 201 })
    await expect(submitContact(valid, { apiUrl: '/api/contact', fetchFn })).resolves.toEqual({ status: 'saved' })
    const [url, init] = fetchFn.mock.calls[0]
    expect(url).toBe('/api/contact')
    expect(JSON.parse(init.body)).toEqual({
      nome: 'Ana',
      email: 'ana@exemplo.com',
      assunto: 'Parceria',
      mensagem: 'Quero conhecer os produtos.',
      origem: 'site',
      website: '',
    })
  })

  it('reports failed on non-2xx and on network errors', async () => {
    const bad = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    await expect(submitContact(valid, { apiUrl: '/api', fetchFn: bad })).resolves.toEqual({ status: 'failed' })
    const thrown = vi.fn().mockRejectedValue(new Error('offline'))
    await expect(submitContact(valid, { apiUrl: '/api', fetchFn: thrown })).resolves.toEqual({ status: 'failed' })
  })
})

describe('submitContact anti-spam fields', () => {
  it('forwards the honeypot value and the fill time', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: true, status: 201 })
    await submitContact(valid, { apiUrl: '/api/contact', fetchFn, honeypot: 'bot', elapsedMs: 4200 })
    const body = JSON.parse(fetchFn.mock.calls[0][1].body)
    expect(body.website).toBe('bot')
    expect(body.elapsedMs).toBe(4200)
  })
})
