export type Category = {
  id: string
  slug: string
  name: string
}

export type Brand = {
  id: string
  slug: string
  name: string
  /** One-line pitch shown on the brand card. */
  tagline: string
  /** Two or three lines, used on the brand card and in filter context. */
  description: string
  /** City and state, e.g. "Antônio Carlos, SC". */
  origin: string
  logo: string
  cover: string
  categoryIds: string[]
}

export type ProductSpec = {
  label: string
  value: string
}

/** Minimum order quantity. Prices are never shown — quotation only. */
export type Moq = {
  qty: number
  unit: string
}

export type Product = {
  id: string
  slug: string
  name: string
  /** Variant and packaging, e.g. "Fatiado · bandeja 200g". */
  subtitle: string
  brandId: string
  categoryId: string
  image: string
  description: string
  specs: ProductSpec[]
  moq: Moq
  /** false renders a "Sob encomenda" badge; the product stays quotable. */
  available: boolean
  /** ISO date, powers the "recentes" sort. */
  createdAt: string
}

export type CatalogSort = 'az' | 'za' | 'recentes' | 'marca'

export type CatalogView = 'produtos' | 'marcas'

export type CatalogQuery = {
  q?: string
  marca?: string[]
  categoria?: string[]
  ordenar?: CatalogSort
  pagina?: number
  perPage?: number
}

export type ProductQueryResult = {
  items: Product[]
  total: number
  pageCount: number
  /** The page actually used, after clamping. */
  page: number
}
