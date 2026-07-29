import type { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { QUOTATION_STORAGE_KEY, QuotationProvider, useQuotation } from '@/context/quotation'
import type { Product } from '@/types/catalog'

const KNOWN = ['p-1', 'p-2', 'p-3']

function makeProduct(id: string): Product {
  return {
    id,
    slug: id,
    name: `Produto ${id}`,
    subtitle: 'Bandeja 200g',
    brandId: 'brand-1',
    categoryId: 'category-1',
    image: '/img.svg',
    description: 'Descrição',
    specs: [{ label: 'Peso', value: '200g' }],
    moq: { qty: 12, unit: 'un' },
    available: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  }
}

function wrapper({ children }: { children: ReactNode }) {
  return <QuotationProvider knownProductIds={KNOWN}>{children}</QuotationProvider>
}

function setup() {
  return renderHook(() => useQuotation(), { wrapper })
}

function stored() {
  return JSON.parse(localStorage.getItem(QUOTATION_STORAGE_KEY) ?? 'null')
}

function seed(value: unknown) {
  localStorage.setItem(
    QUOTATION_STORAGE_KEY,
    typeof value === 'string' ? value : JSON.stringify(value),
  )
}

describe('useQuotation', () => {
  it('throws a clear error when used outside a provider', () => {
    expect(() => renderHook(() => useQuotation())).toThrowError(/QuotationProvider/)
  })

  it('starts empty', () => {
    const { result } = setup()

    expect(result.current.items).toEqual([])
    expect(result.current.count).toBe(0)
    expect(result.current.has('p-1')).toBe(false)
  })

  it('adds a product at its minimum order quantity, with an ISO addedAt', () => {
    const { result } = setup()

    act(() => result.current.add(makeProduct('p-1')))

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].productId).toBe('p-1')
    // A line below the MOQ is not quotable, so that is where it starts.
    expect(result.current.items[0].qty).toBe(12)
    expect(Number.isNaN(Date.parse(result.current.items[0].addedAt))).toBe(false)
    expect(result.current.has('p-1')).toBe(true)
  })

  it('derives count from the number of distinct products, not quantities', () => {
    const { result } = setup()

    act(() => {
      result.current.add(makeProduct('p-1'))
      result.current.add(makeProduct('p-2'))
    })
    act(() => result.current.setQty('p-1', 10))

    expect(result.current.count).toBe(2)
  })

  it('is a no-op when the same product is added twice', () => {
    const { result } = setup()

    act(() => result.current.add(makeProduct('p-1')))
    act(() => result.current.setQty('p-1', 5))
    act(() => result.current.add(makeProduct('p-1')))

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].qty).toBe(5)
  })

  it('removes a product', () => {
    const { result } = setup()

    act(() => {
      result.current.add(makeProduct('p-1'))
      result.current.add(makeProduct('p-2'))
    })
    act(() => result.current.remove('p-1'))

    expect(result.current.items.map((item) => item.productId)).toEqual(['p-2'])
    expect(result.current.has('p-1')).toBe(false)
  })

  it('ignores removing a product that is not in the list', () => {
    const { result } = setup()

    act(() => result.current.add(makeProduct('p-1')))
    act(() => result.current.remove('p-9'))

    expect(result.current.count).toBe(1)
  })

  it('sets a quantity', () => {
    const { result } = setup()

    act(() => result.current.add(makeProduct('p-1')))
    act(() => result.current.setQty('p-1', 4))

    expect(result.current.items[0].qty).toBe(4)
  })

  it('removes the item when qty is 0 or negative', () => {
    const { result } = setup()

    act(() => {
      result.current.add(makeProduct('p-1'))
      result.current.add(makeProduct('p-2'))
    })
    act(() => result.current.setQty('p-1', 0))
    act(() => result.current.setQty('p-2', -3))

    expect(result.current.items).toEqual([])
    expect(result.current.count).toBe(0)
  })

  it('ignores setQty for a product that is not in the list', () => {
    const { result } = setup()

    act(() => result.current.setQty('p-9', 3))

    expect(result.current.items).toEqual([])
  })

  it('clears every item', () => {
    const { result } = setup()

    act(() => {
      result.current.add(makeProduct('p-1'))
      result.current.add(makeProduct('p-2'))
    })
    act(() => result.current.clear())

    expect(result.current.items).toEqual([])
    expect(stored()).toEqual([])
  })

  it('persists to localStorage under naturee.quotation.v1', () => {
    const { result } = setup()

    act(() => result.current.add(makeProduct('p-1')))
    act(() => result.current.setQty('p-1', 3))

    expect(stored()).toEqual([{ productId: 'p-1', qty: 3, addedAt: expect.any(String) }])
  })

  it('round-trips across a remount', () => {
    const first = setup()

    act(() => first.result.current.add(makeProduct('p-2')))
    act(() => first.result.current.setQty('p-2', 7))
    first.unmount()

    const { result } = setup()

    expect(result.current.items).toEqual([
      { productId: 'p-2', qty: 7, addedAt: expect.any(String) },
    ])
    expect(result.current.count).toBe(1)
  })

  it('recovers to an empty list when the stored value is corrupted JSON', () => {
    seed('{not json at all')

    const { result } = setup()

    expect(result.current.items).toEqual([])
  })

  it('recovers to an empty list when the stored value is not an array', () => {
    seed({ productId: 'p-1', qty: 1 })

    const { result } = setup()

    expect(result.current.items).toEqual([])
  })

  it('drops entries whose productId is not in the catalog', () => {
    seed([
      { productId: 'p-1', qty: 2, addedAt: '2026-01-01T00:00:00.000Z' },
      { productId: 'ghost', qty: 1, addedAt: '2026-01-01T00:00:00.000Z' },
    ])

    const { result } = setup()

    expect(result.current.items.map((item) => item.productId)).toEqual(['p-1'])
  })

  it('drops malformed entries but keeps the valid ones', () => {
    seed([
      null,
      'p-1',
      { productId: 42, qty: 1, addedAt: '2026-01-01T00:00:00.000Z' },
      { productId: 'p-1', qty: 0, addedAt: '2026-01-01T00:00:00.000Z' },
      { productId: 'p-2', qty: -1, addedAt: '2026-01-01T00:00:00.000Z' },
      { productId: 'p-2', qty: 1.5, addedAt: '2026-01-01T00:00:00.000Z' },
      { productId: 'p-3', qty: 2, addedAt: '2026-01-01T00:00:00.000Z' },
    ])

    const { result } = setup()

    expect(result.current.items).toEqual([
      { productId: 'p-3', qty: 2, addedAt: '2026-01-01T00:00:00.000Z' },
    ])
  })

  it('drops duplicate entries for the same product', () => {
    seed([
      { productId: 'p-1', qty: 2, addedAt: '2026-01-01T00:00:00.000Z' },
      { productId: 'p-1', qty: 9, addedAt: '2026-02-01T00:00:00.000Z' },
    ])

    const { result } = setup()

    expect(result.current.items).toEqual([
      { productId: 'p-1', qty: 2, addedAt: '2026-01-01T00:00:00.000Z' },
    ])
  })

  it('syncs when another tab writes the key', () => {
    const { result } = setup()

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: QUOTATION_STORAGE_KEY,
          newValue: JSON.stringify([
            { productId: 'p-2', qty: 4, addedAt: '2026-03-01T00:00:00.000Z' },
            { productId: 'ghost', qty: 1, addedAt: '2026-03-01T00:00:00.000Z' },
          ]),
        }),
      )
    })

    expect(result.current.items).toEqual([
      { productId: 'p-2', qty: 4, addedAt: '2026-03-01T00:00:00.000Z' },
    ])
    expect(result.current.count).toBe(1)
  })

  it('empties the list when another tab clears the key', () => {
    const { result } = setup()

    act(() => result.current.add(makeProduct('p-1')))
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', { key: QUOTATION_STORAGE_KEY, newValue: null }),
      )
    })

    expect(result.current.items).toEqual([])
  })

  it('ignores storage events for other keys', () => {
    const { result } = setup()

    act(() => result.current.add(makeProduct('p-1')))
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', { key: 'something.else', newValue: '[]' }),
      )
    })

    expect(result.current.count).toBe(1)
  })

  it('survives a corrupted value arriving from another tab', () => {
    const { result } = setup()

    act(() => result.current.add(makeProduct('p-1')))
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', { key: QUOTATION_STORAGE_KEY, newValue: '<broken>' }),
      )
    })

    expect(result.current.items).toEqual([])
  })
})

