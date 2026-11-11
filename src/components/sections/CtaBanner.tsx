import CtaLink from '@/components/sections/CtaLink'
import Heading from '@/components/sections/Heading'
import Picture from '@/components/sections/Picture'
import RichText from '@/components/sections/RichText'
import SectionLabel from '@/components/sections/SectionLabel'
import type { Cta, Image } from '@/content/types'
import { cn } from '@/lib/utils'

type CtaBannerProps = {
  label: string
  title: string
  text?: string
  image?: Image
  primary: Cta
  secondary?: Cta
}

function CtaBanner({ label, title, text, image, primary, secondary }: CtaBannerProps) {
  const withImage = Boolean(image)

  return (
    <div
      className={cn(
        'grid overflow-hidden rounded-3xl bg-olive text-sand lg:rounded-[calc(36*var(--u))]',
        withImage ? 'md:grid-cols-[46%_1fr] lg:h-[calc(510*var(--u))] lg:grid-cols-[calc(660*var(--u))_1fr]' : 'lg:h-[calc(477*var(--u))]',
      )}
    >
      {image ? <Picture image={image} className="h-full min-h-[18rem] w-full object-cover" /> : null}
      <div
        className={cn(
          'flex flex-col justify-center px-6 py-12 lg:justify-start lg:py-0',
          withImage ? 'lg:pt-[calc(57*var(--u))] lg:pr-[calc(40*var(--u))] lg:pl-[calc(61*var(--u))]' : 'items-center text-center lg:pt-[calc(69*var(--u))]',
        )}
      >
        <SectionLabel tone="cream" className="lg:text-[length:calc(23*var(--u))] lg:font-normal">
          {label}
        </SectionLabel>
        <Heading
          text={title}
          className={cn('mt-4 text-display text-teal', withImage ? 'lg:mt-[calc(27*var(--u))] lg:font-medium' : 'lg:mt-[calc(26*var(--u))]')}
        />
        {text ? (
          <RichText
            text={text}
            className="mt-4 max-w-[48ch] text-body text-sand lg:mt-[calc(36*var(--u))] lg:max-w-none lg:text-[length:clamp(1rem,calc(24*var(--u)),3rem)] lg:leading-[1.17]"
          />
        ) : null}
        <div
          className={cn(
            'mt-8 flex flex-wrap gap-4',
            withImage ? 'lg:mt-[calc(33*var(--u))]' : 'justify-center lg:mt-[calc(57*var(--u))] lg:gap-[calc(22*var(--u))]',
          )}
        >
          <CtaLink
            cta={primary}
            variant="teal"
            icon="arrow"
            size="lg"
            className={cn('min-w-[16rem]', withImage ? 'lg:h-[calc(66*var(--u))] lg:w-[calc(495*var(--u))]' : 'lg:h-[calc(66*var(--u))] lg:w-[calc(494*var(--u))]')}
          />
          {secondary ? (
            <CtaLink cta={secondary} variant="outlineTeal" icon="arrow" size="lg" className="min-w-[16rem] lg:h-[calc(66*var(--u))] lg:w-[calc(496*var(--u))]" />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default CtaBanner
