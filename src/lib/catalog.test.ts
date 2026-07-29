import { describe, expect, it } from 'vitest'

import {
  getBrand,
  getBrandStats,
  getCategories,
  getProduct,
  normalizeText,
  queryBrands,
  queryProducts,
  type CatalogSource,
} from '@/lib/catalog'
import type { Brand, Category, Product } from '@/types/catalog'

// ---------------------------------------------------------------------------
// Fixtures — the tests are fully self-contained and never touch the real mock
// data, so they stay stable while `src/data/*` evolves.
// ---------------------------------------------------------------------------

const categories: Category[] = [
  { id: 'c-queijos', slug: 'queijos', name: 'Queijos' },
  { id: 'c-doces', slug: 'doces', name: 'Doces' },
  { id: 'c-conservas', slug: 'conservas', name: 'Conservas' },
]

function makeBrand(brand: Pick<Brand, 'id' | 'slug' | 'name' | 'tagline'> & Partial<Brand>): Brand {
  return {
    description: 'Descrição da marca.',
    origin: 'Antônio Carlos, SC',
    logo: '/logo.png',
    cover: '/cover.jpg',
    categoryIds: [],
    ...brand,
  }
}

const brands: Brand[] = [
  makeBrand({
    id: 'b-serra',
    slug: 'serra-verde',
    name: 'Serra Verde',
    tagline: 'Laticínios artesanais da montanha',
    categoryIds: ['c-queijos', 'c-doces'],
  }),
  makeBrand({
    id: 'b-acai',
    slug: 'acai-do-para',
    name: 'Açaí do Pará',
    tagline: 'Polpas congeladas direto do Norte',
    categoryIds: ['c-doces'],
  }),
  makeBrand({
    id: 'b-boamesa',
    slug: 'boa-mesa',
    name: 'Boa Mesa',
    tagline: 'Conservas e antepastos',
    categoryIds: ['c-conservas'],
  }),
]

function makeProduct(
  product: Pick<Product, 'id' | 'slug' | 'name' | 'subtitle' | 'brandId' | 'categoryId' | 'createdAt'> &
    Partial<Product>,
): Product {
  return {
    image: '/product.jpg',
    description: 'Descrição do produto.',
    specs: [{ label: 'Peso', value: '200g' }],
    moq: { qty: 10, unit: 'caixas' },
    available: true,
    ...product,
  }
}

// az order (localeCompare pt-BR):
//   Açaí Tradicional, Antepasto de Berinjela, Doce de Leite, Patê de Alho, Queijo Colonial
const products: Product[] = [
  makeProduct({
    id: 'p-pate',
    slug: 'pate-de-alho',
    name: 'Patê de Alho',
    subtitle: 'Pote de vidro 180g',
    brandId: 'b-boamesa',
    categoryId: 'c-conservas',
    createdAt: '2026-01-10',
  }),
  makeProduct({
    id: 'p-acai',
    slug: 'acai-tradicional',
    name: 'Açaí Tradicional',
    subtitle: 'Polpa congelada 1kg',
    brandId: 'b-acai',
    categoryId: 'c-doces',
    createdAt: '2026-05-02',
  }),
  makeProduct({
    id: 'p-queijo',
    slug: 'queijo-colonial',
    name: 'Queijo Colonial',
    subtitle: 'Fatiado · bandeja 200g',
    brandId: 'b-serra',
    categoryId: 'c-queijos',
    createdAt: '2026-03-15',
  }),
  makeProduct({
    id: 'p-antepasto',
    slug: 'antepasto-de-berinjela',
    name: 'Antepasto de Berinjela',
    subtitle: 'Pote de vidro 300g',
    brandId: 'b-boamesa',
    categoryId: 'c-conservas',
    createdAt: '2026-03-15',
  }),
  makeProduct({
    id: 'p-doce',
    slug: 'doce-de-leite',
    name: 'Doce de Leite',
    subtitle: 'Lata 400g',
    brandId: 'b-serra',
    categoryId: 'c-doces',
    createdAt: '2026-02-01',
  }),
]

