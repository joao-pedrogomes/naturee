import { createContext, useContext } from 'react'
import { defaultContent } from '@/content/defaultContent'
import type { Link, PageKey, SiteContent } from '@/content/types'
import { ROUTES, type RouteDef } from '@/routes'

export const SiteContentContext = createContext<SiteContent>(defaultContent)

export function enabledRoutes(content: SiteContent): RouteDef[] {
  return ROUTES.filter((route) => content.pages[route.key].enabled)
}

/** A link to a page that was switched off in the admin would only lead to a 404. */
export function visibleLinks(content: SiteContent, links: Link[]): Link[] {
  return links.filter((link) => {
    if (!link.enabled) return false
    const route = ROUTES.find((candidate) => candidate.path === link.href)
    return route ? content.pages[route.key].enabled : true
  })
}

export function useSiteContent(): SiteContent {
  return useContext(SiteContentContext)
}

export function usePage<K extends PageKey>(key: K): SiteContent['pages'][K] {
  return useSiteContent().pages[key]
}
