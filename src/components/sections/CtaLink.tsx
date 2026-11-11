import { Link } from 'react-router-dom'
import { useSiteContent } from '@/content/siteContent'
import type { Cta } from '@/content/types'
import { cn } from '@/lib/utils'
import { resolveHref } from '@/lib/whatsapp'
import catalogButton from '@/assets/icons/catalogButton.svg'
import download from '@/assets/icons/download.svg'
import linkOut from '@/assets/icons/linkOut.svg'
import linkOutDark from '@/assets/icons/linkOutDark.svg'

export type CtaVariant = 'olive' | 'teal' | 'outlineCream' | 'outlineOlive' | 'outlineTeal' | 'sand'
export type CtaIcon = 'arrow' | 'download' | 'catalog' | 'none'

type CtaLinkProps = {
  cta: Cta
  variant?: CtaVariant
  icon?: CtaIcon
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const BASE =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border font-sans whitespace-nowrap transition-colors select-none focus-visible:outline-2 focus-visible:outline-offset-2 lg:gap-[calc(10*var(--u))]'

const VARIANTS: Record<CtaVariant, string> = {
  olive: 'border-olive bg-olive text-sand hover:bg-olive-deep focus-visible:outline-olive',
  teal: 'border-teal bg-teal text-sand hover:bg-teal/90 focus-visible:outline-teal',
  outlineCream: 'border-sand bg-transparent text-sand hover:bg-sand/10 focus-visible:outline-sand',
  outlineOlive: 'border-olive bg-transparent text-olive hover:bg-olive/10 focus-visible:outline-olive',
  outlineTeal: 'border-teal bg-transparent text-teal hover:bg-teal/10 focus-visible:outline-teal',
  sand: 'border-sand bg-sand text-teal hover:bg-cream focus-visible:outline-sand',
}

const SIZES = {
  sm: 'px-5 py-2 text-[0.8125rem] font-medium uppercase lg:px-[calc(26*var(--u))] lg:py-0 lg:text-btn',
  md: 'px-7 py-2.5 text-small font-semibold lg:px-[calc(30*var(--u))] lg:py-0 lg:text-[length:clamp(0.9375rem,calc(23*var(--u)),2.5rem)]',
  lg: 'px-8 py-3 text-small font-semibold lg:px-[calc(36*var(--u))] lg:py-0 lg:text-[length:clamp(0.9375rem,calc(23*var(--u)),2.5rem)]',
}

const HEIGHTS = {
  sm: 'lg:h-[calc(48*var(--u))]',
  md: 'lg:h-[calc(54*var(--u))]',
  lg: 'lg:h-[calc(57*var(--u))]',
}

const ICON_SIZE = 'size-4 lg:size-[calc(24*var(--u))]'

function iconSource(icon: CtaIcon, variant: CtaVariant): string | null {
  if (icon === 'catalog') return catalogButton
  if (icon === 'download') return download
  if (icon === 'arrow') return variant === 'outlineOlive' || variant === 'outlineTeal' || variant === 'sand' ? linkOutDark : linkOut
  return null
}

function CtaLink({ cta, variant = 'olive', icon = 'none', size = 'md', className }: CtaLinkProps) {
  const { site } = useSiteContent()
  const resolved = resolveHref(cta.href, site, cta.message)
  const source = iconSource(icon, variant)
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], HEIGHTS[size], className)
  const iconNode = source ? <img src={source} alt="" aria-hidden="true" className={ICON_SIZE} /> : null
  const content = (
    <>
      {icon === 'catalog' ? iconNode : null}
      <span>{cta.label}</span>
      {icon !== 'catalog' ? iconNode : null}
    </>
  )

  if (resolved.external) {
    return (
      <a href={resolved.href} target="_blank" rel="noopener" className={classes}>
        {content}
      </a>
    )
  }

  return (
    <Link to={resolved.href} className={classes}>
      {content}
    </Link>
  )
}

export default CtaLink
