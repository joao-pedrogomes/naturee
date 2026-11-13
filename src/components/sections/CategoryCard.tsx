import Heading from '@/components/sections/Heading'
import Picture from '@/components/sections/Picture'
import type { Category } from '@/content/types'
import { renderRichText } from '@/lib/richText'
import { cn } from '@/lib/utils'

type CategoryCardProps = {
  category: Category
  tone: 'light' | 'dark'
}

const TONES = {
  light: { card: 'bg-olive-light', title: 'text-teal' },
  dark: { card: 'bg-olive', title: 'text-sand' },
}

function CategoryCard({ category, tone }: CategoryCardProps) {
  return (
    <li className={cn('flex flex-col rounded-3xl p-6 lg:h-[calc(659*var(--u))] lg:rounded-[calc(32*var(--u))] lg:px-[calc(35*var(--u))] lg:pt-[calc(35*var(--u))] lg:pb-[calc(52*var(--u))]', TONES[tone].card)}>
      <Picture
        image={category.image}
        className="aspect-[1.02] w-full rounded-xl object-cover lg:aspect-auto lg:h-[calc(371*var(--u))] lg:rounded-[calc(28*var(--u))]"
      />
      <div className="flex flex-1 flex-col justify-center lg:pl-[calc(14*var(--u))]">
        <Heading as="h3" text={category.name} className={cn('mt-6 text-category lg:mt-0', TONES[tone].title)} />
        <p className="mt-2 text-body text-white lg:mt-[calc(12*var(--u))] lg:max-w-[calc(350*var(--u))] lg:leading-[1.13]">{renderRichText(category.blurb)}</p>
      </div>
    </li>
  )
}

export default CategoryCard
