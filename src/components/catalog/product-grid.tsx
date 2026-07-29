import type { JSX } from 'react'
import { ProductCard } from '@/components/catalog/product-card'
import type { Brand, Category, Product } from '@/types/catalog'

type ProductGridProps = {
  products: Product[]
  brandsById: Record<string, Brand>
  categoriesById: Record<string, Category>
}

export function ProductGrid({
  products,
  brandsById,
  categoriesById,
}: ProductGridProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          brandName={brandsById[product.brandId]?.name ?? ''}
          categoryName={categoriesById[product.categoryId]?.name ?? ''}
        />
      ))}
    </div>
  )
}
