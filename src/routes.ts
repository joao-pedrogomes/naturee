import type { PageKey } from '@/content/types'

export type RouteDef = { key: PageKey; path: string }

export const ROUTES: RouteDef[] = [
  { key: 'home', path: '/' },
  { key: 'about', path: '/sobre' },
  { key: 'products', path: '/marcas-e-produtos' },
  { key: 'logistics', path: '/logistica' },
  { key: 'contact', path: '/contato' },
]

export function pathFor(key: PageKey): string {
  const route = ROUTES.find((item) => item.key === key)
  if (!route) throw new Error(`Unknown page key: ${key}`)
  return route.path
}

export function isRoutePath(path: string): boolean {
  return ROUTES.some((route) => route.path === path)
}
