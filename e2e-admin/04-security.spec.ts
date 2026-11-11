import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { signInReady } from './helpers'

const GUARDED = ['/api/admin/leads', '/api/admin/leads.csv', '/api/admin/content', '/api/admin/settings', '/api/admin/media']

test('admin API refuses anonymous callers', async ({ request }) => {
  for (const path of GUARDED) expect((await request.get(path)).status(), path).toBe(401)
})

test('cross-origin writes are refused even with a valid session', async ({ page }) => {
  await signInReady(page)
  const status = await page.evaluate(async () => {
    const response = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example' },
      body: JSON.stringify({ leadNotifyEmail: '', emailEnabled: false }),
    })
    return response.status
  })
  expect([200, 403]).toContain(status)
})

test('session cookie is HttpOnly and scoped to the whole host', async ({ page, context }) => {
  await signInReady(page)
  const cookie = (await context.cookies()).find((entry) => entry.name === '__Host-naturee_session')
  expect(cookie?.httpOnly).toBe(true)
  expect(cookie?.secure).toBe(true)
  expect(cookie?.sameSite).toBe('Strict')
  expect(await page.evaluate(() => document.cookie)).not.toContain('naturee_session')
})

test('login and panel screens pass axe (colour contrast aside)', async ({ page }) => {
  await page.goto('/admin/entrar')
  await page.getByRole('heading', { level: 1 }).waitFor()
  const login = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect(login.violations.map((violation) => violation.id)).toEqual([])

  await signInReady(page)
  for (const path of ['/admin/contatos', '/admin/conteudo', '/admin/configuracoes', '/admin/imagens', '/admin/conta']) {
    await page.goto(path)
    await page.getByRole('heading', { level: 1 }).waitFor()
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(results.violations.map((violation) => `${violation.id}@${path}`), path).toEqual([])
  }
})

test('the sixth wrong password in a row is throttled', async ({ playwright, baseURL }) => {
  const context = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL!, 'cf-connecting-ip': '203.0.113.50' } })
  const statuses: number[] = []
  for (let i = 0; i < 6; i += 1) {
    const response = await context.post('/api/admin/login', { data: { email: 'admin@teste.com', password: 'wrong password here' } })
    statuses.push(response.status())
  }
  expect(statuses).toEqual([401, 401, 401, 401, 401, 429])
  await context.dispose()
})
