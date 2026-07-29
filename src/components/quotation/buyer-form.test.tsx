import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BUYER_DRAFT_KEY, BuyerForm } from '@/components/quotation/buyer-form'

function setup(onSubmit = vi.fn()) {
  render(<BuyerForm submitting={false} submitError={null} onSubmit={onSubmit} />)
  return { onSubmit }
}

async function fillValidBuyer(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^Nome/), 'Joana Ribeiro')
  await user.type(screen.getByLabelText(/^E-mail/), 'joana@emporio.com.br')
  await user.type(screen.getByLabelText(/^Telefone/), '48999990000')
}

describe('BuyerForm', () => {
  it('blocks submission and lists the missing fields', async () => {
    const user = userEvent.setup()
    const { onSubmit } = setup()

    await user.click(screen.getByRole('button', { name: /Enviar pedido de orçamento/ }))

    expect(onSubmit).not.toHaveBeenCalled()
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Nome')
    expect(alert).toHaveTextContent('E-mail')
    expect(alert).toHaveTextContent('Telefone')
  })

  it('moves focus to the first invalid field on submit', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(screen.getByRole('button', { name: /Enviar pedido de orçamento/ }))

    expect(screen.getByLabelText(/^Nome/)).toHaveFocus()
  })

  it('does not complain while a field is being typed for the first time', async () => {
    const user = userEvent.setup()
    setup()

    await user.type(screen.getByLabelText(/^E-mail/), 'joana@')

    expect(screen.queryByText('E-mail inválido.')).not.toBeInTheDocument()
  })

  it('shows the error after leaving an invalid field', async () => {
    const user = userEvent.setup()
    setup()

    await user.type(screen.getByLabelText(/^E-mail/), 'joana@')
    await user.tab()

    expect(await screen.findByText('E-mail inválido.')).toBeInTheDocument()
  })

  it('masks the phone as it is typed', async () => {
    const user = userEvent.setup()
    setup()

    await user.type(screen.getByLabelText(/^Telefone/), '48999990000')

    expect(screen.getByLabelText(/^Telefone/)).toHaveValue('(48) 99999-0000')
  })

  it('masks the CNPJ and rejects an invalid one', async () => {
    const user = userEvent.setup()
    const { onSubmit } = setup()

    await fillValidBuyer(user)
    await user.type(screen.getByLabelText(/^CNPJ/), '11222333000182')
    await user.click(screen.getByRole('button', { name: /Enviar pedido de orçamento/ }))

    expect(screen.getByLabelText(/^CNPJ/)).toHaveValue('11.222.333/0001-82')
    expect(screen.getByText('CNPJ inválido. Confira os números.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits once with the filled values when everything is valid', async () => {
    const user = userEvent.setup()
    const { onSubmit } = setup()

    await fillValidBuyer(user)
    await user.click(screen.getByRole('button', { name: /Enviar pedido de orçamento/ }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      nome: 'Joana Ribeiro',
      email: 'joana@emporio.com.br',
      telefone: '(48) 99999-0000',
      cnpj: '',
      observacoes: '',
    })
  })

  it('submits with an empty CNPJ, since it is optional', async () => {
    const user = userEvent.setup()
    const { onSubmit } = setup()

    await fillValidBuyer(user)
    await user.click(screen.getByRole('button', { name: /Enviar pedido de orçamento/ }))

    expect(onSubmit.mock.calls[0][0].cnpj).toBe('')
  })

  it('restores a saved draft on mount', () => {
    localStorage.setItem(
      BUYER_DRAFT_KEY,
      JSON.stringify({
        nome: 'Joana',
        email: 'joana@emporio.com.br',
        telefone: '(48) 99999-0000',
        cnpj: '',
        observacoes: 'Entregar pela manhã',
      }),
    )

    setup()

    expect(screen.getByLabelText(/^Nome/)).toHaveValue('Joana')
    expect(screen.getByLabelText(/^Observações/)).toHaveValue('Entregar pela manhã')
  })

  it('ignores a corrupted draft', () => {
    localStorage.setItem(BUYER_DRAFT_KEY, 'not json')

    setup()

    expect(screen.getByLabelText(/^Nome/)).toHaveValue('')
  })

  it('wipes the draft and the fields on "Limpar meus dados"', async () => {
    const user = userEvent.setup()
    setup()

    await user.type(screen.getByLabelText(/^Nome/), 'Joana')
    await user.click(screen.getByRole('button', { name: 'Limpar meus dados' }))

    expect(screen.getByLabelText(/^Nome/)).toHaveValue('')
    expect(localStorage.getItem(BUYER_DRAFT_KEY)).toBeNull()
  })
})
