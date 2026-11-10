import { CircleCheck } from 'lucide-react'
import Heading from '@/components/sections/Heading'
import Picture from '@/components/sections/Picture'
import type { FeatureCard } from '@/content/types'
import { cn } from '@/lib/utils'

type FeatureCardsProps = {
  cards: FeatureCard[]
  variant: 'dark' | 'light'
}

const VARIANTS = {
  dark: { card: 'bg-teal', title: 'text-sand', text: 'text-sand/90', check: 'text-sand' },
  light: { card: 'bg-white', title: 'text-teal', text: 'text-teal', check: 'text-olive' },
}

function FeatureCards({ cards, variant }: FeatureCardsProps) {
  const tone = VARIANTS[variant]

  return (
    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-[2.9vw]">
      {cards.map((card) => (
        <li
          key={card.title}
          className={cn('flex flex-col overflow-hidden rounded-2xl md:last:col-span-2 md:last:mx-auto md:last:max-w-[calc(50%-0.75rem)] lg:last:col-span-1 lg:last:mx-0 lg:last:max-w-none', tone.card)}
        >
          <Picture image={card.image} className="aspect-[4/3] w-full object-cover" />
          <div className="flex flex-1 flex-col px-[14%] pt-8 pb-8">
            <Heading as="h3" text={card.title} className={cn('text-card-title', tone.title)} />
            <p className={cn('mt-3 text-body', tone.text)}>{card.text}</p>
            <CircleCheck aria-hidden="true" strokeWidth={1.25} className={cn('mt-auto size-7 self-center pt-0 text-current', tone.check)} />
          </div>
        </li>
      ))}
    </ul>
  )
}

export default FeatureCards
