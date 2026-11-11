import { describe, expect, it } from 'vitest'
import { scaledSize } from '@/admin/imageProcessing'

describe('scaledSize', () => {
  it('keeps small images as they are', () => {
    expect(scaledSize(800, 600, 1440)).toEqual({ width: 800, height: 600 })
  })

  it('scales wide images down keeping the aspect ratio', () => {
    expect(scaledSize(2880, 1440, 1440)).toEqual({ width: 1440, height: 720 })
    expect(scaledSize(4000, 3000, 720)).toEqual({ width: 720, height: 540 })
  })
})
