import type { ContentField } from '@/admin/api/types'
import { pageLabel, sectionLabel } from '@/admin/content/labels'

export type FieldGroup = { id: string; title: string; fields: ContentField[] }
export type PageGroup = { id: string; title: string; path: string | undefined; groups: FieldGroup[] }

const PAGE_PATHS: Record<string, string> = {
  home: '/',
  about: '/sobre',
  products: '/marcas-e-produtos',
  logistics: '/logistica',
  contact: '/contato',
}

function locate(path: string): { page: string; section: string } | null {
  const [first, second, third] = path.split('.')
  if (first === 'site') return null
  if (first === 'pages') return { page: second, section: third === 'enabled' || third === undefined ? 'enabled' : third }
  return { page: 'shared', section: first }
}

/** Groups editable fields by page and section; `site.*` lives on the settings screen instead. */
export function groupFields(fields: ContentField[]): PageGroup[] {
  const pages = new Map<string, PageGroup>()
  for (const field of fields) {
    const place = locate(field.path)
    if (!place) continue
    const page =
      pages.get(place.page) ??
      { id: place.page, title: place.page === 'shared' ? 'Menu, rodapé e listas' : pageLabel(place.page), path: PAGE_PATHS[place.page], groups: [] }
    pages.set(place.page, page)

    const groupId = `${place.page}.${place.section}`
    let group = page.groups.find((candidate) => candidate.id === groupId)
    if (!group) {
      group = { id: groupId, title: sectionLabel(place.section), fields: [] }
      page.groups.push(group)
    }
    group.fields.push(field)
  }
  return [...pages.values()]
}
