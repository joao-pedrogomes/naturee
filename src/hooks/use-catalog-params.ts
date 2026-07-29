import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import type { CatalogSort, CatalogView } from '@/types/catalog'

/** Facets that serialize as a comma-separated list of slugs. */
export type CatalogFacet = 'marca' | 'categoria'

type CatalogParamsState = {
  view: CatalogView
  q: string
  marca: string[]
  categoria: string[]
  ordenar: CatalogSort
  pagina: number
}

const VIEWS: readonly CatalogView[] = ['produtos', 'marcas']
const SORTS: readonly CatalogSort[] = ['az', 'za', 'recentes', 'marca']

const DEFAULT_VIEW: CatalogView = 'produtos'
const DEFAULT_SORT: CatalogSort = 'az'
const DEFAULT_PAGE = 1

/** Params this hook owns; anything else in the URL is preserved untouched. */
const OWNED_KEYS = new Set(['view', 'q', 'marca', 'categoria', 'ordenar', 'pagina'])

function parseView(raw: string | null): CatalogView {
  return VIEWS.find((view) => view === raw) ?? DEFAULT_VIEW
}

function parseSort(raw: string | null): CatalogSort {
  return SORTS.find((sort) => sort === raw) ?? DEFAULT_SORT
}

function parsePage(raw: string | null): number {
  if (raw === null || !/^\d+$/.test(raw)) return DEFAULT_PAGE
  const page = Number(raw)
  return page >= 1 ? page : DEFAULT_PAGE
}

function parseList(raw: string | null): string[] {
  if (!raw) return []
  const values: string[] = []
  for (const part of raw.split(',')) {
    const value = part.trim()
    if (value && !values.includes(value)) values.push(value)
  }
  return values
}

function parse(searchParams: URLSearchParams): CatalogParamsState {
  return {
    view: parseView(searchParams.get('view')),
    q: (searchParams.get('q') ?? '').trim(),
    marca: parseList(searchParams.get('marca')),
    categoria: parseList(searchParams.get('categoria')),
    ordenar: parseSort(searchParams.get('ordenar')),
    pagina: parsePage(searchParams.get('pagina')),
  }
}

/** Writes the state back in a stable key order, omitting every default. */
function serialize(state: CatalogParamsState, current: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams()
  if (state.view !== DEFAULT_VIEW) next.set('view', state.view)
  if (state.q) next.set('q', state.q)
  if (state.marca.length > 0) next.set('marca', state.marca.join(','))
  if (state.categoria.length > 0) next.set('categoria', state.categoria.join(','))
  if (state.ordenar !== DEFAULT_SORT) next.set('ordenar', state.ordenar)
  if (state.pagina > DEFAULT_PAGE) next.set('pagina', String(state.pagina))

  for (const [key, value] of current) {
    if (!OWNED_KEYS.has(key)) next.append(key, value)
  }

  return next
}

/**
 * Single owner of the `/produtos` URL contract. Components never touch
 * `useSearchParams` directly. Debouncing belongs to the controls, not here.
 */
export function useCatalogParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const state = useMemo(() => parse(searchParams), [searchParams])

  const commit = useCallback(
    (
      update: (prev: CatalogParamsState) => Partial<CatalogParamsState>,
      options?: { replace?: boolean },
    ) => {
      setSearchParams(
        (prev) => {
          const prevState = parse(prev)
          return serialize({ ...prevState, ...update(prevState) }, prev)
        },
        { replace: options?.replace ?? false },
      )
    },
    [setSearchParams],
  )

  const setView = useCallback(
    (view: CatalogView) => commit(() => ({ view })),
    [commit],
  )

  const setQuery = useCallback(
    (q: string) => commit(() => ({ q: q.trim(), pagina: DEFAULT_PAGE }), { replace: true }),
    [commit],
  )

  const toggleFilter = useCallback(
    (facet: CatalogFacet, value: string) =>
      commit((prev) => {
        const selected = prev[facet]
        const next = selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected, value]
        return facet === 'marca'
          ? { marca: next, pagina: DEFAULT_PAGE }
          : { categoria: next, pagina: DEFAULT_PAGE }
      }),
    [commit],
  )

  const setSort = useCallback(
    (ordenar: CatalogSort) => commit(() => ({ ordenar, pagina: DEFAULT_PAGE })),
    [commit],
  )

  const setPage = useCallback(
    (pagina: number) =>
      commit(() => ({
        pagina: Number.isInteger(pagina) && pagina > DEFAULT_PAGE ? pagina : DEFAULT_PAGE,
      })),
    [commit],
  )

  const clearFilters = useCallback(
    () =>
      commit(() => ({ q: '', marca: [], categoria: [], pagina: DEFAULT_PAGE })),
    [commit],
  )

  /**
   * Writes several params in one navigation.
   *
   * Calling two setters in the same tick does NOT compose: React Router derives
   * each update from the current location rather than from a queue, so the last
   * write wins and the earlier one is silently lost. Anything that changes more
   * than one param at once (picking a brand from the Marcas tab, clearing a whole
   * facet) must go through here.
   */
  const applyParams = useCallback(
    (partial: Partial<CatalogParamsState>) =>
      commit((prev) => {
        const touchesFilters =
          'q' in partial ||
          'marca' in partial ||
          'categoria' in partial ||
          'ordenar' in partial
        return {
          ...partial,
          pagina:
            'pagina' in partial
              ? partial.pagina
              : touchesFilters
                ? DEFAULT_PAGE
                : prev.pagina,
        }
      }),
    [commit],
  )

  const activeFilterCount =
    state.marca.length + state.categoria.length + (state.q ? 1 : 0)

  return useMemo(
    () => ({
      ...state,
      setView,
      setQuery,
      toggleFilter,
      setSort,
      setPage,
      clearFilters,
      applyParams,
      activeFilterCount,
    }),
    [
      state,
      setView,
      setQuery,
      toggleFilter,
      setSort,
      setPage,
      clearFilters,
      applyParams,
      activeFilterCount,
    ],
  )
}
