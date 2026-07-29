import type { Product } from '@/types/catalog'
import type { QuotationItem } from '@/context/quotation'
import { onlyDigits } from '@/lib/masks'
import type { BuyerFields } from '@/lib/validation'

export type QuotationPayloadItem = {
  productId: string
  slug: string
  nome: string
  marca: string
  qty: number
  unidade: string
  note?: string
}

export type QuotationPayload = {
  buyer: {
    nome: string
    email: string
    telefone: string
    cnpj?: string
    observacoes?: string
  }
  items: QuotationPayloadItem[]
  enviadoEm: string
}

export type QuotationReceipt = {
  protocol: string
  payload: QuotationPayload
}

export const QUOTATION_LOG_KEY = 'naturee.quotation-log'
const LOG_LIMIT = 20
const FAKE_LATENCY_MS = 800

export type ResolvedLine = { item: QuotationItem; product: Product; brandName: string }

export function buildPayload(
  lines: ResolvedLine[],
  buyer: BuyerFields,
  now: Date,
): QuotationPayload {
  const cnpj = onlyDigits(buyer.cnpj)
  const observacoes = buyer.observacoes.trim()

  return {
    buyer: {
      nome: buyer.nome.trim(),
      email: buyer.email.trim(),
      telefone: onlyDigits(buyer.telefone),
      ...(cnpj ? { cnpj } : {}),
      ...(observacoes ? { observacoes } : {}),
    },
    items: lines.map(({ item, product, brandName }) => ({
      productId: product.id,
      slug: product.slug,
      nome: product.name,
      marca: brandName,
      qty: item.qty,
      unidade: product.moq.unit,
      ...(item.note?.trim() ? { note: item.note.trim() } : {}),
    })),
    enviadoEm: now.toISOString(),
  }
}

export function buildProtocol(now: Date, random = Math.random): string {
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')
  const suffix = Math.floor(random() * 0x10000)
    .toString(16)
    .toUpperCase()
    .padStart(4, '0')

  return `ORC-${date}-${suffix}`
}

function appendToLog(receipt: QuotationReceipt) {
  try {
    const raw = localStorage.getItem(QUOTATION_LOG_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    const previous = Array.isArray(parsed) ? parsed : []
    const next = [...previous, receipt].slice(-LOG_LIMIT)
    localStorage.setItem(QUOTATION_LOG_KEY, JSON.stringify(next))
  } catch {
    // Blocked or full storage must never break a submission.
  }
}

/**
 * Stand-in for the real endpoint. Swapping this body for a fetch call is the only
 * change needed once the backend exists — the signature is already the right shape.
 */
export async function submitQuotation(
  payload: QuotationPayload,
  options: { latencyMs?: number } = {},
): Promise<QuotationReceipt> {
  const receipt: QuotationReceipt = {
    protocol: buildProtocol(new Date(payload.enviadoEm)),
    payload,
  }

  await new Promise((resolve) =>
    setTimeout(resolve, options.latencyMs ?? FAKE_LATENCY_MS),
  )

  appendToLog(receipt)
  return receipt
}
