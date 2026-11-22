import Icon from '@/components/icons/Icon'
import CardCarousel, { CAROUSEL_CARD } from '@/components/sections/CardCarousel'
import Heading from '@/components/sections/Heading'
import Picture from '@/components/sections/Picture'
import RichText from '@/components/sections/RichText'
import type { FeatureCard } from '@/content/types'
import { cn } from '@/lib/utils'
import { holdLine } from '@/lib/layout'

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

  // Phones (under 640px): the cards stack. Tablets (640-1365px): a two-card carousel with arrows. Desktop (1366px+): three in a row.
  return (
    <CardCarousel trackClassName="grid gap-6 lg:grid-cols-3 lg:gap-[calc(56*var(--u))]">
      {cards.map((card) => (
        <li
          key={card.title}
          className={cn(
            'flex flex-col overflow-hidden rounded-3xl lg:rounded-[calc(32*var(--u))]',
            CAROUSEL_CARD,
            tone.card,
            'lg:h-[calc(703*var(--u))]',
          )}
        >
          <Picture
            image={card.image}
            className="aspect-[4/3] w-full object-cover lg:aspect-auto lg:h-[calc(352*var(--u))]"
          />
          <div className="flex flex-1 flex-col px-8 pt-8 pb-8 lg:px-0 lg:pb-[calc(40*var(--u))] lg:pt-[calc(45*var(--u))]">
            <div className="pb-6 lg:mx-auto lg:w-fit lg:pb-0">
            <Heading as="h3" text={card.title} className={cn('text-card-title lg:leading-[1.09]', tone.title)} />
            <RichText text={card.text} className={cn('mt-3 text-body lg:mt-[calc(18*var(--u))] lg:leading-[1.23]', holdLine(card.text), tone.text)} />
            </div>
            <Icon name="circleCheck" className="mt-auto size-8 self-center lg:size-[calc(41*var(--u))]" />
          </div>
        </li>
      ))}
    </CardCarousel>
  )
}

export default FeatureCards
