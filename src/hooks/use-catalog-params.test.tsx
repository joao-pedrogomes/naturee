import type { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { MemoryRouter, useLocation, useNavigationType } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { useCatalogParams } from '@/hooks/use-catalog-params'

function setup(initialEntry = '/produtos') {
  function wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
  }

  return renderHook(
    () => ({
      params: useCatalogParams(),
      search: useLocation().search,
      navigationType: useNavigationType(),
    }),
    { wrapper },
  )
}

function params(search: string) {
  return new URLSearchParams(search)
}

describe('useCatalogParams — parsing', () => {
  it('falls back to the defaults when no params are present', () => {
    const { result } = setup('/produtos')

    expect(result.current.params).toMatchObject({
      view: 'produtos',
      q: '',
      marca: [],
      categoria: [],
      ordenar: 'az',
      pagina: 1,
    })
  })

  it('reads every param from the URL', () => {
    const { result } = setup(
      '/produtos?view=marcas&q=mel&marca=mel-do-vale,sitio-pura-vida&categoria=pates&ordenar=za&pagina=3',
    )

    expect(result.current.params).toMatchObject({
      view: 'marcas',
      q: 'mel',
      marca: ['mel-do-vale', 'sitio-pura-vida'],
      categoria: ['pates'],
      ordenar: 'za',
      pagina: 3,
    })
  })

  it.each(['recentes', 'marca', 'az', 'za'] as const)('accepts ordenar=%s', (ordenar) => {
    const { result } = setup(`/produtos?ordenar=${ordenar}`)

    expect(result.current.params.ordenar).toBe(ordenar)
  })

  it('decodes an encoded query', () => {
    const { result } = setup('/produtos?q=cogumelo%20fatiado')

    expect(result.current.params.q).toBe('cogumelo fatiado')
  })
})

describe('useCatalogParams — malformed input', () => {
  it.each([
    ['abc', 1],
    ['-3', 1],
    ['0', 1],
    ['2.5', 1],
    ['', 1],
    ['1e3', 1],
    ['NaN', 1],
    ['4', 4],
  ])('parses ?pagina=%s as %i', (raw, expected) => {
    const { result } = setup(`/produtos?pagina=${raw}`)

    expect(result.current.params.pagina).toBe(expected)
  })

  it('falls back to produtos for an unknown view', () => {
    const { result } = setup('/produtos?view=xyz')

    expect(result.current.params.view).toBe('produtos')
  })

  it('falls back to az for an unknown sort', () => {
    const { result } = setup('/produtos?ordenar=bogus')

    expect(result.current.params.ordenar).toBe('az')
  })

  it('drops empty comma segments and trims values', () => {
    const { result } = setup('/produtos?marca=,,mel-do-vale,%20,&categoria=pates,%20conservas')

    expect(result.current.params.marca).toEqual(['mel-do-vale'])
    expect(result.current.params.categoria).toEqual(['pates', 'conservas'])
  })

  it('drops duplicate facet values', () => {
    const { result } = setup('/produtos?marca=mel-do-vale,mel-do-vale')

    expect(result.current.params.marca).toEqual(['mel-do-vale'])
  })
})

