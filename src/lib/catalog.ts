import { brands as defaultBrands } from '@/data/brands'
import { categories as defaultCategories } from '@/data/categories'
import { products as defaultProducts } from '@/data/products'
import type {
  Brand,
  CatalogQuery,
  CatalogSort,
  Category,
  Product,
  ProductQueryResult,
} from '@/types/catalog'

/**
 * The catalog data the query functions read from. Injecting a source keeps every
 * function pure and testable; when the PHP backend lands this module becomes fetch
 * calls with identical signatures.
 */
export type CatalogSource = {
  products: Product[]
  brands: Brand[]
  categories: Category[]
}

const defaultSource: CatalogSource = {
  products: defaultProducts,
  brands: defaultBrands,
  categories: defaultCategories,
}

export const DEFAULT_PER_PAGE = 12

/** Unicode combining diacritical marks, left over after an NFD decomposition. */
const COMBINING_MARKS = /[̀-ͯ]/g

/**
 * Lowercases and strips diacritics so "pate" matches "Patê" and "ACAI" matches "açaí".
 */
export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase()
}

function compareNames(a: string, b: string): number {
  return a.localeCompare(b, 'pt-BR')
}

/** Splits a query into normalized terms; every term must match (AND). */
function searchTerms(q: string | undefined): string[] {
  if (!q) return []
  return normalizeText(q).split(/\s+/).filter(Boolean)
}

function matchesTerms(haystack: string, terms: string[]): boolean {
  return terms.every((term) => haystack.includes(term))
}

function indexBy<T>(items: T[], key: (item: T) => string): Map<string, T> {
  return new Map(items.map((item) => [key(item), item]))
}

/**
 * Maps the selected slugs of a facet to entity ids, dropping unknown slugs. Returns
 * `null` when the facet should not be applied at all (nothing selected, or every
 * selected slug was unknown) — an unknown slug is ignored, never fatal.
 */
function facetIds(slugs: string[] | undefined, bySlug: Map<string, { id: string }>): Set<string> | null {
  if (!slugs || slugs.length === 0) return null
  const ids = slugs.map((slug) => bySlug.get(slug)?.id).filter((id): id is string => Boolean(id))
  return ids.length > 0 ? new Set(ids) : null
}

/** Positive integers only; anything malformed falls back to `fallback`. */
function toPositiveInt(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : fallback
}

function sortProducts(items: Product[], sort: CatalogSort, brandsById: Map<string, Brand>): Product[] {
  const brandName = (product: Product) => brandsById.get(product.brandId)?.name ?? ''

  // Sort a copy — the source arrays are never mutated.
  return [...items].sort((a, b) => {
    switch (sort) {
      case 'za': {
        const byName = compareNames(b.name, a.name)
        return byName !== 0 ? byName : compareNames(a.name, b.name)
      }
      case 'recentes': {
        const byDate = b.createdAt.localeCompare(a.createdAt)
        return byDate !== 0 ? byDate : compareNames(a.name, b.name)
      }
      case 'marca': {
        const byBrand = compareNames(brandName(a), brandName(b))
        return byBrand !== 0 ? byBrand : compareNames(a.name, b.name)
      }
      case 'az':
      default:
        return compareNames(a.name, b.name)
    }
  })
}

/**
 * Runs the catalog pipeline: search → filter → sort → paginate.
 *
 * Search is accent- and case-insensitive and covers product name, subtitle and brand
 * name. Values within one facet are OR'd, different facets are AND'd. `page` in the
 * result is the clamped page actually used.
 */
export function queryProducts(query: CatalogQuery, source: CatalogSource = defaultSource): ProductQueryResult {
  const brandsById = indexBy(source.brands, (brand) => brand.id)
  const brandsBySlug = indexBy(source.brands, (brand) => brand.slug)
  const categoriesBySlug = indexBy(source.categories, (category) => category.slug)

  // 1. Search.
  const terms = searchTerms(query.q)
  let items =
    terms.length === 0
      ? source.products
      : source.products.filter((product) => {
          const haystack = normalizeText(
            `${product.name} ${product.subtitle} ${brandsById.get(product.brandId)?.name ?? ''}`,
          )
          return matchesTerms(haystack, terms)
        })

  // 2. Filter.
  const brandIds = facetIds(query.marca, brandsBySlug)
  if (brandIds) items = items.filter((product) => brandIds.has(product.brandId))

  const categoryIds = facetIds(query.categoria, categoriesBySlug)
  if (categoryIds) items = items.filter((product) => categoryIds.has(product.categoryId))

  // 3. Sort.
  const sorted = sortProducts(items, query.ordenar ?? 'az', brandsById)

  // 4. Paginate.
  const total = sorted.length
  const perPage = toPositiveInt(query.perPage, DEFAULT_PER_PAGE)
  const pageCount = Math.max(1, Math.ceil(total / perPage))
  const requested = toPositiveInt(query.pagina, 1)
  const page = Math.min(Math.max(requested, 1), pageCount)
  const start = (page - 1) * perPage

  return { items: sorted.slice(start, start + perPage), total, pageCount, page }
}

/** Searches brand name and tagline, then sorts by name (`az` by default). */
export function queryBrands(
  query: { q?: string; ordenar?: 'az' | 'za' },
  source: CatalogSource = defaultSource,
): Brand[] {
  const terms = searchTerms(query.q)
  const matched =
    terms.length === 0
      ? source.brands
      : source.brands.filter((brand) => matchesTerms(normalizeText(`${brand.name} ${brand.tagline}`), terms))

  const descending = query.ordenar === 'za'
  return [...matched].sort((a, b) =>
    descending ? compareNames(b.name, a.name) : compareNames(a.name, b.name),
  )
}

export function getProduct(slug: string, source: CatalogSource = defaultSource): Product | undefined {
  return source.products.find((product) => product.slug === slug)
}

export function getBrand(slug: string, source: CatalogSource = defaultSource): Brand | undefined {
  return source.brands.find((brand) => brand.slug === slug)
}

export function getCategories(source: CatalogSource = defaultSource): Category[] {
  return [...source.categories]
}

/** Product count and the number of distinct categories those products span. */
export function getBrandStats(
  brandId: string,
  source: CatalogSource = defaultSource,
): { products: number; categories: number } {
  const owned = source.products.filter((product) => product.brandId === brandId)
  return {
    products: owned.length,
    categories: new Set(owned.map((product) => product.categoryId)).size,
  }
}
