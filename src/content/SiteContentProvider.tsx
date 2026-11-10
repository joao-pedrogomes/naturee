import type { ReactNode } from 'react'
import { defaultContent } from '@/content/defaultContent'
import { SiteContentContext } from '@/content/siteContent'
import type { SiteContent } from '@/content/types'

type SiteContentProviderProps = {
  content?: SiteContent
  children: ReactNode
}

function SiteContentProvider({ content = defaultContent, children }: SiteContentProviderProps) {
  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>
}

export default SiteContentProvider
