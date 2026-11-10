import { createContext, useContext } from 'react'
import { defaultContent } from '@/content/defaultContent'
import type { PageKey, SiteContent } from '@/content/types'
import { ROUTES, type RouteDef } from '@/routes'

export const SiteContentContext = createContext<SiteContent>(defaultContent)

export function enabledRoutes(content: SiteContent): RouteDef[] {
  return ROUTES.filter((route) => content.pages[route.key].enabled)
}

export function useSiteContent(): SiteContent {
  return useContext(SiteContentContext)
}

export function usePage<K extends PageKey>(key: K): SiteContent['pages'][K] {
  return useSiteContent().pages[key]
}
