import type { PreparedImage } from '@/admin/api/types'

export const MAX_FULL_WIDTH = 1440
export const SMALL_WIDTH = 720
const FULL_LIMIT_BYTES = 550_000
const SMALL_LIMIT_BYTES = 280_000
const QUALITIES = [0.82, 0.72, 0.62, 0.5]

export class ImageProblem extends Error {
  readonly kind: 'notImage' | 'tooHeavy' | 'noWebp' | 'encodeFailed'

  constructor(kind: 'notImage' | 'tooHeavy' | 'noWebp' | 'encodeFailed') {
    super(kind)
    this.kind = kind
  }
}

export function scaledSize(width: number, height: number, maxWidth: number): { width: number; height: number } {
  if (width <= maxWidth) return { width, height }
  return { width: maxWidth, height: Math.round((height * maxWidth) / width) }
}

function toWebp(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
}

async function encode(bitmap: ImageBitmap, width: number, height: number, limit: number): Promise<Blob | null> {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new ImageProblem('encodeFailed')
  context.drawImage(bitmap, 0, 0, width, height)
  for (const quality of QUALITIES) {
    const blob = await toWebp(canvas, quality)
    if (!blob) throw new ImageProblem('encodeFailed')
    if (blob.type !== 'image/webp') throw new ImageProblem('noWebp')
    if (blob.size <= limit) return blob
  }
  return null
}

/** Resizes in the browser so the Worker only ever stores small webp files. */
export async function prepareImage(file: File): Promise<PreparedImage> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') throw new ImageProblem('notImage')

  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) throw new ImageProblem('notImage')

  try {
    const full = scaledSize(bitmap.width, bitmap.height, MAX_FULL_WIDTH)
    const fullBlob = await encode(bitmap, full.width, full.height, FULL_LIMIT_BYTES)
    if (!fullBlob) throw new ImageProblem('tooHeavy')

    const small = scaledSize(bitmap.width, bitmap.height, SMALL_WIDTH)
    const smallBlob = full.width > SMALL_WIDTH ? await encode(bitmap, small.width, small.height, SMALL_LIMIT_BYTES) : null
    return { full: fullBlob, small: smallBlob, width: full.width, height: full.height }
  } finally {
    bitmap.close()
  }
}
