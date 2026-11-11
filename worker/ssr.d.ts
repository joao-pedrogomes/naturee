declare module '@ssr' {
  import type { SiteContent } from '../src/content/types'

  export function render(url: string, content?: SiteContent): string
  export function routesToPrerender(): string[]
  export const defaultContent: SiteContent
  export function enabledRoutes(content: SiteContent): { key: string; path: string }[]
}
