import { Link } from 'react-router-dom'
import { renderRichText } from '@/lib/richText'
import TrustStrip from '@/components/sections/TrustStrip'
import { useSiteContent } from '@/content/siteContent'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import footerLogo from '@/assets/logos/natureeFooter.svg'
import footerInstagram from '@/assets/icons/footerInstagram.svg'
import footerPin from '@/assets/icons/footerPin.svg'
import footerWhatsapp from '@/assets/icons/footerWhatsapp.svg'

const CONTACT_LINK =
  'inline-flex min-h-11 items-center gap-3 rounded py-2 text-sand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sand lg:min-h-0 lg:gap-[calc(14*var(--u))] lg:py-0'
const FOOTER_HEADING =
  'font-sans text-[1.0625rem] font-medium tracking-wide text-olive uppercase lg:text-[length:clamp(1.0625rem,calc(25*var(--u)),2.75rem)] lg:font-normal lg:tracking-normal'

function SiteFooter() {
  const { site, footer, footerLinks, trust } = useSiteContent()
  const links = footerLinks.filter((link) => link.enabled)

  return (
    <footer className="bg-teal text-sand">
      <div className="container-site py-14 lg:w-full lg:pt-[calc(52*var(--u))] lg:pb-[calc(93*var(--u))]">
        <TrustStrip items={trust} />

        <div className="mt-14 grid gap-12 lg:mt-[calc(67*var(--u))] lg:ml-[calc(239*var(--u))] lg:grid-cols-[calc(745*var(--u))_calc(388*var(--u))_1fr] lg:gap-0">
          <div>
            <img
              src={footerLogo}
              alt={site.name}
              width={147}
              height={135}
              loading="lazy"
              className="h-[5.75rem] w-auto lg:h-[calc(135*var(--u))]"
            />
            <p className="mt-6 max-w-[16rem] font-light text-foot text-sand lg:mt-[calc(35*var(--u))] lg:max-w-none lg:whitespace-nowrap lg:text-[length:clamp(0.9375rem,calc(22*var(--u)),2.5rem)] lg:leading-[1.2]">
              {renderRichText(site.tagline)}
            </p>
          </div>

          <nav aria-label={footer.quickLinksTitle}>
            <h2 className={FOOTER_HEADING}>{footer.quickLinksTitle}</h2>
            <ul className="mt-5 lg:mt-[calc(10*var(--u))]">
              {links.map((link) => (
                <li key={link.id}>
                  <Link
                    to={link.href}
                    className="inline-flex min-h-11 items-center rounded text-foot text-sand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sand lg:min-h-[calc(42*var(--u))] lg:text-[length:clamp(0.875rem,calc(18*var(--u)),2.25rem)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className={FOOTER_HEADING}>{footer.contactTitle}</h2>
            <ul className="mt-5 lg:mt-[calc(19*var(--u))] lg:space-y-[calc(18*var(--u))]">
              <li>
                <a href={buildWhatsAppUrl(site.whatsapp)} target="_blank" rel="noopener" className={CONTACT_LINK}>
                  <img src={footerWhatsapp} alt="" aria-hidden="true" className="size-[1.1em] lg:size-[calc(20*var(--u))]" />
                  <span className="text-foot">
                    {site.whatsappLabel.slice(0, 2)} <strong className="font-bold">{site.whatsappLabel.slice(3)}</strong>
                    <span className="sr-only"> (WhatsApp)</span>
                  </span>
                </a>
              </li>
              <li className="flex min-h-11 items-start gap-3 py-2 text-sand lg:min-h-0 lg:gap-[calc(14*var(--u))] lg:py-0">
                <img src={footerPin} alt="" aria-hidden="true" className="mt-0.5 size-[1.1em] shrink-0 lg:size-[calc(20*var(--u))]" />
                <span className="text-foot font-medium text-[#e9e3ba] lg:max-w-[calc(290*var(--u))]">{site.regionLine}</span>
              </li>
              <li>
                <a href={site.instagramUrl} target="_blank" rel="noopener" className={CONTACT_LINK}>
                  <img src={footerInstagram} alt="" aria-hidden="true" className="size-[1.1em] lg:size-[calc(20*var(--u))]" />
                  <span className="text-foot font-bold">
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
