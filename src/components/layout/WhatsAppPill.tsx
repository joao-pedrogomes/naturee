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
        'inline-flex min-h-11 whitespace-nowrap items-center justify-center gap-2 rounded-full bg-whatsapp px-5 py-2 text-[0.9375rem] font-medium text-teal uppercase transition-colors hover:bg-whatsapp-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand lg:h-[calc(62*var(--u))] lg:gap-[calc(10*var(--u))] lg:px-[calc(17*var(--u))] lg:text-[length:clamp(0.8125rem,calc(19.3*var(--u)),2.4rem)]',
        className,
      )}
    >
      {/* The SVG carries a fixed cream fill, so it is used as a mask over a teal box instead of an <img>. */}
      <span
        aria-hidden="true"
        className="size-[1.1em] shrink-0 bg-teal lg:size-[calc(30*var(--u))]"
        style={{ mask: `url(${whatsappIcon}) center / contain no-repeat`, WebkitMask: `url(${whatsappIcon}) center / contain no-repeat` }}
      />
      <span>{site.whatsappCta}</span>
    </a>
  )
}

export default WhatsAppPill
