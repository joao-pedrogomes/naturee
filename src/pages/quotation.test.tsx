import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import QuotationPage from '@/pages/quotation'
import {
  QUOTATION_STORAGE_KEY,
  QuotationProvider,
} from '@/context/quotation'
import { QUOTATION_LOG_KEY } from '@/lib/quotation-submit'
import { products } from '@/data/products'

const firstProduct = products[0]

function renderPage(children: ReactNode = <QuotationPage />) {
  return render(
    <MemoryRouter>
      <QuotationProvider>{children}</QuotationProvider>
    </MemoryRouter>,
  )
}

function seedCart(productId: string, qty: number) {
  localStorage.setItem(
    QUOTATION_STORAGE_KEY,
    JSON.stringify([{ productId, qty, addedAt: '2026-07-28T10:00:00.000Z' }]),
  )
}

describe('QuotationPage', () => {
  it('shows the empty state and no form when nothing is selected', () => {
    renderPage()

    expect(screen.getByText('Seu orçamento está vazio')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Enviar pedido de orçamento/ }),
    ).not.toBeInTheDocument()
  })

  it('lists the selected item with its quantity', () => {
    seedCart(firstProduct.id, 24)

    renderPage()

    expect(screen.getByText(firstProduct.name)).toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: new RegExp(`Quantidade de ${firstProduct.name}`) }),
    ).toHaveValue('24')
  })

  it('removes an item from the list', async () => {
    const user = userEvent.setup()
    seedCart(firstProduct.id, 24)

    renderPage()
    await user.click(
      screen.getByRole('button', {
        name: `Remover ${firstProduct.name} do orçamento`,
      }),
    )

    expect(await screen.findByText('Seu orçamento está vazio')).toBeInTheDocument()
  })

  it('submits, clears the cart and shows the protocol', async () => {
    const user = userEvent.setup()
    seedCart(firstProduct.id, 24)

    renderPage()

    await user.type(screen.getByLabelText(/^Nome/), 'Joana Ribeiro')
    await user.type(screen.getByLabelText(/^E-mail/), 'joana@emporio.com.br')
    await user.type(screen.getByLabelText(/^Telefone/), '48999990000')
    await user.click(screen.getByRole('button', { name: /Enviar pedido de orçamento/ }))

    expect(
      await screen.findByText('Pedido de orçamento enviado', undefined, { timeout: 3000 }),
    ).toBeInTheDocument()
    expect(screen.getByRole('status').textContent).toMatch(/^ORC-\d{8}-[0-9A-F]{4}$/)

    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem(QUOTATION_STORAGE_KEY) ?? '[]')).toEqual([]),
    )

    const log = JSON.parse(localStorage.getItem(QUOTATION_LOG_KEY) ?? '[]')
    expect(log.at(-1).payload.items[0]).toMatchObject({
      productId: firstProduct.id,
      qty: 24,
      unidade: firstProduct.moq.unit,
    })
    expect(log.at(-1).payload.buyer.telefone).toBe('48999990000')
  })
})

describe('QuotationPage — minimum order quantity', () => {
  it('raises a stored quantity that sits below the product MOQ', async () => {
    seedCart(firstProduct.id, 1)

    renderPage()

    const input = screen.getByRole('textbox', {
      name: new RegExp(`Quantidade de ${firstProduct.name}`),
    })
    await waitFor(() => expect(input).toHaveValue(String(firstProduct.moq.qty)))
  })

  it('leaves a quantity above the MOQ untouched', async () => {
    seedCart(firstProduct.id, firstProduct.moq.qty * 3)

    renderPage()

    expect(
      screen.getByRole('textbox', {
        name: new RegExp(`Quantidade de ${firstProduct.name}`),
      }),
    ).toHaveValue(String(firstProduct.moq.qty * 3))
  })
})
