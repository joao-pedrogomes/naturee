import { expect, test } from '@playwright/test'
import { WHATSAPP_URL } from './routes'

test('empty submit shows one error per field', async ({ page }) => {
  await page.goto('/contato')
  await page.getByRole('button', { name: 'Enviar' }).click()
  await expect(page.getByRole('alert')).toContainText('Revise os campos')
  await expect(page.getByText('Preencha este campo.')).toHaveCount(4)
  await expect(page.getByLabel('Nome')).toBeFocused()
})

test('valid submit opens WhatsApp with the prefilled message', async ({ page, context }) => {
  await context.route('https://wa.me/**', (route) => route.fulfill({ status: 200, body: 'ok' }))
  await page.goto('/contato')
  await page.getByLabel('Nome').fill('Ana Souza')
  await page.getByLabel('E-mail').fill('ana@exemplo.com')
  await page.getByLabel('Assunto').fill('Parceria')
  await page.getByLabel('Mensagem').fill('Quero conhecer os produtos.')

  const popupPromise = context.waitForEvent('page')
  await page.getByRole('button', { name: 'Enviar' }).click()
  const popup = await popupPromise
  const url = popup.url()
  expect(url.startsWith(`${WHATSAPP_URL}?text=`)).toBe(true)
  expect(decodeURIComponent(url)).toContain('Ana Souza')
  expect(decodeURIComponent(url)).toContain('Parceria')

  await expect(page.getByRole('status')).toContainText('Mensagem pronta!')
  await expect(page.getByRole('link', { name: 'Abrir WhatsApp' })).toHaveAttribute('href', url)
})
