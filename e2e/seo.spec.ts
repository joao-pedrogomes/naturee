import { expect, test } from '@playwright/test'
import { ROUTE_CASES } from './routes'

for (const route of ROUTE_CASES) {
  test(`${route.path} ships title, description, canonical and OG tags`, async ({ page, request }) => {
    const raw = await (await request.get(route.path)).text()
    expect(raw).toContain(`<title>${route.title.replace('&', '&amp;')}</title>`)
    expect(raw).toContain('<meta property="og:title"')
    expect(raw).toContain('<link rel="canonical"')
    expect(raw).toContain('<link rel="preload" as="font"')

    await page.goto(route.path)
    await expect(page).toHaveTitle(route.title)
    await expect(page.locator('title')).toHaveCount(1)
    await expect(page.locator('meta[name="description"]')).toHaveCount(1)
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1)
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /ogDefault\.jpg$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  })
}

test('sitemap lists every route and robots is served', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text()
  for (const route of ROUTE_CASES) {
    expect(sitemap).toContain(`<loc>https://naturee.com.br${route.path === '/' ? '/' : route.path}</loc>`)
  }
  const robots = await request.get('/robots.txt')
  expect(robots.status()).toBe(200)
  expect(await robots.text()).toContain('Sitemap:')
})
