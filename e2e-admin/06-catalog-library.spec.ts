import { expect, test } from '@playwright/test'
import { signInReady } from './helpers'

const PDF = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n')

test('an uploaded catalog can feed every catalog button, then the original comes back', async ({ page }) => {
  await signInReady(page)
  await page.getByRole('link', { name: 'Catálogo' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Catálogo')
  await expect(page.getByText('Catálogo original do site')).toBeVisible()
  await expect(page.getByText('Em uso nos botões do site')).toHaveCount(1)

  await page.locator('input[type=file]').setInputFiles({ name: 'Catálogo Novo.pdf', mimeType: 'application/pdf', buffer: PDF })
  const row = page.getByRole('listitem').filter({ hasText: 'Catálogo Novo.pdf' })
  await expect(row).toBeVisible()
  await row.getByRole('button', { name: 'Usar nos botões do site' }).click()
  await expect(page.getByRole('status').first()).toContainText('Os botões de catálogo do site já abrem este arquivo')
  await expect(row.getByText('Em uso nos botões do site')).toBeVisible()
  await expect(row.getByRole('button', { name: 'Excluir' })).toBeDisabled()

  await page.goto('/')
  const button = page.getByRole('link', { name: /catálogo/i }).first()
  const href = (await button.getAttribute('href')) as string
  expect(href).toMatch(/^\/catalogo\/[a-f0-9]{16}\/catalogo-novo\.pdf$/)
  const served = await page.request.get(href)
  expect(served.status()).toBe(200)
  expect(served.headers()['content-type']).toBe('application/pdf')
  expect(Buffer.from(await served.body()).equals(PDF)).toBe(true)

  await page.goto('/admin/catalogo')
  await page.getByText('Catálogo original do site').locator('xpath=ancestor::li').getByRole('button', { name: 'Usar nos botões do site' }).click()
  await expect(row.getByRole('button', { name: 'Excluir' })).toBeEnabled()
  page.once('dialog', (dialog) => void dialog.accept())
  await row.getByRole('button', { name: 'Excluir' }).click()
  await expect(row).toHaveCount(0)
  await page.goto('/')
  await expect(page.getByRole('link', { name: /catálogo/i }).first()).toHaveAttribute('href', '/catalogoNaturee.pdf')
})

test('the image library lists the pictures that ship with the site and lets a field reuse one', async ({ page }) => {
  await signInReady(page)
  await page.getByRole('link', { name: 'Imagens' }).click()
  await expect(page.getByRole('heading', { name: 'Imagens do site' })).toBeVisible()
  expect(await page.locator('h2:has-text("Imagens do site") ~ ul > li').count()).toBeGreaterThan(10)

  await page.getByRole('link', { name: 'Conteúdo' }).click()
  await page.getByRole('button', { name: 'Trocar imagem' }).first().click()
  const library = page.getByRole('dialog')
  const pictures = library.locator('h2:has-text("Imagens do site") ~ ul > li')
  const choice = pictures.nth(3)
  const source = await choice.locator('img').getAttribute('src')
  await choice.getByRole('button', { name: 'Escolher imagem' }).click()
  await expect(library).toBeHidden()
  await page.getByRole('button', { name: 'Salvar alterações' }).click()
  await expect(page.getByRole('status')).toContainText('Alterações publicadas')

  await page.goto('/')
  await expect(page.locator(`img[src="${source}"]`).first()).toBeVisible()
})
