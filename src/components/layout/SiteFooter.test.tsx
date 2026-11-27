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

  it('shows the copyright with the current year and the company identification that is filled in', () => {
    renderFooter()
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} Naturee Food Hub\\. Todos os direitos reservados\\.`))).toBeInTheDocument()
    expect(screen.getByText(/CNPJ \d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/)).toBeInTheDocument()
  })

  it('credits the studio with a WhatsApp link that opens in a new tab', () => {
    renderFooter()
    const credit = screen.getByRole('link', { name: 'Kubo' })
    const url = new URL(credit.getAttribute('href') ?? '')
    expect(`${url.origin}${url.pathname}`).toBe('https://wa.me/5517997390544')
    expect(url.searchParams.get('text')).toBe('Oi, to vindo do site da Naturee. Queria solicitar atendimento ou conversar. Pode me ajudar?')
    expect(credit).toHaveAttribute('target', '_blank')
    expect(credit).toHaveAttribute('rel', 'noopener')
  })
})
