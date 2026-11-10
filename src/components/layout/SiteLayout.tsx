import { Outlet } from 'react-router-dom'
import SiteFooter from '@/components/layout/SiteFooter'
import SiteHeader from '@/components/layout/SiteHeader'
import SkipLink, { MAIN_CONTENT_ID } from '@/components/layout/SkipLink'

function SiteLayout() {
  return (
    <div className="relative flex min-h-svh flex-col">
      <SkipLink />
      <SiteHeader />
      <main id={MAIN_CONTENT_ID} className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}

export default SiteLayout
