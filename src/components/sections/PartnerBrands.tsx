import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useRef } from 'react'
import type { Brand } from '@/content/types'
import { cn } from '@/lib/utils'

type PartnerBrandsProps = {
  brands: Brand[]
  layout: 'carousel' | 'grid'
  previousLabel?: string
  nextLabel?: string
  trackLabel?: string
}

const ARROW =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-full text-olive transition-colors hover:bg-olive/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive disabled:opacity-40'

function BrandLogo({ brand, className }: { brand: Brand; className?: string }) {
  return (
    <img
      src={brand.logo.src}
      alt={brand.logo.alt}
      width={brand.logo.width}
      height={brand.logo.height}
      loading="lazy"
      decoding="async"
      className={cn('h-16 w-auto max-w-full object-contain sm:h-20 lg:h-24', className)}
    />
  )
}

function BrandGrid({ brands }: { brands: Brand[] }) {
  return (
    <ul className="grid grid-cols-2 items-center justify-items-center gap-x-8 gap-y-12 md:grid-cols-3 md:gap-y-16">
      {brands.map((brand) => (
        <li key={brand.id} className="flex max-w-[13rem] items-center justify-center">
          <BrandLogo brand={brand} />
        </li>
      ))}
    </ul>
  )
}

function BrandCarousel({
  brands,
  previousLabel = 'Marcas anteriores',
  nextLabel = 'Próximas marcas',
  trackLabel = 'Marcas parceiras',
}: PartnerBrandsProps) {
  const trackRef = useRef<HTMLUListElement>(null)

  function scrollByPage(direction: 1 | -1) {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * track.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="flex items-center gap-2 sm:gap-6">
      <button type="button" aria-label={previousLabel} className={ARROW} onClick={() => scrollByPage(-1)}>
        <ArrowLeft aria-hidden="true" className="size-5" strokeWidth={1.5} />
      </button>
      <ul
        ref={trackRef}
        tabIndex={0}
        aria-label={trackLabel}
        className="scrollbar-none flex flex-1 snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth py-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-olive"
      >
        {brands.map((brand) => (
          <li
            key={brand.id}
            className="flex w-[calc(50%-0.75rem)] shrink-0 snap-start items-center justify-center sm:w-[calc(33.333%-1rem)]"
          >
            <BrandLogo brand={brand} />
          </li>
        ))}
      </ul>
      <button type="button" aria-label={nextLabel} className={ARROW} onClick={() => scrollByPage(1)}>
        <ArrowRight aria-hidden="true" className="size-5" strokeWidth={1.5} />
      </button>
    </div>
  )
}

function PartnerBrands(props: PartnerBrandsProps) {
  if (props.layout === 'grid') return <BrandGrid brands={props.brands} />
  return <BrandCarousel {...props} />
}

export default PartnerBrands
