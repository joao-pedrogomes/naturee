import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '@/App'
import SiteContentProvider from '@/content/SiteContentProvider'
import { defaultContent } from '@/content/defaultContent'
import type { SiteContent } from '@/content/types'
import { ROUTES } from '@/routes'

function renderAt(path: string, content: SiteContent = defaultContent) {
  return render(
    <SiteContentProvider content={content}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </SiteContentProvider>,
  )
}

const EXPECTED_H1: Record<string, RegExp> = {
  home: /Curadoria & distribuição/,
  about: /Conectando produtores/,
  products: /Uma seleção de boas origens/,
  logistics: /Cuidado em cada rota/,
  contact: /Boas conexões começam com uma conversa/,
}

describe('pages', () => {
  for (const route of ROUTES) {
    it(`renders ${route.path} with one h1 and its title`, () => {
      renderAt(route.path)
      const headings = screen.getAllByRole('heading', { level: 1 })
      expect(headings).toHaveLength(1)
      expect(headings[0]).toHaveTextContent(EXPECTED_H1[route.key])
      expect(document.title).toContain(defaultContent.pages[route.key].seo.title)
    })
  }

  it('renders the not found page for unknown paths', () => {
    renderAt('/nada-aqui')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Página não encontrada')
  })

  it('renders the not found page when a page is disabled', () => {
    const content: SiteContent = {
      ...defaultContent,
      pages: { ...defaultContent.pages, logistics: { ...defaultContent.pages.logistics, enabled: false } },
    }
    renderAt('/logistica', content)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Página não encontrada')
  })
})
