import { expect, test } from '@playwright/test'
import { signInReady } from './helpers'

test('an admin adds a user, who must change the temporary password, then removes them', async ({ page, browser }) => {
  await signInReady(page)
  await page.getByRole('link', { name: 'Usuários' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Usuários do painel')

  await page.getByLabel('E-mail da nova pessoa').fill('Equipe@Teste.com')
  await page.getByRole('button', { name: 'Adicionar usuário' }).click()
  await expect(page.getByRole('status').first()).toContainText('Usuário criado')
  const password = (await page.locator('code').innerText()).trim()
  expect(password).toHaveLength(20)
  await expect(page.getByRole('row', { name: /equipe@teste.com/ })).toContainText('Aguardando troca de senha')

  const other = await browser.newContext({ baseURL: page.url().split('/admin')[0] })
  const guest = await other.newPage()
  await guest.goto('/admin/entrar')
  await guest.getByLabel('E-mail').fill('equipe@teste.com')
  await guest.getByLabel('Senha').fill(password)
  await guest.getByRole('button', { name: 'Entrar' }).click()
  await expect(guest).toHaveURL(/\/admin\/conta/)
  await guest.goto('/admin/usuarios')
  await expect(guest).toHaveURL(/\/admin\/conta/)

  page.once('dialog', (dialog) => void dialog.accept())
  await page.getByRole('row', { name: /equipe@teste.com/ }).getByRole('button', { name: 'Gerar nova senha' }).click()
  await expect(page.getByRole('status').first()).toContainText('Nova senha temporária')
  expect((await page.locator('code').innerText()).trim()).not.toBe(password)

  page.once('dialog', (dialog) => void dialog.accept())
  await page.getByRole('row', { name: /equipe@teste.com/ }).getByRole('button', { name: 'Excluir' }).click()
  await expect(page.getByRole('row', { name: /equipe@teste.com/ })).toHaveCount(0)
  await other.close()
})

test('the current user has no delete or reset buttons', async ({ page }) => {
  await signInReady(page)
  await page.goto('/admin/usuarios')
  const own = page.getByRole('row', { name: /admin@teste.com/ })
  await expect(own).toContainText('você')
  await expect(own.getByRole('button')).toHaveCount(0)
})
