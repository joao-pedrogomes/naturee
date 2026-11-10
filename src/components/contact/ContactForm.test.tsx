import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ContactForm from '@/components/contact/ContactForm'
import SiteContentProvider from '@/content/SiteContentProvider'

function renderForm() {
  return render(
    <SiteContentProvider>
      <ContactForm />
    </SiteContentProvider>,
  )
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nome'), 'Ana Souza')
  await user.type(screen.getByLabelText('E-mail'), 'ana@exemplo.com')
  await user.type(screen.getByLabelText('Assunto'), 'Parceria')
  await user.type(screen.getByLabelText('Mensagem'), 'Quero conhecer os produtos.')
}

describe('ContactForm', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('shows an error per empty field and announces a summary', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Revise os campos destacados')
    expect(screen.getAllByText('Preencha este campo.')).toHaveLength(4)
    expect(screen.getByLabelText('Nome')).toHaveFocus()
    expect(screen.getByLabelText('Nome')).toHaveAttribute('aria-invalid', 'true')
  })

  it('rejects a malformed email', async () => {
    const user = userEvent.setup()
    renderForm()
    await fillValidForm(user)
    await user.clear(screen.getByLabelText('E-mail'))
    await user.type(screen.getByLabelText('E-mail'), 'ana@exemplo')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument()
  })

  it('opens WhatsApp with the message and shows the success state without an API', async () => {
    const user = userEvent.setup()
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    renderForm()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Mensagem pronta!')
    const url = open.mock.calls[0][0] as string
    expect(url).toContain('https://wa.me/5548991963383?text=')
    expect(decodeURIComponent(url)).toContain('Ana Souza')
    expect(screen.getByRole('link', { name: 'Abrir WhatsApp' })).toHaveAttribute('href', url)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('still opens WhatsApp and warns when the API fails', async () => {
    vi.stubEnv('VITE_CONTACT_API_URL', '/api/contact')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const user = userEvent.setup()
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    renderForm()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(await screen.findByRole('status')).toBeInTheDocument()
    expect(open).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('alert')).toHaveTextContent('Não conseguimos registrar sua mensagem')
  })
})
