import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Contact from '@/pages/Contact'
import SiteContentProvider from '@/content/SiteContentProvider'
import { defaultContent } from '@/content/defaultContent'

function renderContact() {
  return render(
    <SiteContentProvider content={defaultContent}>
      <MemoryRouter initialEntries={['/contato']}>
        <Contact />
      </MemoryRouter>
    </SiteContentProvider>,
  )
}

describe('contact location card', () => {
  it('shows the address, the opening hours and the social links', () => {
    renderContact()
    const location = screen.getByRole('region', { name: 'Localização' })
    expect(within(location).getByText(/Rua Manoel Loureiro, 1112/)).toBeInTheDocument()
    expect(within(location).getByText('São José | SC')).toBeInTheDocument()

    const hours = screen.getByRole('region', { name: 'Horário de funcionamento' })
    expect(hours).toHaveTextContent('Segunda a sexta-feira')
    expect(hours).toHaveTextContent('7:00 às 18:00')

    const social = screen.getByRole('region', { name: 'Siga nosso Instagram' })
    expect(within(social).getByRole('link', { name: /Instagram/ })).toHaveAttribute('href', defaultContent.site.instagramUrl)
    expect(within(social).getByRole('link', { name: /WhatsApp/ })).toHaveAttribute('href', expect.stringContaining('wa.me/'))
  })

  it('embeds a Google map searched by the configured address', () => {
    renderContact()
    const map = screen.getByTitle(defaultContent.pages.contact.location.mapTitle)
    const src = new URL(map.getAttribute('src') ?? '')
    expect(src.origin + src.pathname).toBe('https://www.google.com/maps')
    expect(src.searchParams.get('q')).toBe(defaultContent.pages.contact.location.mapQuery)
    expect(src.searchParams.get('output')).toBe('embed')
    expect(map).toHaveAttribute('loading', 'lazy')
  })

  it('puts the map after the information in the document, so it stacks below the text on mobile', () => {
    renderContact()
    const hours = screen.getByRole('region', { name: 'Siga nosso Instagram' })
    const map = screen.getByTitle(defaultContent.pages.contact.location.mapTitle)
    expect(hours.compareDocumentPosition(map) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
