import { describe, expect, it } from 'vitest'
import {
  isValidCnpj,
  isValidEmail,
  isValidPhone,
  validateBuyer,
  type BuyerFields,
} from '@/lib/validation'

const validBuyer: BuyerFields = {
  nome: 'Joana Ribeiro',
  email: 'joana@emporio.com.br',
  telefone: '(48) 99999-0000',
  cnpj: '',
  observacoes: '',
}

describe('isValidEmail', () => {
  it.each(['a@b.co', 'joana@emporio.com.br', 'nome.sobrenome@casa.com'])(
    'accepts %s',
    (value) => expect(isValidEmail(value)).toBe(true),
  )

  it.each(['', 'joana', 'joana@', '@emporio.com', 'joana@emporio', 'a b@c.com'])(
    'rejects %s',
    (value) => expect(isValidEmail(value)).toBe(false),
  )
})

describe('isValidPhone', () => {
  it('accepts 10 and 11 digits', () => {
    expect(isValidPhone('(48) 3241-0000')).toBe(true)
    expect(isValidPhone('(48) 99999-0000')).toBe(true)
  })

  it('rejects anything shorter or longer', () => {
    expect(isValidPhone('(48) 9999')).toBe(false)
    expect(isValidPhone('489999900001')).toBe(false)
    expect(isValidPhone('')).toBe(false)
  })
})

describe('isValidCnpj', () => {
  it('accepts real CNPJs', () => {
    expect(isValidCnpj('11.222.333/0001-81')).toBe(true)
    expect(isValidCnpj('11222333000181')).toBe(true)
  })

  it('rejects a wrong check digit', () => {
    expect(isValidCnpj('11.222.333/0001-82')).toBe(false)
  })

  it('rejects repeated-digit sequences that satisfy the arithmetic', () => {
    expect(isValidCnpj('11.111.111/1111-11')).toBe(false)
    expect(isValidCnpj('00000000000000')).toBe(false)
  })

  it('rejects wrong lengths', () => {
    expect(isValidCnpj('11.222.333/0001-8')).toBe(false)
    expect(isValidCnpj('')).toBe(false)
  })
})

describe('validateBuyer', () => {
  it('returns no errors for a valid buyer', () => {
    expect(validateBuyer(validBuyer)).toEqual({})
  })

  it('requires nome, email and telefone', () => {
    const errors = validateBuyer({
      nome: '  ',
      email: '',
      telefone: '',
      cnpj: '',
      observacoes: '',
    })

    expect(Object.keys(errors).sort()).toEqual(['email', 'nome', 'telefone'])
  })

  it('leaves an empty CNPJ alone', () => {
    expect(validateBuyer({ ...validBuyer, cnpj: '' }).cnpj).toBeUndefined()
  })

  it('validates the CNPJ once it is filled', () => {
    expect(validateBuyer({ ...validBuyer, cnpj: '11.222.333/0001-82' }).cnpj).toBeDefined()
    expect(validateBuyer({ ...validBuyer, cnpj: '11.222.333/0001-81' }).cnpj).toBeUndefined()
  })

  it('rejects observações past the limit', () => {
    expect(
      validateBuyer({ ...validBuyer, observacoes: 'x'.repeat(501) }).observacoes,
    ).toBeDefined()
  })
})
