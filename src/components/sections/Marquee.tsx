import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type MarqueeProps = {
  children: ReactNode
  className?: string
}

const HIDDEN_COPIES = [1, 2, 3]

function Marquee({ children, className }: MarqueeProps) {
  return (
    <div className={cn('group flex overflow-hidden', className)}>
      <div className="flex w-max animate-marquee items-center group-hover:[animation-play-state:paused]">
        <ul className="flex shrink-0 items-center">{children}</ul>
        {HIDDEN_COPIES.map((copy) => (
          <ul key={copy} aria-hidden="true" className="flex shrink-0 items-center">
            {children}
          </ul>
        ))}
      </div>
    </div>
  )
}

export default Marquee
