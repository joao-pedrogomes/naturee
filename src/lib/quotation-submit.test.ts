import { describe, expect, it } from 'vitest'
import {
  QUOTATION_LOG_KEY,
  buildPayload,
  buildProtocol,
  submitQuotation,
  type ResolvedLine,
} from '@/lib/quotation-submit'
import type { BuyerFields } from '@/lib/validation'
import type { Product } from '@/types/catalog'

const product: Product = {
  id: 'shiitake',
  slug: 'shiitake',
  name: 'Shiitake',
  subtitle: 'Inteiro · bandeja 200g',
  brandId: 'sitio-pura-vida',
  categoryId: 'cogumelos-in-natura',
  image: 'shiitake.svg',
  description: 'Cogumelo fresco.',
  specs: [],
  moq: { qty: 12, unit: 'un' },
  available: true,
  createdAt: '2026-01-10T00:00:00.000Z',
}

const lines: ResolvedLine[] = [
  {
    item: { productId: 'shiitake', qty: 24, addedAt: '2026-07-28T10:00:00.000Z', note: ' sem talo ' },
    product,
    brandName: 'Sítio Pura Vida',
  },
]

const buyer: BuyerFields = {
  nome: '  Joana Ribeiro ',
  email: ' joana@emporio.com.br ',
  telefone: '(48) 99999-0000',
  cnpj: '11.222.333/0001-81',
  observacoes: '  Entregar pela manhã  ',
}

const now = new Date('2026-07-28T13:45:00.000Z')

describe('buildPayload', () => {
  it('trims text and reduces phone and CNPJ to digits', () => {
    const payload = buildPayload(lines, buyer, now)

    expect(payload.buyer).toEqual({
      nome: 'Joana Ribeiro',
      email: 'joana@emporio.com.br',
      telefone: '48999990000',
      cnpj: '11222333000181',
      observacoes: 'Entregar pela manhã',
    })
    expect(payload.enviadoEm).toBe(now.toISOString())
  })

  it('omits the optional fields when they are empty', () => {
    const payload = buildPayload(lines, { ...buyer, cnpj: '', observacoes: '   ' }, now)

    expect(payload.buyer).not.toHaveProperty('cnpj')
    expect(payload.buyer).not.toHaveProperty('observacoes')
  })

  it('carries product identity, quantity, unit and note per line', () => {
    const payload = buildPayload(lines, buyer, now)

    expect(payload.items).toEqual([
      {
        productId: 'shiitake',
        slug: 'shiitake',
        nome: 'Shiitake',
        marca: 'Sítio Pura Vida',
        qty: 24,
        unidade: 'un',
        note: 'sem talo',
      },
    ])
  })

  it('omits a blank note', () => {
    const payload = buildPayload(
      [{ ...lines[0], item: { ...lines[0].item, note: '  ' } }],
      buyer,
      now,
    )

    expect(payload.items[0]).not.toHaveProperty('note')
  })
})

describe('buildProtocol', () => {
  it('uses the ORC-YYYYMMDD-XXXX shape', () => {
    expect(buildProtocol(new Date(2026, 6, 28), () => 0.5)).toMatch(
      /^ORC-20260728-[0-9A-F]{4}$/,
    )
  })

  it('pads a small random suffix', () => {
    expect(buildProtocol(new Date(2026, 0, 5), () => 0)).toBe('ORC-20260105-0000')
  })
})

describe('submitQuotation', () => {
  it('returns a receipt and appends it to the log', async () => {
    const payload = buildPayload(lines, buyer, now)

    const receipt = await submitQuotation(payload, { latencyMs: 0 })

    expect(receipt.protocol).toMatch(/^ORC-\d{8}-[0-9A-F]{4}$/)
    expect(receipt.payload).toBe(payload)

    const log = JSON.parse(localStorage.getItem(QUOTATION_LOG_KEY) ?? '[]')
    expect(log).toHaveLength(1)
    expect(log[0].payload.buyer.nome).toBe('Joana Ribeiro')
  })

  it('keeps only the 20 most recent entries', async () => {
    const payload = buildPayload(lines, buyer, now)
    localStorage.setItem(
      QUOTATION_LOG_KEY,
      JSON.stringify(Array.from({ length: 25 }, (_, index) => ({ protocol: `old-${index}` }))),
    )

    await submitQuotation(payload, { latencyMs: 0 })

    const log = JSON.parse(localStorage.getItem(QUOTATION_LOG_KEY) ?? '[]')
    expect(log).toHaveLength(20)
    expect(log.at(-1).payload.buyer.email).toBe('joana@emporio.com.br')
  })

  it('survives a corrupted log', async () => {
    localStorage.setItem(QUOTATION_LOG_KEY, 'not json')

    await expect(
      submitQuotation(buildPayload(lines, buyer, now), { latencyMs: 0 }),
    ).resolves.toMatchObject({ protocol: expect.any(String) })
  })
})
