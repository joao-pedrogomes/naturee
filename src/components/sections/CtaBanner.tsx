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
    <div className={cn('grid overflow-hidden rounded-2xl bg-olive text-sand', image && 'md:grid-cols-[46%_1fr]')}>
      {image ? <Picture image={image} className="h-full min-h-[18rem] w-full object-cover" /> : null}
      <div
        className={cn(
          'flex flex-col justify-center px-6 py-12 lg:px-[6%] lg:py-14',
          centered && 'items-center text-center',
        )}
      >
        <SectionLabel tone="cream">{label}</SectionLabel>
        <Heading text={title} className={cn('mt-4 text-title text-sand', centered && 'max-w-[22ch]')} />
        {text ? <p className="mt-4 max-w-[48ch] text-body text-white">{text}</p> : null}
        <div className={cn('mt-8 flex flex-wrap gap-4', centered && 'justify-center')}>
          <CtaLink cta={primary} variant="teal" icon="arrow" size="lg" className="min-w-[16rem]" />
          {secondary ? <CtaLink cta={secondary} variant="outlineCream" icon="arrow" size="lg" className="min-w-[16rem]" /> : null}
        </div>
      </div>
    </div>
  )
}

export default CtaBanner
