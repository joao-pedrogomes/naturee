import Picture from '@/components/sections/Picture'
import type { Category } from '@/content/types'

type HighlightCardProps = {
  category: Category
  label: string
}

function HighlightCard({ category, label }: HighlightCardProps) {
  return (
    <li className="flex flex-col items-center text-center">
      <Picture
        image={category.image}
        className="aspect-[1.02] w-full rounded-2xl object-cover lg:aspect-auto lg:h-[calc(371*var(--u))] lg:w-[calc(380*var(--u))] lg:rounded-[calc(32*var(--u))]"
      />
      <p className="mt-6 text-body text-black lg:mt-[calc(40*var(--u))] uppercase lg:text-[length:clamp(0.875rem,calc(22*var(--u)),2.5rem)] lg:leading-none">
        {label}
      </p>
      <h3 className="mt-1 font-sans text-step font-bold text-olive lg:mt-[calc(6*var(--u))]">{category.name}</h3>
    </li>
  )
}

export default HighlightCard
