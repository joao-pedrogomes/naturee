import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import App from '@/App'
import AppProviders from '@/AppProviders'
import { defaultContent } from '@/content/defaultContent'
import { enabledRoutes } from '@/content/siteContent'

export function render(url: string): string {
  return renderToString(
    <StrictMode>
      <AppProviders>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </AppProviders>
    </StrictMode>,
  )
}

export function routesToPrerender(): string[] {
  return enabledRoutes(defaultContent).map((route) => route.path)
}

export const siteUrl = defaultContent.site.url
