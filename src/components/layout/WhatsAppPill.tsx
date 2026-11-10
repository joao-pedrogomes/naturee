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
        'inline-flex min-h-11 items-center gap-2 rounded-full bg-olive px-5 py-2 text-[0.8125rem] font-semibold tracking-wide text-sand uppercase transition-colors hover:bg-olive-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand',
        className,
      )}
    >
      <img src={whatsappIcon} alt="" width={18} height={18} aria-hidden="true" />
      <span>{site.whatsappCta}</span>
    </a>
  )
}

export default WhatsAppPill
