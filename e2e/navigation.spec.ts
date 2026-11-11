import { expect, test } from '@playwright/test'
import { WHATSAPP_URL } from './routes'

test('desktop nav navigates and marks the current page', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop nav is hidden on mobile')
  await page.goto('/')
  const primary = page.getByRole('navigation', { name: 'Principal' })
  await expect(primary.getByRole('link', { name: 'Início' })).toHaveAttribute('aria-current', 'page')
  await primary.getByRole('link', { name: 'Sobre' }).click()
  await expect(page).toHaveURL(/\/sobre$/)
  await expect(primary.getByRole('link', { name: 'Sobre' })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Conectando/)
})

test('mobile menu opens, navigates and closes', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'hamburger only exists on mobile')
  await page.goto('/')
  await page.getByRole('button', { name: 'Abrir menu' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('link', { name: 'Logística' }).click()
  await expect(page).toHaveURL(/\/logistica$/)
  await expect(dialog).toBeHidden()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Cuidado em cada rota/)
})

test('mobile menu closes with Escape', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'hamburger only exists on mobile')
  await page.goto('/sobre')
  await page.getByRole('button', { name: 'Abrir menu' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
})

test('skip link moves focus to the main content', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit does not move focus with Tab by default')
  await page.goto('/')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Pular para o conteúdo' })
  await expect(skip).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#conteudo$/)
})

test('header WhatsApp pill links to the business number', async ({ page, isMobile }) => {
  await page.goto('/')
  if (isMobile) await page.getByRole('button', { name: 'Abrir menu' }).click()
  const pill = page.getByRole('link', { name: /Fale com a Naturee/i }).first()
  await expect(pill).toHaveAttribute('href', WHATSAPP_URL)
  await expect(pill).toHaveAttribute('target', '_blank')
})

test('brand carousel scrolls with the next button', async ({ page }) => {
  await page.goto('/')
  const next = page.getByRole('button', { name: 'Próximas marcas' })
  await next.scrollIntoViewIfNeeded()
  const track = page.locator('ul.snap-x')
  const before = await track.evaluate((element) => element.scrollLeft)
  await next.click()
  await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBeGreaterThan(before)
})

test('unknown paths show the not found page', async ({ page }) => {
  await page.goto('/nada-por-aqui')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Página não encontrada')
  await page.getByRole('link', { name: 'Voltar ao início' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Curadoria/)
})

test('header follows the scroll and returns to its place at the top', async ({ page }) => {
  await page.goto('/sobre')
  const header = page.locator('header')
  const resting = await header.boundingBox()
  expect(resting?.y).toBe(0)
  await page.evaluate(() => window.scrollTo(0, 1200))
  await expect.poll(async () => (await header.boundingBox())?.y).toBe(0)
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect.poll(async () => (await header.boundingBox())?.height).toBe(resting?.height)
})
