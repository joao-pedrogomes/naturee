import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteContentProvider from '@/content/SiteContentProvider'
import { defaultContent } from '@/content/defaultContent'
import type { SiteContent } from '@/content/types'

function renderHeader(path = '/sobre', content: SiteContent = defaultContent) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SiteContentProvider content={content}>
        <SiteHeader />
      </SiteContentProvider>
    </MemoryRouter>,
  )
}

describe('SiteHeader', () => {
  it('renders the five nav links and the WhatsApp pill, in order, in one nav after the logo', () => {
    renderHeader()
    const primary = screen.getByRole('navigation', { name: 'Principal' })
    expect(screen.queryByRole('navigation', { name: 'Secundária' })).not.toBeInTheDocument()
    const hrefs = [...primary.querySelectorAll('a')].map((link) => link.getAttribute('href'))
    expect(hrefs).toEqual(['/', '/sobre', '/marcas-e-produtos', '/logistica', '/contato', expect.stringContaining('wa.me')])
    const logo = screen.getByRole('img', { name: defaultContent.site.name }).closest('a')
    expect(logo?.compareDocumentPosition(primary)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('marks the current page link', () => {
    renderHeader('/sobre')
    expect(screen.getByRole('link', { name: 'Sobre', current: 'page' })).toBeInTheDocument()
  })

  it('hides a disabled nav link', () => {
    const content: SiteContent = {
      ...defaultContent,
      nav: defaultContent.nav.map((link) => (link.id === 'logistics' ? { ...link, enabled: false } : link)),
    }
    renderHeader('/', content)
    expect(screen.queryByRole('link', { name: 'Logística' })).not.toBeInTheDocument()
  })

  it('links the WhatsApp pill to the configured number', () => {
    renderHeader()
    const pill = screen.getAllByRole('link', { name: /Fale com a Naturee/i })[0]
    expect(pill).toHaveAttribute('href', 'https://wa.me/5548991963383')
    expect(pill).toHaveAttribute('target', '_blank')
  })

  it('opens and closes the mobile menu', async () => {
    const user = userEvent.setup()
    renderHeader()
    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeVisible()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
