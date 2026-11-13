import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import SiteFooter from '@/components/layout/SiteFooter'
import SiteContentProvider from '@/content/SiteContentProvider'

function renderFooter() {
  return render(
    <MemoryRouter>
      <SiteContentProvider>
        <SiteFooter />
      </SiteContentProvider>
    </MemoryRouter>,
  )
}

describe('SiteFooter', () => {
  it('shows the four trust items', () => {
    renderFooter()
    expect(screen.getByRole('heading', { name: '100% Seguro' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Garantia de qualidade' })).toBeInTheDocument()
  })

  it('lists the quick links and contact channels', () => {
    renderFooter()
    const quick = screen.getByRole('navigation', { name: 'Acesso rápido' })
    expect(quick.querySelectorAll('a')).toHaveLength(5)
    expect(screen.getByRole('link', { name: /99196 3383/ })).toHaveAttribute('href', 'https://wa.me/5548991963383')
    expect(screen.getByRole('link', { name: /natureealimentos/ })).toHaveAttribute('href', 'https://www.instagram.com/natureealimentos')
    expect(screen.getByText('Atendemos o litoral catarinense, de Itajaí a Araranguá.')).toBeInTheDocument()
  })

  it('breaks the region line before "de Itajaí" on every screen size', () => {
    renderFooter()
    const region = screen.getByText('Atendemos o litoral catarinense, de Itajaí a Araranguá.')
    expect(region.textContent).toBe('Atendemos o litoral catarinense,\nde Itajaí a Araranguá.')
    expect(region).toHaveClass('whitespace-pre-line')
  })
})
