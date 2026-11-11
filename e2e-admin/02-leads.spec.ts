import { expect, test } from '@playwright/test'
import { signInReady } from './helpers'

test('a lead sent from the public form shows up in the panel and is marked read when opened', async ({ page, context }) => {
  await context.route('https://wa.me/**', (route) => route.fulfill({ status: 200, body: 'ok' }))
  await page.goto('/contato')
  await page.waitForTimeout(1800)
  await page.getByLabel('Nome').fill('Ana Souza')
  await page.getByLabel('E-mail').fill('ana@exemplo.com')
  await page.getByLabel('Assunto').fill('Parceria de teste')
  await page.getByLabel('Mensagem').fill('Quero conhecer os produtos.')
  const popup = context.waitForEvent('page')
  await page.getByRole('button', { name: 'Enviar' }).click()
  await popup
  await expect(page.getByRole('status')).toContainText('Mensagem pronta!')
  await expect(page.getByRole('alert')).toHaveCount(0)

  await signInReady(page)
  await expect(page.getByRole('tab', { name: /Novos \(1\)/ })).toBeVisible()
  await page.getByRole('button', { name: /Ana Souza/ }).click()
  const detail = page.getByRole('dialog')
  await expect(detail.getByText('Quero conhecer os produtos.')).toBeVisible()
  await expect(detail.getByRole('link', { name: 'Responder por e-mail' })).toHaveAttribute('href', /mailto:ana@exemplo.com/)
  await detail.getByRole('button', { name: 'Arquivar' }).click()
  await page.keyboard.press('Escape')
  await page.getByRole('tab', { name: /Arquivados \(1\)/ }).click()
  await expect(page.getByRole('button', { name: /Ana Souza/ })).toBeVisible()
})

test('spam submissions are not stored', async ({ page, request }) => {
  const response = await request.post('/api/contact', {
    headers: { origin: 'http://localhost:8788' },
    data: { nome: 'Bot', email: 'bot@x.com', assunto: 'x', mensagem: 'y', website: 'http://spam', elapsedMs: 9000 },
  })
  expect(response.status()).toBe(201)
  await signInReady(page)
  await expect(page.getByRole('button', { name: /Bot/ })).toHaveCount(0)
})

test('search filters the table', async ({ page }) => {
  await signInReady(page)
  await page.getByRole('tab', { name: /Todos/ }).click()
  await page.getByRole('searchbox').fill('zzz-no-match')
  await expect(page.getByText('Nenhum contato por aqui.')).toBeVisible()
})
