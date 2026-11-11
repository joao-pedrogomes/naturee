import { preload } from 'react-dom'
import type { Image } from '@/content/types'
import { cn } from '@/lib/utils'

type PictureProps = {
  image: Image
  priority?: boolean
  className?: string
}

function Picture({ image, priority = false, className }: PictureProps) {
  if (priority) {
    preload(image.src, { as: 'image', fetchPriority: 'high', imageSrcSet: image.srcSet, imageSizes: image.sizes })
  }

  return (
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={image.sizes}
      alt={image.alt}
      width={image.width}
      height={image.height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      className={cn('block', className)}
    />
  )
}

export default Picture
