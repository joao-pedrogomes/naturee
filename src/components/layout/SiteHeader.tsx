import { Link, useLocation } from 'react-router-dom'
import MobileNav from '@/components/layout/MobileNav'
import NavLinks from '@/components/layout/NavLinks'
import WhatsAppPill from '@/components/layout/WhatsAppPill'
import { useSiteContent } from '@/content/siteContent'
import { cn } from '@/lib/utils'
import logo from '@/assets/logos/naturee.svg'

const LEFT_LINK_COUNT = 3
const DESKTOP_LINK = 'lg:text-[length:clamp(0.9375rem,calc(25*var(--u)),2.75rem)] lg:min-h-[calc(50*var(--u))]'

function SiteHeader() {
  const { nav, site } = useSiteContent()
  const { pathname } = useLocation()
  const overlaysHero = pathname === '/'
  const enabled = nav.filter((link) => link.enabled)
  const leftLinks = enabled.slice(0, LEFT_LINK_COUNT)
  const rightLinks = enabled.slice(LEFT_LINK_COUNT)

  return (
    <header
      className={cn(
        'z-30 w-full text-sand lg:h-[calc(306*var(--u))]',
        overlaysHero ? 'absolute inset-x-0 top-0 bg-linear-to-b from-black/60 to-transparent' : 'bg-teal',
      )}
    >
      <div className="relative flex h-full min-h-20 items-center justify-between px-4 py-3 sm:px-6 lg:py-0 lg:pr-[calc(129*var(--u))] lg:pl-[calc(231*var(--u))]">
        <Link
          to="/"
          className="shrink-0 rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sand lg:absolute lg:top-[calc(72*var(--u))] lg:left-1/2 lg:-translate-x-1/2"
        >
          <img
            src={logo}
            alt={site.name}
            width={161}
            height={147}
            className="h-16 w-auto lg:h-[calc(147*var(--u))]"
            fetchPriority="high"
          />
        </Link>

        <nav aria-label="Principal" className="hidden lg:block lg:pt-[calc(24*var(--u))]">
          <NavLinks links={leftLinks} className="lg:gap-[calc(78*var(--u))]" linkClassName={DESKTOP_LINK} />
        </nav>

        <nav aria-label="Secundária" className="hidden items-center lg:flex lg:gap-[calc(75*var(--u))] lg:pt-[calc(24*var(--u))]">
          <NavLinks links={rightLinks} className="lg:gap-[calc(71*var(--u))]" linkClassName={DESKTOP_LINK} />
          <WhatsAppPill />
        </nav>

        <div className="ml-auto lg:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

export default SiteHeader
