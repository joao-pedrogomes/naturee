import Picture from '@/components/sections/Picture'
import type { Category } from '@/content/types'

type HighlightCardProps = {
  category: Category
  label: string
}

// Phones: an olive card with the photo bleeding to its top edge, like the Diferenciais cards. Tablet and desktop keep the bare photo.
function HighlightCard({ category, label }: HighlightCardProps) {
  return (
    <li className="flex flex-col items-center text-center max-sm:overflow-hidden max-sm:rounded-3xl max-sm:bg-olive">
      <Picture
        image={category.image}
        className="aspect-[1.02] w-full rounded-2xl object-cover max-sm:aspect-[4/3] max-sm:rounded-none lg:aspect-auto lg:h-[calc(371*var(--u))] lg:w-[calc(380*var(--u))] lg:rounded-[calc(32*var(--u))]"
      />
      <p className="mt-6 text-body text-black max-sm:mt-8 max-sm:text-white lg:mt-[calc(40*var(--u))] uppercase lg:text-[length:clamp(0.875rem,calc(22*var(--u)),2.5rem)] lg:leading-none">
        {label}
      </p>
      <h3 className="mt-1 font-sans text-step font-bold text-olive max-sm:px-6 max-sm:pb-8 max-sm:text-sand lg:mt-[calc(6*var(--u))]">{category.name}</h3>
    </li>
  )
}

export default HighlightCard
