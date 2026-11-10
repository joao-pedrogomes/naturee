import { describe, expect, it } from 'vitest'
import { absoluteUrl, pageTitle } from '@/lib/seo'

describe('absoluteUrl', () => {
  it('joins without doubling slashes', () => {
    expect(absoluteUrl('/sobre', 'https://naturee.com.br/')).toBe('https://naturee.com.br/sobre')
    expect(absoluteUrl('sobre', 'https://naturee.com.br')).toBe('https://naturee.com.br/sobre')
    expect(absoluteUrl('/', 'https://naturee.com.br')).toBe('https://naturee.com.br/')
  })
})

describe('pageTitle', () => {
  it('suffixes the site name and avoids repeating it', () => {
    expect(pageTitle('Sobre', 'Naturee Food Hub')).toBe('Sobre · Naturee Food Hub')
    expect(pageTitle('Naturee Food Hub', 'Naturee Food Hub')).toBe('Naturee Food Hub')
  })
})
