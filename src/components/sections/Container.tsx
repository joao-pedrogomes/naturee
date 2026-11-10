import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ContainerProps = {
  className?: string
  children: ReactNode
}

function Container({ className, children }: ContainerProps) {
  return <div className={cn('container-site', className)}>{children}</div>
}

export default Container
