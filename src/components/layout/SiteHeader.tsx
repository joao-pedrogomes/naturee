import { Link, useLocation } from 'react-router-dom'
import MobileNav from '@/components/layout/MobileNav'
import NavLinks from '@/components/layout/NavLinks'
import WhatsAppPill from '@/components/layout/WhatsAppPill'
import { useSiteContent } from '@/content/siteContent'
import { cn } from '@/lib/utils'
import logo from '@/assets/logos/naturee.svg'

const LEFT_LINK_COUNT = 3

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
        'z-30 w-full text-sand',
        overlaysHero ? 'absolute inset-x-0 top-0 bg-linear-to-b from-black/60 to-transparent' : 'bg-teal',
      )}
    >
      <div className="container-site flex min-h-20 items-center justify-between gap-6 py-3 lg:min-h-[12.5rem] lg:py-0">
        <Link
          to="/"
          className="shrink-0 rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sand lg:order-2"
        >
          <img
            src={logo}
            alt={site.name}
            width={110}
            height={100}
            className="h-16 w-auto lg:h-[6.25rem]"
            fetchPriority="high"
          />
        </Link>

        <nav aria-label="Principal" className="hidden flex-1 items-center justify-between lg:order-1 lg:flex">
          <NavLinks links={leftLinks} className="justify-end" />
        </nav>

        <nav aria-label="Secundária" className="hidden flex-1 items-center lg:order-3 lg:flex">
          <NavLinks links={rightLinks} className="justify-start" />
          <WhatsAppPill className="ml-auto" />
        </nav>

        <div className="lg:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

export default SiteHeader
