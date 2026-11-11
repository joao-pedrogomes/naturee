import type { ReactNode } from 'react'
import Picture from '@/components/sections/Picture'
import type { Image } from '@/content/types'
import { cn } from '@/lib/utils'

type MediaTextProps = {
  image: Image
  side: 'left' | 'right'
  children: ReactNode
  imageClassName?: string
  className?: string
}

function MediaText({ image, side, children, imageClassName, className }: MediaTextProps) {
  return (
    <div className={cn('grid items-center gap-10 md:grid-cols-2 lg:gap-[5vw]', className)}>
      <Picture
        image={image}
        className={cn('w-full rounded-2xl object-cover', side === 'right' && 'md:order-2', imageClassName)}
      />
      <div className={cn(side === 'right' && 'md:order-1')}>{children}</div>
    </div>
  )
}

export default MediaText
