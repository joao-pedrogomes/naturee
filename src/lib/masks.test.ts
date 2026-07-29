import { describe, expect, it } from 'vitest'
import { formatCnpj, formatPhone, onlyDigits } from '@/lib/masks'

describe('onlyDigits', () => {
  it('strips everything that is not a digit', () => {
    expect(onlyDigits('(48) 99999-0000')).toBe('48999990000')
    expect(onlyDigits('abc')).toBe('')
  })
})

describe('formatPhone', () => {
  it('formats progressively while typing', () => {
    expect(formatPhone('')).toBe('')
    expect(formatPhone('4')).toBe('(4')
    expect(formatPhone('48')).toBe('(48')
    expect(formatPhone('4899')).toBe('(48) 99')
    expect(formatPhone('489999')).toBe('(48) 9999')
  })

  it('formats a 10-digit landline', () => {
    expect(formatPhone('4832410000')).toBe('(48) 3241-0000')
  })

  it('formats an 11-digit mobile', () => {
    expect(formatPhone('48999990000')).toBe('(48) 99999-0000')
  })

  it('drops digits past the eleventh', () => {
    expect(formatPhone('489999900001234')).toBe('(48) 99999-0000')
  })

  it('is idempotent on an already formatted value', () => {
    expect(formatPhone('(48) 99999-0000')).toBe('(48) 99999-0000')
  })

  it('ignores non-digit input', () => {
    expect(formatPhone('abc')).toBe('')
  })
})

describe('formatCnpj', () => {
  it('formats progressively while typing', () => {
    expect(formatCnpj('')).toBe('')
    expect(formatCnpj('12')).toBe('12')
    expect(formatCnpj('12345')).toBe('12.345')
    expect(formatCnpj('12345678')).toBe('12.345.678')
    expect(formatCnpj('123456780001')).toBe('12.345.678/0001')
  })

  it('formats a full CNPJ', () => {
    expect(formatCnpj('12345678000195')).toBe('12.345.678/0001-95')
  })

  it('drops digits past the fourteenth', () => {
    expect(formatCnpj('1234567800019599')).toBe('12.345.678/0001-95')
  })

  it('is idempotent on an already formatted value', () => {
    expect(formatCnpj('12.345.678/0001-95')).toBe('12.345.678/0001-95')
  })
})
