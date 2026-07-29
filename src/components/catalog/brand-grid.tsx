import type { JSX } from 'react'
import { BrandCard } from '@/components/catalog/brand-card'
import type { Brand } from '@/types/catalog'

type BrandStats = { products: number; categories: number }

type BrandGridProps = {
  brands: Brand[]
  statsByBrandId: Record<string, BrandStats>
  onSelect: (slug: string) => void
}

export function BrandGrid({
  brands,
  statsByBrandId,
  onSelect,
}: BrandGridProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {brands.map((brand) => {
        const stats = statsByBrandId[brand.id]

        return (
          <BrandCard
            key={brand.id}
            brand={brand}
            productCount={stats?.products ?? 0}
            categoryCount={stats?.categories ?? 0}
            onSelect={onSelect}
          />
        )
      })}
    </div>
  )
}
