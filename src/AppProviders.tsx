import type { ReactNode } from 'react'
import SiteContentProvider from '@/content/SiteContentProvider'
import type { SiteContent } from '@/content/types'

type AppProvidersProps = {
  content?: SiteContent
  children: ReactNode
}

/** Shared by the client and SSR entries so both render the exact same tree. */
function AppProviders({ content, children }: AppProvidersProps) {
  return <SiteContentProvider content={content}>{children}</SiteContentProvider>
}

export default AppProviders
