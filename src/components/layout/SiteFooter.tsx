import { Link } from 'react-router-dom'
import { holdLine } from '@/lib/layout'
import { renderRichText } from '@/lib/richText'
import TrustStrip from '@/components/sections/TrustStrip'
import { useSiteContent, visibleLinks } from '@/content/siteContent'
import { pathFor } from '@/routes'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import footerLogo from '@/assets/logos/natureeSeal.svg'
import footerMail from '@/assets/icons/footerMail.svg'
import footerInstagram from '@/assets/icons/footerInstagram.svg'
import footerPin from '@/assets/icons/footerPin.svg'
import footerWhatsapp from '@/assets/icons/footerWhatsapp.svg'

const CONTACT_LINK =
  'inline-flex min-h-11 items-center gap-3 rounded py-2 text-sand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sand lg:min-h-0 lg:gap-[calc(14*var(--u))] lg:py-0'
const FOOTER_HEADING =
  'font-sans text-[1.0625rem] font-medium tracking-wide text-olive uppercase lg:text-[length:clamp(1.0625rem,calc(25*var(--u)),2.75rem)] lg:font-normal lg:tracking-normal'

/** Bolds everything after the first space, whatever format the editor typed. */
function areaCode(label: string): string {
  const space = label.indexOf(' ')
  return space === -1 ? '' : label.slice(0, space)
}

function localNumber(label: string): string {
  const space = label.indexOf(' ')
  return space === -1 ? label : label.slice(space + 1)
}

function SiteFooter() {
  const content = useSiteContent()
  const { site, footer, footerLinks, trust } = content
  const links = visibleLinks(content, footerLinks)
  const privacyEnabled = content.pages.privacy.enabled
  const identification = [site.legalName, site.cnpj ? `CNPJ ${site.cnpj}` : '', site.legalAddress].filter(Boolean)

  return (
    <footer className="bg-teal text-sand shadow-[0_-1px_0_0_var(--teal)]">
      <div className="container-site py-14 lg:w-full lg:pt-[calc(52*var(--u))] lg:pb-[calc(48*var(--u))]">
        <TrustStrip items={trust} />

        <div className="mt-14 grid gap-12 md:grid-cols-[1fr_0.8fr_1.4fr] md:gap-8 lg:mt-[calc(67*var(--u))] lg:mx-auto lg:w-[calc(1431*var(--u))] lg:grid-cols-[calc(745*var(--u))_calc(388*var(--u))_1fr] lg:gap-0">
          {/* On desktop the tagline's last line shares a baseline with the last quick link, so the block ends level with that list. */}
          <div className="lg:[align-self:last_baseline]">
            <img
              src={footerLogo}
              alt={site.name}
              width={103}
              height={79}
              loading="lazy"
              className="h-[3.45rem] w-auto max-sm:mx-auto lg:h-[calc(81*var(--u))]"
            />
            <p className={`mt-4 max-w-[16rem] max-sm:mx-auto font-light text-foot text-sand lg:mt-[calc(23*var(--u))] lg:max-w-none ${holdLine(site.tagline)} lg:text-[length:clamp(0.9375rem,calc(22*var(--u)),2.5rem)] lg:leading-[1.2]`}>
              {renderRichText(site.tagline)}
            </p>
          </div>

          <nav aria-label={footer.quickLinksTitle} className="lg:[align-self:last_baseline]">
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
                    {areaCode(site.whatsappLabel)} <strong className="font-bold">{localNumber(site.whatsappLabel)}</strong>
                    <span className="sr-only"> (WhatsApp)</span>
                  </span>
                </a>
              </li>
              <li className="flex min-h-11 items-start gap-3 py-2 max-sm:justify-center text-sand lg:min-h-0 lg:gap-[calc(14*var(--u))] lg:py-0">
                <img src={footerPin} alt="" aria-hidden="true" className="mt-0.5 size-[1.1em] shrink-0 lg:size-[calc(20*var(--u))]" />
                <span className="text-foot font-medium text-[#e9e3ba] lg:w-max lg:max-w-[max(calc(340*var(--u)),17rem)] lg:shrink-0 whitespace-pre-line">{site.regionLine}</span>
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
              {site.email ? (
                <li>
                  <a href={`mailto:${site.email}`} className={CONTACT_LINK}>
                    <img src={footerMail} alt="" aria-hidden="true" className="size-[1.1em] lg:size-[calc(20*var(--u))]" />
                    <span className="text-foot">
                      <span className="sr-only">E-mail </span>
                      {site.email}
                    </span>
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        {/* Legal note: a hairline, then the copyright on the left and the company identification on the right (stacked and centred below the desktop width). */}
        <div className="mt-12 border-t border-white/10 pt-6 text-center text-[0.8125rem] leading-relaxed text-white/60 lg:mx-auto lg:mt-[calc(64*var(--u))] lg:flex lg:w-[calc(1431*var(--u))] lg:items-start lg:justify-between lg:gap-[calc(40*var(--u))] lg:pt-[calc(28*var(--u))] lg:text-left lg:text-[length:clamp(0.75rem,calc(15*var(--u)),1rem)]">
          <div>
            <p>
              © {new Date().getFullYear()} {site.name}. {footer.rights}
            </p>
            {privacyEnabled ? (
              <p className="mt-1">
                <Link to={pathFor('privacy')} className="underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sand">
                  {footer.privacyLink}
                </Link>
              </p>
            ) : null}
          </div>
          {identification.length ? (
            <p className="mt-2 lg:mt-0 lg:max-w-[calc(900*var(--u))] lg:text-right">
              {identification.map((part, index) => (
                <span key={part} className="max-sm:block">
                  {index > 0 ? <span aria-hidden="true" className="max-sm:hidden"> · </span> : null}
                  {part}
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
