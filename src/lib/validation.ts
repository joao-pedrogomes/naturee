import { onlyDigits } from '@/lib/masks'

export type BuyerFields = {
  nome: string
  email: string
  telefone: string
  cnpj: string
  observacoes: string
}

export type BuyerField = keyof BuyerFields

export const OBSERVACOES_MAX = 500
export const NOTE_MAX = 120

export function isFilled(value: string): boolean {
  return value.trim().length > 0
}

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim()
  if (/\s/.test(trimmed)) return false
  return /^[^@]+@[^@.]+(\.[^@.]+)+$/.test(trimmed)
}

/** Brazilian numbers: 10 digits (landline) or 11 (mobile), area code included. */
export function isValidPhone(value: string): boolean {
  const digits = onlyDigits(value)
  return digits.length === 10 || digits.length === 11
}

/**
 * Full CNPJ validation, including both check digits.
 * Length alone is not enough: 11.111.111/1111-11 satisfies the arithmetic but is invalid.
 */
export function isValidCnpj(value: string): boolean {
  const digits = onlyDigits(value)
  if (digits.length !== 14) return false
  if (/^(\d)\1{13}$/.test(digits)) return false

  const checkDigit = (slice: string, weights: number[]) => {
    const sum = weights.reduce(
      (total, weight, index) => total + Number(slice[index]) * weight,
      0,
    )
    const rest = sum % 11
    return rest < 2 ? 0 : 11 - rest
  }

  const first = checkDigit(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  if (first !== Number(digits[12])) return false

  const second = checkDigit(
    digits.slice(0, 13),
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  )
  return second === Number(digits[13])
}

export function validateBuyer(
  fields: BuyerFields,
): Partial<Record<BuyerField, string>> {
  const errors: Partial<Record<BuyerField, string>> = {}

  if (!isFilled(fields.nome)) errors.nome = 'Informe seu nome.'
  else if (fields.nome.trim().length < 2) errors.nome = 'Nome muito curto.'

  if (!isFilled(fields.email)) errors.email = 'Informe seu e-mail.'
  else if (!isValidEmail(fields.email)) errors.email = 'E-mail inválido.'

  if (!isFilled(fields.telefone)) errors.telefone = 'Informe seu telefone.'
  else if (!isValidPhone(fields.telefone))
    errors.telefone = 'Telefone incompleto. Use DDD + número.'

  // Optional field: only validated once something is typed.
  if (isFilled(fields.cnpj) && !isValidCnpj(fields.cnpj))
    errors.cnpj = 'CNPJ inválido. Confira os números.'

  if (fields.observacoes.length > OBSERVACOES_MAX)
    errors.observacoes = `Máximo de ${OBSERVACOES_MAX} caracteres.`

  return errors
}

export const BUYER_FIELD_ORDER: BuyerField[] = [
  'nome',
  'email',
  'telefone',
  'cnpj',
  'observacoes',
]

export const BUYER_FIELD_LABELS: Record<BuyerField, string> = {
  nome: 'Nome',
  email: 'E-mail',
  telefone: 'Telefone',
  cnpj: 'CNPJ',
  observacoes: 'Observações',
}
