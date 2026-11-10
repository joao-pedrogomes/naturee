import { MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import TrustStrip from '@/components/sections/TrustStrip'
import { useSiteContent } from '@/content/siteContent'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import footerLogo from '@/assets/logos/natureeFooter.svg'
import instagramIcon from '@/assets/logos/instagram.svg'
import whatsappIcon from '@/assets/logos/whatsapp.svg'

const CONTACT_LINK =
  'inline-flex min-h-11 items-center gap-3 rounded py-2 text-small text-sand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sand'

function SiteFooter() {
  const { site, footer, footerLinks, trust } = useSiteContent()
  const links = footerLinks.filter((link) => link.enabled)

  return (
    <footer className="bg-teal text-sand">
      <div className="container-site py-14 lg:py-16">
        <TrustStrip items={trust} />

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-8">
          <div>
            <img src={footerLogo} alt={site.name} width={100} height={92} loading="lazy" className="h-[5.75rem] w-auto" />
            <p className="mt-6 max-w-[16rem] text-small text-sand/90">{site.tagline}</p>
          </div>

          <nav aria-label={footer.quickLinksTitle}>
            <h2 className="font-sans text-body font-semibold tracking-wide text-olive-light uppercase">
              {footer.quickLinksTitle}
            </h2>
            <ul className="mt-5 space-y-0">
              {links.map((link) => (
                <li key={link.id}>
                  <Link
                    to={link.href}
                    className="inline-flex min-h-11 items-center rounded text-small text-sand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-sans text-body font-semibold tracking-wide text-olive-light uppercase">
              {footer.contactTitle}
            </h2>
            <ul className="mt-5 space-y-1">
              <li>
                <a href={buildWhatsAppUrl(site.whatsapp)} target="_blank" rel="noopener" className={CONTACT_LINK}>
                  <img src={whatsappIcon} alt="" width={18} height={18} aria-hidden="true" />
                  <span>
                    WhatsApp <strong className="font-bold">{site.whatsappLabel}</strong>
                  </span>
                </a>
              </li>
              <li className="flex min-h-11 items-center gap-3 py-2 text-small text-sand">
                <MapPin aria-hidden="true" className="size-[18px] shrink-0 text-olive-light" strokeWidth={1.5} />
                <span>{site.regionLine}</span>
              </li>
              <li>
                <a href={site.instagramUrl} target="_blank" rel="noopener" className={CONTACT_LINK}>
                  <img src={instagramIcon} alt="" width={18} height={18} aria-hidden="true" />
                  <span className="font-bold">
                    <span className="sr-only">Instagram </span>
                    {site.instagram}
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