describe('useCatalogParams — writing', () => {
  it('omits defaults from the URL', () => {
    const { result } = setup('/produtos?view=marcas&ordenar=za&pagina=4&q=mel')

    act(() => result.current.params.setView('produtos'))
    act(() => result.current.params.setSort('az'))
    act(() => result.current.params.setQuery(''))

    expect(params(result.current.search).toString()).toBe('')
  })

  it('writes a non-default view', () => {
    const { result } = setup('/produtos')

    act(() => result.current.params.setView('marcas'))

    expect(params(result.current.search).get('view')).toBe('marcas')
    expect(result.current.params.view).toBe('marcas')
  })

  it('keeps the other params when switching view', () => {
    const { result } = setup('/produtos?q=mel&categoria=pates&ordenar=za&pagina=2')

    act(() => result.current.params.setView('marcas'))

    expect(result.current.params).toMatchObject({
      view: 'marcas',
      q: 'mel',
      categoria: ['pates'],
      ordenar: 'za',
      pagina: 2,
    })
  })

  it('writes the query and drops it again when emptied', () => {
    const { result } = setup('/produtos')

    act(() => result.current.params.setQuery('shiitake'))
    expect(result.current.params.q).toBe('shiitake')

    act(() => result.current.params.setQuery('   '))
    expect(params(result.current.search).has('q')).toBe(false)
    expect(result.current.params.q).toBe('')
  })

  it('writes pagina only above 1', () => {
    const { result } = setup('/produtos')

    act(() => result.current.params.setPage(3))
    expect(params(result.current.search).get('pagina')).toBe('3')

    act(() => result.current.params.setPage(1))
    expect(params(result.current.search).has('pagina')).toBe(false)

    act(() => result.current.params.setPage(-2))
    expect(params(result.current.search).has('pagina')).toBe(false)
    expect(result.current.params.pagina).toBe(1)
  })

  it('toggles a facet value on and off', () => {
    const { result } = setup('/produtos')

    act(() => result.current.params.toggleFilter('marca', 'mel-do-vale'))
    expect(result.current.params.marca).toEqual(['mel-do-vale'])

    act(() => result.current.params.toggleFilter('marca', 'sitio-pura-vida'))
    expect(result.current.params.marca).toEqual(['mel-do-vale', 'sitio-pura-vida'])
    expect(params(result.current.search).get('marca')).toBe('mel-do-vale,sitio-pura-vida')

    act(() => result.current.params.toggleFilter('marca', 'mel-do-vale'))
    expect(result.current.params.marca).toEqual(['sitio-pura-vida'])

    act(() => result.current.params.toggleFilter('marca', 'sitio-pura-vida'))
    expect(result.current.params.marca).toEqual([])
    expect(params(result.current.search).has('marca')).toBe(false)
  })

  it('toggles the two facets independently', () => {
    const { result } = setup('/produtos')

    act(() => result.current.params.toggleFilter('marca', 'mel-do-vale'))
    act(() => result.current.params.toggleFilter('categoria', 'pates'))

    expect(result.current.params.marca).toEqual(['mel-do-vale'])
    expect(result.current.params.categoria).toEqual(['pates'])
  })

  it('preserves unrelated params', () => {
    const { result } = setup('/produtos?utm_source=news')

    act(() => result.current.params.setPage(2))

    expect(params(result.current.search).get('utm_source')).toBe('news')
  })
})

describe('useCatalogParams — page reset', () => {
  it.each([
    ['setQuery', (p: ReturnType<typeof useCatalogParams>) => p.setQuery('mel')],
    ['toggleFilter marca', (p: ReturnType<typeof useCatalogParams>) => p.toggleFilter('marca', 'mel-do-vale')],
    [
      'toggleFilter categoria',
      (p: ReturnType<typeof useCatalogParams>) => p.toggleFilter('categoria', 'pates'),
    ],
    ['setSort', (p: ReturnType<typeof useCatalogParams>) => p.setSort('recentes')],
  ])('resets pagina to 1 on %s', (_label, change) => {
    const { result } = setup('/produtos?pagina=5')

    act(() => change(result.current.params))

    expect(result.current.params.pagina).toBe(1)
    expect(params(result.current.search).has('pagina')).toBe(false)
  })

  it('keeps the page when only the view changes', () => {
    const { result } = setup('/produtos?pagina=5')

    act(() => result.current.params.setView('marcas'))

    expect(result.current.params.pagina).toBe(5)
  })
})

