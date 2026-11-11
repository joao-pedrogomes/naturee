import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { ROUTE_CASES } from './routes'

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

for (const route of ROUTE_CASES) {
  test(`${route.path} has no axe violations besides colour contrast`, async ({ page }) => {
    await page.goto(route.path)
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).disableRules(['color-contrast']).analyze()
    const summary = results.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`)
    expect(summary).toEqual([])
  })

  // The client's palette (olive on teal, cream on light olive) falls short of WCAG AA by design.
  // This reports the count without failing so regressions stay visible.
  test(`${route.path} colour contrast report`, async ({ page }) => {
    await page.goto(route.path)
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).include('body').analyze()
    const contrast = results.violations.find((violation) => violation.id === 'color-contrast')
    test.info().annotations.push({ type: 'contrast', description: `${contrast?.nodes.length ?? 0} elements below AA` })
  })
}
