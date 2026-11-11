import { expect, test } from '@playwright/test'
import { ADMIN_EMAIL, FIRST_PASSWORD, NEW_PASSWORD, signIn } from './helpers'

test('anonymous visitors are sent to the login screen and the shell is noindex', async ({ page, request }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/admin\/entrar/)
  await expect(page.getByRole('heading', { name: 'Entrar no painel' })).toBeVisible()

  const shell = await request.get('/admin/entrar')
  expect(shell.status()).toBe(200)
  expect(shell.headers()['x-robots-tag']).toContain('noindex')
  expect(shell.headers()['content-security-policy']).toContain("frame-ancestors 'none'")
})

test('wrong credentials show one generic error', async ({ page }) => {
  await signIn(page, 'definitely not the password')
  await expect(page.getByRole('alert')).toHaveText('E-mail ou senha incorretos.')
  await page.getByLabel('E-mail').fill('ghost@teste.com')
  await page.getByLabel('Senha').fill('definitely not the password')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('alert')).toHaveText('E-mail ou senha incorretos.')
})

test('first login forces a password change, then the panel opens', async ({ page }) => {
  await signIn(page, FIRST_PASSWORD)
  await expect(page).toHaveURL(/\/admin\/conta/)
  await expect(page.getByText('defina uma nova senha')).toBeVisible()

  await page.goto('/admin/conteudo')
  await expect(page).toHaveURL(/\/admin\/conta/)

  await page.getByLabel('Senha atual').fill(FIRST_PASSWORD)
  await page.getByLabel('Nova senha', { exact: true }).fill(NEW_PASSWORD)
  await page.getByLabel('Repita a nova senha').fill(NEW_PASSWORD)
  await page.getByRole('button', { name: 'Alterar senha' }).click()
  await expect(page.getByRole('status')).toContainText('Senha alterada')

  await page.getByRole('link', { name: 'Contatos' }).click()
  await expect(page.getByRole('heading', { name: 'Contatos recebidos' })).toBeVisible()
  await expect(page.getByText(ADMIN_EMAIL)).toBeVisible()
})

test('signing out ends the session', async ({ page }) => {
  await signIn(page, NEW_PASSWORD)
  await page.getByRole('button', { name: 'Sair' }).click()
  await expect(page).toHaveURL(/\/admin\/entrar/)
  await page.goto('/admin/contatos')
  await expect(page).toHaveURL(/\/admin\/entrar/)
})
