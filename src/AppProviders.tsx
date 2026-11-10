import type { ReactNode } from 'react'
import SiteContentProvider from '@/content/SiteContentProvider'

type AppProvidersProps = {
  children: ReactNode
}

/** Shared by the client and SSR entries so both render the exact same tree. */
function AppProviders({ children }: AppProvidersProps) {
  return <SiteContentProvider>{children}</SiteContentProvider>
}

export default AppProviders
