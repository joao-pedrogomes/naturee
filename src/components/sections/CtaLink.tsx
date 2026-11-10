import { ArrowUpRight, BookOpen, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSiteContent } from '@/content/siteContent'
import type { Cta } from '@/content/types'
import { cn } from '@/lib/utils'
import { resolveHref } from '@/lib/whatsapp'

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
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border font-sans font-semibold whitespace-nowrap transition-colors select-none focus-visible:outline-2 focus-visible:outline-offset-2'

const VARIANTS: Record<CtaVariant, string> = {
  olive: 'border-olive bg-olive text-white hover:bg-olive-deep focus-visible:outline-olive',
  teal: 'border-teal bg-teal text-sand hover:bg-teal/90 focus-visible:outline-teal',
  outlineCream: 'border-sand bg-transparent text-sand hover:bg-sand/10 focus-visible:outline-sand',
  outlineOlive: 'border-olive bg-transparent text-olive-deep hover:bg-olive/10 focus-visible:outline-olive',
  outlineTeal: 'border-teal bg-transparent text-teal hover:bg-teal/10 focus-visible:outline-teal',
  sand: 'border-sand bg-sand text-teal hover:bg-cream focus-visible:outline-sand',
}

const SIZES = {
  sm: 'px-5 py-2 text-[0.8125rem] uppercase tracking-wide',
  md: 'px-7 py-2.5 text-small',
  lg: 'px-8 py-3 text-body',
}

const ICONS = {
  arrow: ArrowUpRight,
  download: Download,
  catalog: BookOpen,
}

function CtaLink({ cta, variant = 'olive', icon = 'none', size = 'md', className }: CtaLinkProps) {
  const { site } = useSiteContent()
  const resolved = resolveHref(cta.href, site, cta.message)
  const IconComponent = icon === 'none' ? null : ICONS[icon]
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className)
  const content = (
    <>
      {icon === 'catalog' && IconComponent ? <IconComponent aria-hidden="true" className="size-4" /> : null}
      <span>{cta.label}</span>
      {icon !== 'catalog' && IconComponent ? <IconComponent aria-hidden="true" className="size-4" /> : null}
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
