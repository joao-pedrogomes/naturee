import type { ReactNode } from 'react'
import { useSiteContent } from '@/content/siteContent'
import type { ContactPage } from '@/content/types'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import footerInstagram from '@/assets/icons/footerInstagram.svg'
import footerPin from '@/assets/icons/footerPin.svg'
import footerWhatsapp from '@/assets/icons/footerWhatsapp.svg'
import planningClock from '@/assets/icons/planningClock.svg'

const HEADING =
  'flex items-center gap-4 font-sans text-[length:clamp(1.125rem,calc(34*var(--u)),3.25rem)] leading-[1.15] font-semibold tracking-normal text-olive uppercase lg:gap-[calc(36*var(--u))]'
const HEADING_ICON = 'size-6 shrink-0 lg:size-[calc(32*var(--u))]'
const INDENT = 'pl-10 lg:pl-[calc(68*var(--u))]'
const COPY = 'text-body text-black lg:leading-[1.25]'
const SOCIAL_LINK =
  'inline-flex size-11 items-center justify-center rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive-deep lg:size-[calc(48*var(--u))]'

function mapEmbedUrl(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&hl=pt-BR&z=16&output=embed`
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p className={`${COPY} ${INDENT}`}>
      <strong className="font-bold">{label}</strong> {children}
    </p>
  )
}

type LocationCardProps = {
  page: Pick<ContactPage, 'location' | 'hours' | 'social'>
}

/** Address, opening hours and social links beside an embedded Google map; the map drops below the text on small screens. Square at the bottom: it sits flush on the footer. */
function LocationCard({ page }: LocationCardProps) {
  const { site } = useSiteContent()
  const { location, hours, social } = page

  return (
    <div className="grid gap-10 rounded-t-3xl bg-sand px-6 py-10 sm:px-10 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-[calc(94*var(--u))] lg:rounded-t-[calc(36*var(--u))] lg:px-[calc(97*var(--u))] lg:py-[calc(114*var(--u))]">
      <div className="space-y-10 lg:space-y-[calc(48*var(--u))]">
        <section aria-labelledby="contact-location">
          <h2 id="contact-location" className={HEADING}>
            <img src={footerPin} alt="" aria-hidden="true" className={HEADING_ICON} />
            {location.title}
          </h2>
          <address className={`mt-4 whitespace-pre-line not-italic ${COPY} ${INDENT} lg:mt-[calc(30*var(--u))]`}>{location.address}</address>
          <div className="mt-3 lg:mt-[calc(16*var(--u))]">
            <Labeled label={location.cityLabel}>{location.city}</Labeled>
          </div>
        </section>

        <section aria-labelledby="contact-hours">
          <h2 id="contact-hours" className={HEADING}>
            <img src={planningClock} alt="" aria-hidden="true" className={HEADING_ICON} />
            {hours.title}
          </h2>
          <div className="mt-4 space-y-3 lg:mt-[calc(30*var(--u))] lg:space-y-[calc(16*var(--u))]">
            <Labeled label={hours.daysLabel}>{hours.days}</Labeled>
            <Labeled label={hours.timeLabel}>{hours.time}</Labeled>
          </div>
        </section>

        <section aria-labelledby="contact-social">
          <h2 id="contact-social" className={`${HEADING} ${INDENT}`}>
            {social.title}
          </h2>
          <ul className={`mt-4 flex items-center gap-3 ${INDENT} lg:mt-[calc(26*var(--u))] lg:gap-[calc(20*var(--u))]`}>
            <li>
              <a href={site.instagramUrl} target="_blank" rel="noopener" className={SOCIAL_LINK}>
                <img src={footerInstagram} alt="" aria-hidden="true" className="size-8 lg:size-[calc(34*var(--u))]" />
                <span className="sr-only">Instagram {site.instagram}</span>
              </a>
            </li>
            <li>
              <a href={buildWhatsAppUrl(site.whatsapp)} target="_blank" rel="noopener" className={SOCIAL_LINK}>
                <img src={footerWhatsapp} alt="" aria-hidden="true" className="size-8 lg:size-[calc(34*var(--u))]" />
                <span className="sr-only">WhatsApp {site.whatsappLabel}</span>
              </a>
            </li>
          </ul>
        </section>
      </div>

      <iframe
        title={location.mapTitle}
        src={mapEmbedUrl(location.mapQuery)}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="aspect-[4/3] w-full rounded-2xl border-0 bg-cream lg:aspect-[6/5] lg:rounded-[calc(28*var(--u))]"
      />
    </div>
  )
}

export default LocationCard
