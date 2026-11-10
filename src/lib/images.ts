import type { Image } from '@/content/types'

export type ImageVariant = { src: string; width: number }

type BuildImageInput = {
  alt: string
  variants: ImageVariant[]
  height: number
  sizes?: string
}

/** Largest variant becomes `src`; `height` is the largest variant's height. */
export function buildImage({ alt, variants, height, sizes }: BuildImageInput): Image {
  const sorted = [...variants].sort((a, b) => b.width - a.width)
  const largest = sorted[0]
  if (!largest) throw new Error(`Image "${alt}" needs at least one variant`)

  return {
    src: largest.src,
    alt,
    width: largest.width,
    height,
    srcSet: sorted.map((variant) => `${variant.src} ${variant.width}w`).join(', '),
    sizes,
  }
}