const source: CatalogSource = { products, brands, categories }

const ids = (result: { items: Product[] }) => result.items.map((item) => item.id)

describe('normalizeText', () => {
  it('lowercases and strips diacritics', () => {
    expect(normalizeText('Patê')).toBe('pate')
    expect(normalizeText('AÇAÍ')).toBe('acai')
    expect(normalizeText('Antônio Carlos, SC')).toBe('antonio carlos, sc')
  })

  it('leaves plain ascii untouched and handles empty input', () => {
    expect(normalizeText('boa mesa')).toBe('boa mesa')
    expect(normalizeText('')).toBe('')
  })
})

describe('queryProducts — search', () => {
  it('matches product name ignoring accents', () => {
    expect(ids(queryProducts({ q: 'pate' }, source))).toEqual(['p-pate'])
  })

  it('matches product name ignoring case', () => {
    expect(ids(queryProducts({ q: 'ACAI TRADICIONAL' }, source))).toEqual(['p-acai'])
  })

  it('matches the product subtitle', () => {
    expect(ids(queryProducts({ q: 'bandeja' }, source))).toEqual(['p-queijo'])
  })

  it('matches the brand name of the product', () => {
    // Neither product name nor subtitle contains "serra" — only the brand does.
    expect(ids(queryProducts({ q: 'serra' }, source))).toEqual(['p-doce', 'p-queijo'])
  })

  it('matches an accented brand name from an unaccented query', () => {
    expect(ids(queryProducts({ q: 'PARA' }, source))).toEqual(['p-acai'])
  })

  it('ignores an empty or whitespace-only query', () => {
    expect(queryProducts({ q: '   ' }, source).total).toBe(5)
    expect(queryProducts({ q: '' }, source).total).toBe(5)
  })

  it('returns the empty-result shape when nothing matches', () => {
    const result = queryProducts({ q: 'xyzzy' }, source)
    expect(result).toEqual({ items: [], total: 0, pageCount: 1, page: 1 })
  })
})

describe('queryProducts — facets', () => {
  it('filters by brand slug alone', () => {
    expect(ids(queryProducts({ marca: ['boa-mesa'] }, source))).toEqual(['p-antepasto', 'p-pate'])
  })

  it('filters by category slug alone', () => {
    expect(ids(queryProducts({ categoria: ['doces'] }, source))).toEqual(['p-acai', 'p-doce'])
  })

  it("OR's multiple values within a single facet", () => {
    expect(ids(queryProducts({ categoria: ['queijos', 'doces'] }, source))).toEqual([
      'p-acai',
      'p-doce',
      'p-queijo',
    ])
  })

  it("AND's different facets", () => {
    expect(ids(queryProducts({ marca: ['serra-verde'], categoria: ['doces'] }, source))).toEqual(['p-doce'])
  })

  it('combines search with facets', () => {
    expect(ids(queryProducts({ q: 'pote', marca: ['boa-mesa'] }, source))).toEqual([
      'p-antepasto',
      'p-pate',
    ])
    expect(ids(queryProducts({ q: 'pote', categoria: ['doces'] }, source))).toEqual([])
  })

  it('ignores an unknown brand slug instead of emptying the result', () => {
    expect(queryProducts({ marca: ['marca-inexistente'] }, source).total).toBe(5)
  })

  it('ignores an unknown category slug instead of emptying the result', () => {
    expect(queryProducts({ categoria: ['categoria-inexistente'] }, source).total).toBe(5)
  })

  it('keeps the known values when a facet mixes known and unknown slugs', () => {
    expect(ids(queryProducts({ marca: ['boa-mesa', 'nao-existe'] }, source))).toEqual([
      'p-antepasto',
      'p-pate',
    ])
  })

  it('ignores empty facet arrays', () => {
    expect(queryProducts({ marca: [], categoria: [] }, source).total).toBe(5)
  })
})

