import Icon from '@/components/icons/Icon'
import Heading from '@/components/sections/Heading'
import Picture from '@/components/sections/Picture'
import type { FeatureCard } from '@/content/types'
import { cn } from '@/lib/utils'

type FeatureCardsProps = {
  cards: FeatureCard[]
  variant: 'dark' | 'light'
}

const VARIANTS = {
  dark: { card: 'bg-teal', title: 'text-sand', text: 'text-olive' },
  light: { card: 'bg-white', title: 'text-teal', text: 'text-black' },
}

function FeatureCards({ cards, variant }: FeatureCardsProps) {
  const tone = VARIANTS[variant]

  return (
    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-[calc(56*var(--u))]">
      {cards.map((card) => (
        <li
          key={card.title}
          className={cn(
            'flex flex-col overflow-hidden rounded-3xl md:last:col-span-2 md:last:mx-auto md:last:w-[calc(50%-0.75rem)] lg:rounded-[calc(32*var(--u))] lg:last:col-span-1 lg:last:mx-0 lg:last:w-auto',
            tone.card,
            variant === 'dark' ? 'lg:h-[calc(703*var(--u))]' : 'lg:h-[calc(435*var(--u))]',
          )}
        >
          <Picture
            image={card.image}
            className={cn('w-full object-cover', variant === 'dark' ? 'aspect-[4/3] lg:aspect-auto lg:h-[calc(352*var(--u))]' : 'aspect-[4/3] lg:aspect-auto lg:h-[calc(190*var(--u))]')}
          />
          <div className="flex flex-1 flex-col px-8 pt-8 pb-8 lg:pr-[calc(40*var(--u))] lg:pb-[calc(40*var(--u))] lg:pl-[calc(80*var(--u))] lg:pt-[calc(45*var(--u))]">
            <Heading as="h3" text={card.title} className={cn('text-card-title lg:leading-[1.09]', tone.title)} />
            <p className={cn('mt-3 text-body lg:mt-[calc(18*var(--u))] lg:leading-[1.23]', tone.text)}>{card.text}</p>
            <Icon name="circleCheck" className="mt-auto size-8 self-center lg:size-[calc(41*var(--u))]" />
          </div>
        </li>
      ))}
    </ul>
  )
}

export default FeatureCards
