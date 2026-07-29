import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProductCard } from '@/components/catalog/product-card'
import type { Product } from '@/types/catalog'

// The real quotation provider is written elsewhere; this test stubs its whole
// surface so it stays self-contained.
const mocks = vi.hoisted(() => ({
  has: vi.fn<(productId: string) => boolean>(() => false),
  add: vi.fn(),
  remove: vi.fn(),
  toastSuccess: vi.fn(),
}))

vi.mock('@/context/quotation', () => ({
  useQuotation: () => ({
    items: [],
    count: 0,
    has: mocks.has,
    add: mocks.add,
    remove: mocks.remove,
    setQty: vi.fn(),
    clear: vi.fn(),
  }),
}))

vi.mock('sonner', () => ({
  toast: { success: mocks.toastSuccess },
}))

const product: Product = {
  id: 'p-1',
  slug: 'shiitake',
  name: 'Shiitake',
  subtitle: 'Fatiado · bandeja 200g',
  brandId: 'b-1',
  categoryId: 'c-1',
  image: '/shiitake.svg',
  description: 'Cogumelo shiitake fresco.',
  specs: [{ label: 'Peso', value: '200g' }],
  moq: { qty: 12, unit: 'un' },
  available: true,
  createdAt: '2026-07-01T00:00:00.000Z',
}

function renderCard(
  overrides: Partial<Product> = {},
  route = '/produtos?marca=sitio-pura-vida&pagina=2'
) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ProductCard
        product={{ ...product, ...overrides }}
        brandName="Sítio Pura Vida"
        categoryName="Cogumelos in natura"
      />
    </MemoryRouter>
  )
}

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.has.mockReturnValue(false)
  })

  it('renders the MOQ line instead of a price', () => {
    renderCard()

    expect(screen.getByText('Sob consulta · mín. 12 un')).toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/R\$|\d+,\d{2}/)
  })

  it('shows the "Sob encomenda" badge only when the product is unavailable', () => {
    const { unmount } = renderCard()
    expect(screen.queryByText('Sob encomenda')).not.toBeInTheDocument()
    unmount()

    renderCard({ available: false })
    expect(screen.getByText('Sob encomenda')).toBeInTheDocument()
  })

  it('adds the product to the quotation and toasts an undo action', async () => {
    const user = userEvent.setup()
    renderCard()

    await user.click(
      screen.getByRole('button', { name: 'Adicionar Shiitake ao orçamento' })
    )

    expect(mocks.add).toHaveBeenCalledWith(product)
    expect(mocks.toastSuccess).toHaveBeenCalledWith(
      'Adicionado ao orçamento',
      expect.objectContaining({
        action: expect.objectContaining({ label: 'Desfazer' }),
      })
    )
  })

  it('reads "Adicionado" and removes the item when already in the quotation', async () => {
    const user = userEvent.setup()
    mocks.has.mockReturnValue(true)
    renderCard()

    expect(screen.getByText('Adicionado')).toBeInTheDocument()
    expect(
      screen.queryByText('Adicionar ao orçamento')
    ).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Remover Shiitake do orçamento' })
    )

    expect(mocks.remove).toHaveBeenCalledWith('p-1')
    expect(mocks.add).not.toHaveBeenCalled()
  })

  it('keeps the current query string on the "Ver mais" link', () => {
    renderCard()

    expect(
      screen.getByRole('link', { name: 'Ver mais sobre Shiitake' })
    ).toHaveAttribute(
      'href',
      '/produtos/shiitake?marca=sitio-pura-vida&pagina=2'
    )
  })
})
