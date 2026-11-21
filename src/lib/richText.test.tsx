import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderRichText } from '@/lib/richText'

describe('renderRichText', () => {
  it('wraps starred spans in <em>', () => {
    const { container } = render(<h1>{renderRichText('Mais do que distribuir, *conectamos.*')}</h1>)
    expect(container.querySelector('em')?.textContent).toBe('conectamos.')
    expect(container.textContent).toBe('Mais do que distribuir, conectamos.')
  })

  it('wraps double-starred spans in <strong>', () => {
    const { container } = render(<p>{renderRichText('A **Naturee** conecta *tudo*.')}</p>)
    expect(container.querySelector('strong')?.textContent).toBe('Naturee')
    expect(container.querySelector('em')?.textContent).toBe('tudo')
    expect(container.textContent).toBe('A Naturee conecta tudo.')
  })

  it('supports several spans and keeps a lone asterisk literal', () => {
    const { container } = render(<p>{renderRichText('*a* b *c* 5*')}</p>)
    expect(container.querySelectorAll('em')).toHaveLength(2)
    expect(container.textContent).toBe('a b c 5*')
  })

  it('turns a newline into a desktop-only break and || into a phone-only break, without extra spaces', () => {
    const { container } = render(<p>{renderRichText('Produtos de diferentes\nmarcas ||e fornecedores.')}</p>)
    const breaks = [...container.querySelectorAll('br')]
    expect(breaks).toHaveLength(2)
    expect(breaks[0]).toHaveClass('hidden', 'lg:inline')
    expect(breaks[1]).toHaveClass('sm:hidden')
    expect(container.textContent?.replace(/\s+/g, ' ')).toBe('Produtos de diferentes marcas e fornecedores.')
  })
})