describe('queryProducts — sorting', () => {
  it('defaults to "az" when no sort is given', () => {
    expect(ids(queryProducts({ perPage: 10 }, source))).toEqual(
      ids(queryProducts({ ordenar: 'az', perPage: 10 }, source)),
    )
  })

  it('sorts "az" by product name ascending', () => {
    expect(ids(queryProducts({ ordenar: 'az', perPage: 10 }, source))).toEqual([
      'p-acai',
      'p-antepasto',
      'p-doce',
      'p-pate',
      'p-queijo',
    ])
  })

  it('sorts "za" by product name descending', () => {
    expect(ids(queryProducts({ ordenar: 'za', perPage: 10 }, source))).toEqual([
      'p-queijo',
      'p-pate',
      'p-doce',
      'p-antepasto',
      'p-acai',
    ])
  })

  it('sorts "recentes" by createdAt descending, breaking ties by name ascending', () => {
    // p-antepasto and p-queijo share createdAt 2026-03-15.
    expect(ids(queryProducts({ ordenar: 'recentes', perPage: 10 }, source))).toEqual([
      'p-acai',
      'p-antepasto',
      'p-queijo',
      'p-doce',
      'p-pate',
    ])
  })

  it('sorts "marca" by brand name ascending, then product name ascending', () => {
    // Brands az: Açaí do Pará, Boa Mesa, Serra Verde.
    expect(ids(queryProducts({ ordenar: 'marca', perPage: 10 }, source))).toEqual([
      'p-acai',
      'p-antepasto',
      'p-pate',
      'p-doce',
      'p-queijo',
    ])
  })
})

describe('queryProducts — pagination', () => {
  it('defaults perPage to 12 so the fixture fits on one page', () => {
    const result = queryProducts({}, source)
    expect(result.items).toHaveLength(5)
    expect(result.total).toBe(5)
    expect(result.pageCount).toBe(1)
    expect(result.page).toBe(1)
  })

  it('splits results across pages', () => {
    const first = queryProducts({ perPage: 2, pagina: 1 }, source)
    expect(ids(first)).toEqual(['p-acai', 'p-antepasto'])
    expect(first).toMatchObject({ total: 5, pageCount: 3, page: 1 })

    const second = queryProducts({ perPage: 2, pagina: 2 }, source)
    expect(ids(second)).toEqual(['p-doce', 'p-pate'])
    expect(second).toMatchObject({ total: 5, pageCount: 3, page: 2 })

    const third = queryProducts({ perPage: 2, pagina: 3 }, source)
    expect(ids(third)).toEqual(['p-queijo'])
    expect(third).toMatchObject({ total: 5, pageCount: 3, page: 3 })
  })

  it('clamps a page above the range to the last page', () => {
    const result = queryProducts({ perPage: 2, pagina: 99 }, source)
    expect(result.page).toBe(3)
    expect(ids(result)).toEqual(['p-queijo'])
  })

  it('clamps a page below the range to the first page', () => {
    expect(queryProducts({ perPage: 2, pagina: 0 }, source).page).toBe(1)
    expect(queryProducts({ perPage: 2, pagina: -7 }, source).page).toBe(1)
  })

  it('resolves malformed page numbers to page 1 without throwing', () => {
    expect(queryProducts({ perPage: 2, pagina: Number.NaN }, source).page).toBe(1)
    expect(queryProducts({ perPage: 2, pagina: 2.5 }, source).page).toBe(1)
    expect(queryProducts({ perPage: 2, pagina: Number.POSITIVE_INFINITY }, source).page).toBe(1)
    expect(queryProducts({ perPage: 2, pagina: undefined }, source).page).toBe(1)
  })

  it('falls back to the default perPage when perPage is malformed', () => {
    expect(queryProducts({ perPage: 0 }, source).pageCount).toBe(1)
    expect(queryProducts({ perPage: -5 }, source).items).toHaveLength(5)
    expect(queryProducts({ perPage: Number.NaN }, source).items).toHaveLength(5)
  })

  it('reports pageCount 1 and no items when the result is empty', () => {
    const result = queryProducts({ q: 'xyzzy', perPage: 2, pagina: 4 }, source)
    expect(result.pageCount).toBe(1)
    expect(result.page).toBe(1)
    expect(result.items).toEqual([])
  })
})

