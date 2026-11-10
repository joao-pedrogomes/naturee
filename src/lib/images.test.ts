import { describe, expect, it } from 'vitest'
import { buildImage } from '@/lib/images'

describe('buildImage', () => {
  it('uses the largest variant as src and builds a srcSet', () => {
    const image = buildImage({
      alt: 'Caminhão',
      height: 596,
      variants: [
        { src: '/a-640.webp', width: 640 },
        { src: '/a-1440.webp', width: 1440 },
      ],
      sizes: '100vw',
    })
    expect(image).toEqual({
      src: '/a-1440.webp',
      alt: 'Caminhão',
      width: 1440,
      height: 596,
      srcSet: '/a-1440.webp 1440w, /a-640.webp 640w',
      sizes: '100vw',
    })
  })
})
