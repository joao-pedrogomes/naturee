import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { ROUTE_CASES } from './routes'

for (const route of ROUTE_CASES) {
  test(`${route.path} has no axe violations`, async ({ page }) => {
    await page.goto(route.path)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    const summary = results.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`)
    expect(summary).toEqual([])
  })
}
