import { describe, expect, it } from 'vitest'
import type { ContentField } from '@/admin/api/types'
import { groupFields } from '@/admin/content/contentGroups'
import { fieldLabel, shortFieldLabel } from '@/admin/content/labels'

function text(path: string): ContentField {
  return { path, kind: 'text', value: 'x', defaultValue: 'x', overridden: false }
}

describe('groupFields', () => {
  it('groups by page then section and skips site fields', () => {
    const groups = groupFields([
      text('pages.home.hero.title'),
      text('pages.home.hero.text'),
      text('pages.home.about.title'),
      text('pages.home.enabled'),
      text('pages.about.hero.title'),
      text('nav.0.label'),
      text('site.email'),
    ])
    expect(groups.map((page) => page.id)).toEqual(['home', 'about', 'shared'])
    expect(groups[0].groups.map((group) => group.title)).toEqual(['Topo', 'Sobre nós', 'Página'])
    expect(groups[0].groups[0].fields).toHaveLength(2)
    expect(groups[0].path).toBe('/')
    expect(groups[2].groups[0].title).toBe('Menu principal')
  })
})

describe('labels', () => {
  it('builds readable names from paths', () => {
    expect(fieldLabel('pages.home.hero.title')).toBe('Início › Topo › Título')
    expect(fieldLabel('pages.home.features.cards.0.title')).toBe('Início › Diferenciais › Cartão › 1 › Título')
    expect(fieldLabel('site.whatsapp')).toBe('WhatsApp dos botões do site (com DDD)')
    expect(shortFieldLabel('pages.home.hero.primary.label')).toBe('Botão principal › Rótulo')
    expect(shortFieldLabel('pages.home.enabled')).toBe('Página ativa')
  })
})
