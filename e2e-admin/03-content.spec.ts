import { expect, test } from '@playwright/test'
import { signInReady, TINY_PNG } from './helpers'

test('editing a headline publishes it with matching SEO and keeps hydration clean', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))

  await signInReady(page)
  await page.getByRole('link', { name: 'Conteúdo' }).click()
  const title = page.getByLabel('Título')
  await title.fill('Frase editada *no painel*')
  await page.getByRole('button', { name: 'Salvar alterações' }).click()
  await expect(page.getByRole('status')).toContainText('Alterações publicadas')

  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Frase editada no painel')
  await expect(page.locator('h1 em')).toHaveText('no painel')
  expect(errors.filter((text) => /hydrat|#418|#423|#425/i.test(text))).toEqual([])

  await page.goto('/admin/conteudo')
  await page.getByRole('button', { name: 'Restaurar padrão' }).first().click()
  await page.getByRole('button', { name: 'Salvar alterações' }).click()
  await expect(page.getByRole('status')).toContainText('Alterações publicadas')
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Curadoria')
})

test('unsafe links are rejected with a field error', async ({ page }) => {
  await signInReady(page)
  await page.goto('/admin/conteudo')
  const link = page.getByLabel('Botão principal › Link')
  await link.fill('javascript:alert(1)')
  await page.getByRole('button', { name: 'Salvar alterações' }).click()
  await expect(page.getByRole('alert').first()).toBeVisible()
  await page.goto('/')
  await expect(page.locator('a[href^="javascript:"]')).toHaveCount(0)
})

test('contact settings change the footer and the form hand-off number', async ({ page }) => {
  await signInReady(page)
  await page.getByRole('link', { name: 'Configurações' }).click()
  await page.getByLabel('WhatsApp dos botões do site (com DDD)').fill('11 98888 7777')
  await page.getByLabel('WhatsApp como aparece escrito no site').fill('11 98888 7777')
  await page.getByLabel('E-mail da empresa que recebe os contatos').fill('equipe@naturee.com')
  await page.getByRole('button', { name: 'Salvar configurações' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Configurações salvas' })).toBeVisible()

  await page.goto('/contato')
  await expect(page.locator('footer').getByText('11 98888 7777')).toBeVisible()
  await expect(page.locator('a[href*="wa.me/5511988887777"]').first()).toHaveAttribute('href', /5511988887777/)
})

test('uploading an image replaces a photo and it is served with a small variant', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit cannot encode WebP')
  await signInReady(page)
  await page.getByRole('link', { name: 'Conteúdo' }).click()
  await page.getByRole('button', { name: 'Trocar imagem' }).first().click()
  await page.getByLabel('Descrição da imagem (para acessibilidade)').fill('Foto enviada no teste')
  await page.locator('input[type=file]').setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: TINY_PNG })
  await expect(page.getByRole('dialog')).toBeHidden()
  await page.getByRole('button', { name: 'Salvar alterações' }).click()
  await expect(page.getByRole('status')).toContainText('Alterações publicadas')

  await page.goto('/')
  const hero = page.locator('img[alt="Foto enviada no teste"]').first()
  await expect(hero).toHaveAttribute('src', /^\/media\/[a-f0-9]{16}$/)
  const response = await page.request.get((await hero.getAttribute('src')) as string)
  expect(response.headers()['content-type']).toBe('image/webp')
  expect(response.headers()['cache-control']).toContain('immutable')
})

test('history can bring an earlier state back', async ({ page }) => {
  await signInReady(page)
  await page.goto('/admin/conteudo')
  await page.getByRole('button', { name: 'Histórico' }).click()
  await expect(page.getByRole('button', { name: 'Voltar a esta versão' }).first()).toBeVisible()
})
