import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import MobileNav from '@/components/layout/MobileNav'
import NavLinks from '@/components/layout/NavLinks'
import WhatsAppPill from '@/components/layout/WhatsAppPill'
import { useSiteContent, visibleLinks } from '@/content/siteContent'
import { cn } from '@/lib/utils'
import logo from '@/assets/logos/naturee.svg'

const STICK_AT = 80
const UNSTICK_AT = 20
const DESKTOP_LINK = 'xl:text-[length:clamp(0.8125rem,calc(19.3*var(--u)),2.4rem)] xl:min-h-[calc(50*var(--u))]'

function useStuck() {
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    function update() {
      setStuck((current) => (current ? window.scrollY > UNSTICK_AT : window.scrollY > STICK_AT))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return stuck
}

function SiteHeader() {
  const content = useSiteContent()
  const { nav, site } = content
  const { pathname } = useLocation()
  const stuck = useStuck()
  const overlaysHero = pathname === '/'
  const links = visibleLinks(content, nav)

  return (
    <div className={cn('z-30 h-20 w-full xl:h-[calc(306*var(--u))]', overlaysHero ? 'absolute inset-x-0 top-0' : 'relative')}>
      <header
        className={cn(
          'inset-x-0 top-0 z-30 w-full text-sand',
          stuck
            ? 'animate-header-in fixed h-20 bg-teal shadow-[0_2px_12px_0_rgb(0_0_0/0.25)] xl:h-[calc(130*var(--u))]'
            : cn('absolute h-full', overlaysHero ? 'bg-linear-to-b from-black/60 to-transparent' : 'bg-teal shadow-[0_1px_0_0_var(--teal)]'),
        )}
      >
        <div className="container-site relative flex h-full min-h-20 items-center justify-between py-3 xl:grid xl:grid-cols-[auto_1fr] xl:gap-x-[calc(36*var(--u))] xl:py-0">
          <Link
            to="/"
            className={cn(
              'shrink-0 rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sand xl:self-start',
              stuck ? 'xl:mt-[calc(16*var(--u))]' : 'xl:mt-[calc(84*var(--u))]',
            )}
          >
            <img
              src={logo}
              alt={site.name}
              width={161}
              height={147}
              className={cn('h-16 w-auto', stuck ? 'xl:h-[calc(98*var(--u))]' : 'xl:h-[calc(122*var(--u))]')}
              fetchPriority="high"
            />
          </Link>

          <nav
            aria-label="Principal"
            className={cn('hidden items-center xl:flex xl:justify-self-end xl:gap-[calc(64*var(--u))]', !stuck && 'xl:pt-[calc(24*var(--u))]')}
          >
            <NavLinks links={links} className="xl:gap-[calc(64*var(--u))]" linkClassName={DESKTOP_LINK} />
            <WhatsAppPill />
          </nav>

          <div className="ml-auto xl:hidden">
            <MobileNav />
          </div>
        </div>
      </header>
    </div>
  )
}

export default SiteHeader
