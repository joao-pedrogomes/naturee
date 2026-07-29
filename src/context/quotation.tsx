import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { products } from '@/data/products'
import type { Product } from '@/types/catalog'

/** Bumped whenever the persisted shape changes, so old values are simply ignored. */
export const QUOTATION_STORAGE_KEY = 'naturee.quotation.v1'

export type QuotationItem = {
  productId: string
  qty: number
  addedAt: string
}

type QuotationContextValue = {
  items: QuotationItem[]
  /** Number of distinct products, never the sum of quantities. */
  count: number
  has: (productId: string) => boolean
  add: (product: Product) => void
  remove: (productId: string) => void
  setQty: (productId: string, qty: number) => void
  clear: () => void
}

const QuotationContext = createContext<QuotationContextValue | null>(null)

const CATALOG_PRODUCT_IDS = products.map((product) => product.id)

function readStoredValue(): unknown {
  try {
    return parseStoredValue(window.localStorage.getItem(QUOTATION_STORAGE_KEY))
  } catch {
    // Storage can be unavailable (private mode, blocked cookies). Start empty.
    return null
  }
}

function parseStoredValue(raw: string | null): unknown {
  if (raw === null) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Turns whatever was in storage into a list we can trust: unknown shapes,
 * duplicates and products that left the catalog are dropped instead of thrown.
 */
function sanitize(raw: unknown, knownProductIds: Set<string>): QuotationItem[] {
  if (!Array.isArray(raw)) return []

  const items: QuotationItem[] = []
  const seen = new Set<string>()

  for (const entry of raw) {
    if (typeof entry !== 'object' || entry === null) continue

    const { productId, qty, addedAt } = entry as Partial<QuotationItem>
    if (typeof productId !== 'string' || productId === '') continue
    if (typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1) continue
    if (!knownProductIds.has(productId) || seen.has(productId)) continue

    seen.add(productId)
    items.push({
      productId,
      qty,
      addedAt: typeof addedAt === 'string' ? addedAt : new Date().toISOString(),
    })
  }

  return items
}

function persist(items: QuotationItem[]) {
  try {
    window.localStorage.setItem(QUOTATION_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // A full or unavailable storage must not break the page; state stays in memory.
  }
}

export function QuotationProvider({
  children,
  knownProductIds,
}: {
  children: ReactNode
  /** Ids accepted on hydration. Defaults to the whole catalog; tests pass their own. */
  knownProductIds?: string[]
}) {
  const known = useMemo(
    () => new Set(knownProductIds ?? CATALOG_PRODUCT_IDS),
    [knownProductIds],
  )

  const [items, setItems] = useState<QuotationItem[]>(() => sanitize(readStoredValue(), known))

  useEffect(() => {
    persist(items)
  }, [items])

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      // A null key means the whole storage was cleared.
      if (event.key !== null && event.key !== QUOTATION_STORAGE_KEY) return
      setItems(sanitize(parseStoredValue(event.newValue), known))
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [known])

  const has = useCallback(
    (productId: string) => items.some((item) => item.productId === productId),
    [items],
  )

  const add = useCallback((product: Product) => {
    setItems((prev) =>
      prev.some((item) => item.productId === product.id)
        ? prev
        : [...prev, { productId: product.id, qty: 1, addedAt: new Date().toISOString() }],
    )
  }, [])

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId))
  }, [])

  const setQty = useCallback((productId: string, qty: number) => {
    const next = Number.isFinite(qty) ? Math.floor(qty) : 0
    setItems((prev) => {
      if (next < 1) return prev.filter((item) => item.productId !== productId)
      return prev.map((item) => (item.productId === productId ? { ...item, qty: next } : item))
    })
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<QuotationContextValue>(
    () => ({ items, count: items.length, has, add, remove, setQty, clear }),
    [items, has, add, remove, setQty, clear],
  )

  return <QuotationContext.Provider value={value}>{children}</QuotationContext.Provider>
}

export function useQuotation(): QuotationContextValue {
  const context = useContext(QuotationContext)
  if (context === null) {
    throw new Error('useQuotation must be used inside a QuotationProvider')
  }
  return context
}
