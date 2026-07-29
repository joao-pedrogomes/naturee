import type { QuotationReceipt } from '@/lib/quotation-submit'

/**
 * TODO: substituir pelos contatos oficiais da Naturee Food Hub.
 * Enquanto estiverem vazios, os botões de WhatsApp e e-mail ficam desabilitados
 * em vez de abrir um link quebrado.
 */
export const COMPANY_WHATSAPP = '' // ex.: '5548999990000'
export const COMPANY_EMAIL = '' // ex.: 'comercial@natureefoodhub.com.br'

export function hasWhatsappContact(): boolean {
  return COMPANY_WHATSAPP.trim().length > 0
}

export function hasEmailContact(): boolean {
  return COMPANY_EMAIL.trim().length > 0
}

export function formatQuotationText(receipt: QuotationReceipt): string {
  const { payload, protocol } = receipt
  const lines = [
    `Pedido de orçamento ${protocol}`,
    '',
    `Nome: ${payload.buyer.nome}`,
    `E-mail: ${payload.buyer.email}`,
    `Telefone: ${payload.buyer.telefone}`,
  ]

  if (payload.buyer.cnpj) lines.push(`CNPJ: ${payload.buyer.cnpj}`)

  lines.push('', 'Itens:')
  for (const item of payload.items) {
    const note = item.note ? ` (${item.note})` : ''
    lines.push(`- ${item.nome} — ${item.marca} — ${item.qty} ${item.unidade}${note}`)
  }

  if (payload.buyer.observacoes) {
    lines.push('', `Observações: ${payload.buyer.observacoes}`)
  }

  return lines.join('\n')
}

export function buildWhatsappUrl(receipt: QuotationReceipt): string {
  return `https://wa.me/${COMPANY_WHATSAPP}?text=${encodeURIComponent(
    formatQuotationText(receipt),
  )}`
}

export function buildMailtoUrl(receipt: QuotationReceipt): string {
  const subject = `Pedido de orçamento ${receipt.protocol}`
  return `mailto:${COMPANY_EMAIL}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(formatQuotationText(receipt))}`
}