describe('queryBrands', () => {
  it('returns every brand sorted by name ascending by default', () => {
    expect(queryBrands({}, source).map((brand) => brand.slug)).toEqual([
      'acai-do-para',
      'boa-mesa',
      'serra-verde',
    ])
  })

  it('sorts descending with "za"', () => {
    expect(queryBrands({ ordenar: 'za' }, source).map((brand) => brand.slug)).toEqual([
      'serra-verde',
      'boa-mesa',
      'acai-do-para',
    ])
  })

  it('searches the brand name, accent- and case-insensitively', () => {
    expect(queryBrands({ q: 'ACAI' }, source).map((brand) => brand.slug)).toEqual(['acai-do-para'])
  })

  it('searches the brand tagline', () => {
    expect(queryBrands({ q: 'conservas' }, source).map((brand) => brand.slug)).toEqual(['boa-mesa'])
  })

  it('returns an empty array when nothing matches', () => {
    expect(queryBrands({ q: 'xyzzy' }, source)).toEqual([])
  })
})

describe('lookups', () => {
  it('finds a product by slug', () => {
    expect(getProduct('queijo-colonial', source)?.id).toBe('p-queijo')
  })

  it('returns undefined for an unknown product slug', () => {
    expect(getProduct('nao-existe', source)).toBeUndefined()
  })

  it('finds a brand by slug', () => {
    expect(getBrand('boa-mesa', source)?.id).toBe('b-boamesa')
  })

  it('returns undefined for an unknown brand slug', () => {
    expect(getBrand('nao-existe', source)).toBeUndefined()
  })

  it('returns the categories', () => {
    expect(getCategories(source).map((category) => category.slug)).toEqual([
      'queijos',
      'doces',
      'conservas',
    ])
  })

  it('returns a copy of the categories array', () => {
    expect(getCategories(source)).not.toBe(categories)
  })
})

describe('getBrandStats', () => {
  it('counts products and the distinct categories they span', () => {
    expect(getBrandStats('b-serra', source)).toEqual({ products: 2, categories: 2 })
    expect(getBrandStats('b-boamesa', source)).toEqual({ products: 2, categories: 1 })
    expect(getBrandStats('b-acai', source)).toEqual({ products: 1, categories: 1 })
  })

  it('returns zeroes for an unknown brand', () => {
    expect(getBrandStats('b-inexistente', source)).toEqual({ products: 0, categories: 0 })
  })
})

describe('purity', () => {
  it('never mutates the source arrays', () => {
    const snapshot = JSON.stringify(source)

    queryProducts({ ordenar: 'za', perPage: 2, pagina: 2 }, source)
    queryProducts({ ordenar: 'recentes', q: 'a', marca: ['boa-mesa'] }, source)
    queryProducts({ ordenar: 'marca' }, source)
    queryBrands({ ordenar: 'za' }, source)
    getCategories(source)
    getBrandStats('b-serra', source)

    expect(JSON.stringify(source)).toBe(snapshot)
    expect(products.map((product) => product.id)).toEqual([
      'p-pate',
      'p-acai',
      'p-queijo',
      'p-antepasto',
      'p-doce',
    ])
    expect(brands.map((brand) => brand.id)).toEqual(['b-serra', 'b-acai', 'b-boamesa'])
  })

  it('returns a fresh items array on every call', () => {
    const first = queryProducts({}, source)
    const second = queryProducts({}, source)
    expect(first.items).not.toBe(second.items)
    expect(first.items).toEqual(second.items)
  })
})