describe('useQuotation — notes and restore', () => {
  it('stores a trimmed note and persists it', () => {
    const { result } = setup()

    act(() => result.current.add(makeProduct('p-1')))
    act(() => result.current.setNote('p-1', '  sem talo  '))

    expect(result.current.items[0].note).toBe('sem talo')
    expect(stored()[0].note).toBe('sem talo')
  })

  it('drops the note when it is cleared', () => {
    const { result } = setup()

    act(() => result.current.add(makeProduct('p-1')))
    act(() => result.current.setNote('p-1', 'sem talo'))
    act(() => result.current.setNote('p-1', '   '))

    expect(result.current.items[0]).not.toHaveProperty('note')
  })

  it('caps the note at 120 characters', () => {
    const { result } = setup()

    act(() => result.current.add(makeProduct('p-1')))
    act(() => result.current.setNote('p-1', 'x'.repeat(200)))

    expect(result.current.items[0].note).toHaveLength(120)
  })

  it('hydrates items saved before notes existed', () => {
    seed([{ productId: 'p-1', qty: 12, addedAt: '2026-01-01T00:00:00.000Z' }])

    const { result } = setup()

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0]).not.toHaveProperty('note')
  })

  it('ignores a non-string note in storage', () => {
    seed([{ productId: 'p-1', qty: 12, addedAt: '2026-01-01T00:00:00.000Z', note: 42 }])

    const { result } = setup()

    expect(result.current.items[0]).not.toHaveProperty('note')
  })

  it('restores a removed item with its quantity and note', () => {
    const { result } = setup()

    act(() => result.current.add(makeProduct('p-1')))
    act(() => result.current.setQty('p-1', 24))
    act(() => result.current.setNote('p-1', 'sem talo'))

    const removed = result.current.items[0]
    act(() => result.current.remove('p-1'))
    expect(result.current.items).toHaveLength(0)

    act(() => result.current.restore(removed))
    expect(result.current.items[0]).toEqual(removed)
  })

  it('does not duplicate on restore when the item came back another way', () => {
    const { result } = setup()

    act(() => result.current.add(makeProduct('p-1')))
    act(() => result.current.restore({ productId: 'p-1', qty: 99, addedAt: '2026-01-01T00:00:00.000Z' }))

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].qty).toBe(12)
  })
})