describe('useCatalogParams — clearFilters', () => {
  it('clears q, marca, categoria and the page but keeps view and sort', () => {
    const { result } = setup(
      '/produtos?view=marcas&q=mel&marca=mel-do-vale&categoria=pates&ordenar=za&pagina=3',
    )

    act(() => result.current.params.clearFilters())

    expect(result.current.params).toMatchObject({
      view: 'marcas',
      q: '',
      marca: [],
      categoria: [],
      ordenar: 'za',
      pagina: 1,
    })
    expect(params(result.current.search).has('q')).toBe(false)
    expect(params(result.current.search).has('marca')).toBe(false)
    expect(params(result.current.search).has('categoria')).toBe(false)
  })
})

describe('useCatalogParams — activeFilterCount', () => {
  it('is 0 with no filters', () => {
    const { result } = setup('/produtos?view=marcas&ordenar=za&pagina=2')

    expect(result.current.params.activeFilterCount).toBe(0)
  })

  it('counts every facet selection plus the query', () => {
    const { result } = setup('/produtos?q=mel&marca=a,b&categoria=pates')

    expect(result.current.params.activeFilterCount).toBe(4)
  })

  it('does not count a blank query', () => {
    const { result } = setup('/produtos?q=%20&marca=a')

    expect(result.current.params.activeFilterCount).toBe(1)
  })
})

describe('useCatalogParams — navigation mode', () => {
  it('replaces history when the query changes', () => {
    const { result } = setup('/produtos')

    act(() => result.current.params.setQuery('mel'))

    expect(result.current.navigationType).toBe('REPLACE')
  })

  it.each([
    ['setView', (p: ReturnType<typeof useCatalogParams>) => p.setView('marcas')],
    ['setPage', (p: ReturnType<typeof useCatalogParams>) => p.setPage(2)],
    ['setSort', (p: ReturnType<typeof useCatalogParams>) => p.setSort('za')],
    ['toggleFilter', (p: ReturnType<typeof useCatalogParams>) => p.toggleFilter('marca', 'x')],
    ['clearFilters', (p: ReturnType<typeof useCatalogParams>) => p.clearFilters()],
  ])('pushes history on %s', (_label, change) => {
    const { result } = setup('/produtos?q=mel')

    act(() => change(result.current.params))

    expect(result.current.navigationType).toBe('PUSH')
  })
})

describe('useCatalogParams — applyParams', () => {
  it('writes view and facet in a single navigation', () => {
    const { result } = setup('/produtos?view=marcas&pagina=3')

    act(() =>
      result.current.params.applyParams({ view: 'produtos', marca: ['sitio-pura-vida'] }),
    )

    expect(params(result.current.search).get('marca')).toBe('sitio-pura-vida')
    expect(params(result.current.search).get('view')).toBeNull()
    expect(params(result.current.search).get('pagina')).toBeNull()
  })

  it('survives where two sequential setters would clobber each other', () => {
    const { result } = setup('/produtos?view=marcas')

    // Both setters derive from the current location, so the second write wins
    // and the brand filter is lost. This is the bug applyParams exists to avoid.
    act(() => {
      result.current.params.toggleFilter('marca', 'mel-do-vale')
      result.current.params.setView('produtos')
    })
    expect(params(result.current.search).get('marca')).toBeNull()

    act(() =>
      result.current.params.applyParams({ view: 'produtos', marca: ['mel-do-vale'] }),
    )
    expect(params(result.current.search).get('marca')).toBe('mel-do-vale')
  })

  it('clears a whole facet without touching the other one', () => {
    const { result } = setup('/produtos?marca=a,b&categoria=pates&q=mel')

    act(() => result.current.params.applyParams({ marca: [] }))

    expect(params(result.current.search).get('marca')).toBeNull()
    expect(params(result.current.search).get('categoria')).toBe('pates')
    expect(params(result.current.search).get('q')).toBe('mel')
  })

  it('keeps the current page when only the view changes', () => {
    const { result } = setup('/produtos?pagina=2')

    act(() => result.current.params.applyParams({ view: 'marcas' }))

    expect(params(result.current.search).get('pagina')).toBe('2')
  })
})
