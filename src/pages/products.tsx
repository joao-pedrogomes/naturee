import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { PackageSearch } from 'lucide-react'
import { toast } from 'sonner'
import {
  getBrandStats,
  getCategories,
  getProduct,
  queryBrands,
  queryProducts,
} from '@/lib/catalog'
import { useCatalogParams } from '@/hooks/use-catalog-params'
import { CatalogBreadcrumb } from '@/components/catalog/catalog-breadcrumb'
import { CatalogHero } from '@/components/catalog/catalog-hero'
import { CatalogControls } from '@/components/catalog/catalog-controls'
import { ProductGrid } from '@/components/catalog/product-grid'
import { BrandGrid } from '@/components/catalog/brand-grid'
import { CatalogPagination } from '@/components/catalog/catalog-pagination'
import { CatalogCta } from '@/components/catalog/catalog-cta'
import { ProductDialog } from '@/components/catalog/product-dialog'
import type { ActiveFilterChip } from '@/components/catalog/active-filters'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { useQuotation } from '@/context/quotation'

const PER_PAGE = 12

export default function ProductsPage() {
  const {
    view,
    q,
    marca,
    categoria,
    ordenar,
    pagina,
    setView,
    setQuery,
    toggleFilter,
    setSort,
    setPage,
    clearFilters,
    applyParams,
  } = useCatalogParams()

  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { count } = useQuotation()
  const gridAnchor = useRef<HTMLDivElement>(null)

  const allBrands = useMemo(() => queryBrands({}), [])
  const allCategories = useMemo(() => getCategories(), [])

  const brandsById = useMemo(
    () => Object.fromEntries(allBrands.map((brand) => [brand.id, brand])),
    [allBrands],
  )
  const categoriesById = useMemo(
    () => Object.fromEntries(allCategories.map((category) => [category.id, category])),
    [allCategories],
  )
  const brandsBySlug = useMemo(
    () => Object.fromEntries(allBrands.map((brand) => [brand.slug, brand])),
    [allBrands],
  )
  const categoriesBySlug = useMemo(
    () => Object.fromEntries(allCategories.map((category) => [category.slug, category])),
    [allCategories],
  )

  const productResult = useMemo(
    () => queryProducts({ q, marca, categoria, ordenar, pagina, perPage: PER_PAGE }),
    [q, marca, categoria, ordenar, pagina],
  )

  const brandResults = useMemo(
    () => queryBrands({ q, ordenar: ordenar === 'za' ? 'za' : 'az' }),
    [q, ordenar],
  )

  const brandStats = useMemo(
    () =>
      Object.fromEntries(allBrands.map((brand) => [brand.id, getBrandStats(brand.id)])),
    [allBrands],
  )

  // The URL can hold a page past the end after filters narrow the result set.
  useEffect(() => {
    if (view === 'produtos' && productResult.page !== pagina) {
      setPage(productResult.page)
    }
  }, [view, productResult.page, pagina, setPage])

  const brandOptions = useMemo(
    () =>
      allBrands.map((brand) => ({
        value: brand.slug,
        label: brand.name,
        count: brandStats[brand.id]?.products ?? 0,
      })),
    [allBrands, brandStats],
  )

  const categoryOptions = useMemo(
    () =>
      allCategories.map((category) => ({
        value: category.slug,
        label: category.name,
        count: queryProducts({ categoria: [category.slug], perPage: Number.MAX_SAFE_INTEGER })
          .total,
      })),
    [allCategories],
  )

  const chips = useMemo<ActiveFilterChip[]>(() => {
    const result: ActiveFilterChip[] = []
    if (q) result.push({ facet: 'q', value: q, label: q })
    for (const slugValue of marca) {
      const brand = brandsBySlug[slugValue]
      if (brand) result.push({ facet: 'marca', value: slugValue, label: brand.name })
    }
    for (const slugValue of categoria) {
      const category = categoriesBySlug[slugValue]
      if (category)
        result.push({ facet: 'categoria', value: slugValue, label: category.name })
    }
    return result
  }, [q, marca, categoria, brandsBySlug, categoriesBySlug])

  const resultLabel =
    view === 'produtos'
      ? `${productResult.total} ${productResult.total === 1 ? 'produto' : 'produtos'} encontrados`
      : `${brandResults.length} ${brandResults.length === 1 ? 'marca' : 'marcas'} encontradas`

  const activeBrandName =
    marca.length === 1 ? brandsBySlug[marca[0]]?.name : undefined

  // View and filter change together, so this must be one atomic write.
  const handleSelectBrand = useCallback(
    (brandSlug: string) => {
      applyParams({ view: 'produtos', marca: [brandSlug] })
    },
    [applyParams],
  )

  const handlePageChange = useCallback(
    (nextPage: number) => {
      setPage(nextPage)
      gridAnchor.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      gridAnchor.current?.focus({ preventScroll: true })
    },
    [setPage],
  )

  const handleRemoveChip = useCallback(
    (chip: ActiveFilterChip) => {
      if (chip.facet === 'q') setQuery('')
      else toggleFilter(chip.facet, chip.value)
    },
    [setQuery, toggleFilter],
  )

  const handleClearFacet = useCallback(
    (facet: 'marca' | 'categoria') => {
      applyParams(facet === 'marca' ? { marca: [] } : { categoria: [] })
    },
    [applyParams],
  )

  const dialogProduct = slug ? getProduct(slug) : undefined
  const openedFromCatalog = Boolean(
    (location.state as { fromCatalog?: boolean } | null)?.fromCatalog,
  )

  useEffect(() => {
    if (slug && !dialogProduct) {
      toast.error('Produto não encontrado')
      navigate('/produtos', { replace: true })
    }
  }, [slug, dialogProduct, navigate])

  const handleCloseDialog = useCallback(() => {
    if (openedFromCatalog) navigate(-1)
    else navigate({ pathname: '/produtos', search: location.search })
  }, [openedFromCatalog, navigate, location.search])

  const hasProducts = productResult.items.length > 0
  const hasBrands = brandResults.length > 0

  return (
    <div className="space-y-10 pb-4">
      <CatalogBreadcrumb
        brandName={activeBrandName}
        onClearBrand={activeBrandName ? () => toggleFilter('marca', marca[0]) : undefined}
      />

      <CatalogHero />

      <div className="space-y-6">
        <CatalogControls
          view={view}
          q={q}
          marca={marca}
          categoria={categoria}
          ordenar={ordenar}
          brandOptions={brandOptions}
          categoryOptions={categoryOptions}
          chips={chips}
          resultLabel={resultLabel}
          onViewChange={setView}
          onQueryChange={setQuery}
          onToggleFilter={toggleFilter}
          onClearFacet={handleClearFacet}
          onSortChange={setSort}
          onRemoveChip={handleRemoveChip}
          onClearAll={clearFilters}
        />

        <div ref={gridAnchor} tabIndex={-1} className="scroll-mt-32 outline-none">
          <h2 className="sr-only">
            {view === 'produtos' ? 'Lista de produtos' : 'Lista de marcas'}
          </h2>

          {view === 'produtos' ? (
            hasProducts ? (
              <div className="space-y-8">
                <ProductGrid
                  products={productResult.items}
                  brandsById={brandsById}
                  categoriesById={categoriesById}
                />
                <CatalogPagination
                  page={productResult.page}
                  pageCount={productResult.pageCount}
                  total={productResult.total}
                  perPage={PER_PAGE}
                  onPageChange={handlePageChange}
                />
              </div>
            ) : (
              <CatalogEmptyState
                chips={chips}
                onClear={clearFilters}
                onClearQuery={() => setQuery('')}
                hasQuery={Boolean(q)}
                hasFacets={marca.length + categoria.length > 0}
              />
            )
          ) : hasBrands ? (
            <BrandGrid
              brands={brandResults}
              statsByBrandId={brandStats}
              onSelect={handleSelectBrand}
            />
          ) : (
            <CatalogEmptyState
              chips={chips}
              onClear={clearFilters}
              onClearQuery={() => setQuery('')}
              hasQuery={Boolean(q)}
              hasFacets={false}
            />
          )}
        </div>
      </div>

      <CatalogCta itemCount={count} />

      <ProductDialog
        product={dialogProduct}
        brandName={dialogProduct ? (brandsById[dialogProduct.brandId]?.name ?? '') : ''}
        categoryName={
          dialogProduct ? (categoriesById[dialogProduct.categoryId]?.name ?? '') : ''
        }
        onClose={handleCloseDialog}
      />
    </div>
  )
}

function CatalogEmptyState({
  chips,
  onClear,
  onClearQuery,
  hasQuery,
  hasFacets,
}: {
  chips: ActiveFilterChip[]
  onClear: () => void
  onClearQuery: () => void
  hasQuery: boolean
  hasFacets: boolean
}) {
  const summary = chips.map((chip) => chip.label).join(', ')

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <PackageSearch />
        </EmptyMedia>
        <EmptyTitle>Nenhum resultado encontrado</EmptyTitle>
        <EmptyDescription>
          {summary
            ? `Nada corresponde a ${summary}. Ajuste a busca ou remova alguns filtros.`
            : 'Ajuste a busca ou remova alguns filtros para ver mais itens.'}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {hasQuery && hasFacets ? (
          <Button variant="outline" onClick={onClearQuery}>
            Limpar apenas a busca
          </Button>
        ) : null}
        <Button onClick={onClear}>Limpar filtros</Button>
      </EmptyContent>
    </Empty>
  )
}
