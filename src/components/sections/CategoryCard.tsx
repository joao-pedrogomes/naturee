import Heading from '@/components/sections/Heading'
import Picture from '@/components/sections/Picture'
import type { Category } from '@/content/types'
import { cn } from '@/lib/utils'

type CategoryCardProps = {
  category: Category
  tone: 'light' | 'dark'
}

const TONES = {
  light: 'bg-olive-light text-teal',
  dark: 'bg-olive text-white',
}

function CategoryCard({ category, tone }: CategoryCardProps) {
  return (
    <li className={cn('flex flex-col rounded-2xl p-6 lg:p-[7%]', TONES[tone])}>
      <Picture image={category.image} className="aspect-[1.04] w-full rounded-xl object-cover" />
      <Heading as="h3" text={category.name} className="mt-6 text-card-title text-teal" />
      <p className="mt-2 text-body">{category.blurb}</p>
    </li>
  )
}

export default CategoryCard
