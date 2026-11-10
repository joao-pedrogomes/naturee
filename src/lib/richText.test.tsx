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
})
