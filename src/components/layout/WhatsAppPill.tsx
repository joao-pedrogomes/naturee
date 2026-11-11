import { useSiteContent } from '@/content/siteContent'
import { cn } from '@/lib/utils'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import whatsappIcon from '@/assets/logos/whatsapp.svg'

type WhatsAppPillProps = {
  className?: string
}

function WhatsAppPill({ className }: WhatsAppPillProps) {
  const { site } = useSiteContent()

  return (
    <a
      href={buildWhatsAppUrl(site.whatsapp)}
      target="_blank"
      rel="noopener"
      className={cn(
        'inline-flex min-h-11 whitespace-nowrap items-center justify-center gap-2 rounded-full bg-olive px-5 py-2 text-[0.9375rem] font-medium text-sand uppercase transition-colors hover:bg-olive-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand lg:h-[calc(62*var(--u))] lg:gap-[calc(10*var(--u))] lg:px-[calc(17*var(--u))] lg:text-[length:clamp(0.8125rem,calc(21*var(--u)),2.5rem)]',
        className,
      )}
    >
      <img src={whatsappIcon} alt="" aria-hidden="true" className="size-[1.1em] lg:size-[calc(30*var(--u))]" />
      <span>{site.whatsappCta}</span>
    </a>
  )
}

export default WhatsAppPill
