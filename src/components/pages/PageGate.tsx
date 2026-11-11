import type { ReactNode } from 'react'
import { usePage } from '@/content/siteContent'
import type { PageKey } from '@/content/types'
import NotFound from '@/pages/NotFound'

type PageGateProps = {
  pageKey: PageKey
  children: ReactNode
}

function PageGate({ pageKey, children }: PageGateProps) {
  const page = usePage(pageKey)
  if (!page.enabled) return <NotFound />
  return children
}

export default PageGate
