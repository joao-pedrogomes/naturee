import Picture from '@/components/sections/Picture'
import type { Category } from '@/content/types'

type HighlightCardProps = {
  category: Category
  label: string
}

function HighlightCard({ category, label }: HighlightCardProps) {
  return (
    <li className="flex flex-col items-center text-center">
      <Picture image={category.image} className="aspect-[1.04] w-full rounded-xl object-cover" />
      <p className="mt-7 text-small tracking-wide text-teal uppercase">{label}</p>
      <h3 className="mt-1 font-sans text-card-title font-bold text-olive-deep">{category.name}</h3>
    </li>
  )
}

export default HighlightCard
