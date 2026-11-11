import { expect, test, type Page } from '@playwright/test'
import { ROUTE_CASES } from './routes'

async function collectErrors(page: Page): Promise<string[]> {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  return errors
}

async function scrollThrough(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = window.innerHeight
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
    window.scrollTo(0, 0)
  })
}

for (const route of ROUTE_CASES) {
  test.describe(route.path, () => {
    test('renders one h1, no errors and no horizontal overflow', async ({ page }) => {
      const errors = await collectErrors(page)
      const response = await page.goto(route.path)
      expect(response?.status()).toBe(200)

      const headings = page.getByRole('heading', { level: 1 })
      await expect(headings).toHaveCount(1)
      await expect(headings.first()).toHaveText(route.h1)

      await scrollThrough(page)
      const overflow = await page.evaluate(() => ({
        doc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        body: document.body.scrollWidth - document.body.clientWidth,
      }))
      expect(overflow.doc, 'documentElement overflow').toBeLessThanOrEqual(0)
      expect(overflow.body, 'body overflow').toBeLessThanOrEqual(0)
      expect(errors).toEqual([])
    })

    test('every image has alt text and loads', async ({ page }) => {
      await page.goto(route.path)
      await scrollThrough(page)
      await page.waitForLoadState('networkidle')
      const broken = await page.evaluate(() =>
        [...document.images]
          .filter((img) => !img.hasAttribute('alt') || (img.complete && img.naturalWidth === 0))
          .map((img) => img.getAttribute('src')?.slice(0, 80) ?? '(no src)'),
      )
      expect(broken).toEqual([])
    })

    test('interactive targets are large enough on touch devices', async ({ page, isMobile }) => {
      test.skip(!isMobile, 'tap target check only matters on touch viewports')
      await page.goto(route.path)
      await scrollThrough(page)
      const small = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('a[href], button, input, textarea')]
          .filter((element) => {
            const rect = element.getBoundingClientRect()
            // sr-only elements are 1px boxes until focused; they are not tap targets.
            const visible = rect.width > 1 && rect.height > 1
            return visible && (rect.height < 24 || rect.width < 24)
          })
          .map((element) => `${element.tagName}:${(element.textContent ?? element.getAttribute('aria-label') ?? '').trim().slice(0, 30)}`),
      )
      expect(small).toEqual([])
    })
  })
}
