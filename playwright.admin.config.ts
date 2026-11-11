import { defineConfig, devices } from '@playwright/test'

const PORT = 8788

export default defineConfig({
  testDir: './e2e-admin',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run e2e:admin:serve',
    url: `http://localhost:${PORT}/sitemap.xml`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
})
