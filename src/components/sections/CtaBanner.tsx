import CtaLink from '@/components/sections/CtaLink'
import Heading from '@/components/sections/Heading'
import Picture from '@/components/sections/Picture'
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
  align?: 'center' | 'left'
}

function CtaBanner({ label, title, text, image, primary, secondary, align = 'center' }: CtaBannerProps) {
  const centered = align === 'center' && !image

  return (
    <div className={cn('grid overflow-hidden rounded-3xl bg-olive text-sand lg:rounded-[calc(36*var(--u))]', image && 'md:grid-cols-[46%_1fr]', centered && 'lg:h-[calc(477*var(--u))]')}>
      {image ? <Picture image={image} className="h-full min-h-[18rem] w-full object-cover" /> : null}
      <div className={cn('flex flex-col justify-center px-6 py-12 lg:px-[6%] lg:py-14', centered && 'items-center text-center lg:justify-start lg:pt-[calc(69*var(--u))] lg:pb-0')}>
        <SectionLabel tone="cream" className="lg:text-[length:calc(23*var(--u))] lg:font-normal">{label}</SectionLabel>
        <Heading text={title} className={cn('mt-4 text-display text-sand', centered && 'lg:mt-[calc(26*var(--u))]')} />
        {text ? <p className="mt-4 max-w-[48ch] text-body text-white">{text}</p> : null}
        <div className={cn('mt-8 flex flex-wrap gap-4', centered && 'justify-center lg:mt-[calc(57*var(--u))] lg:gap-[calc(22*var(--u))]')}>
          <CtaLink cta={primary} variant="teal" icon="arrow" size="lg" className="min-w-[16rem] lg:h-[calc(66*var(--u))] lg:w-[calc(494*var(--u))]" />
          {secondary ? <CtaLink cta={secondary} variant="outlineTeal" icon="arrow" size="lg" className="min-w-[16rem] lg:h-[calc(66*var(--u))] lg:w-[calc(496*var(--u))]" /> : null}
        </div>
      </div>
    </div>
  )
}

export default CtaBanner
