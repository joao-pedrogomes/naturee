import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import App from '@/App'
import SiteContentProvider from '@/content/SiteContentProvider'
import { defaultContent } from '@/content/defaultContent'
import { enabledRoutes } from '@/content/siteContent'

export function render(url: string): string {
  return renderToString(
    <StrictMode>
      <SiteContentProvider>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </SiteContentProvider>
    </StrictMode>,
  )
}

export function routesToPrerender(): string[] {
  return enabledRoutes(defaultContent).map((route) => route.path)
}

export const siteUrl = defaultContent.site.url
