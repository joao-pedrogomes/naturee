import type { JSX } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type CatalogPaginationProps = {
  page: number
  pageCount: number
  total: number
  perPage: number
  onPageChange: (page: number) => void
}

type PageSlot = number | 'gap'

/**
 * Up to five pages are listed in full. Past that, only the first, the last and
 * the current page with its neighbours survive; the holes become ellipses.
 */
function buildSlots(page: number, pageCount: number): PageSlot[] {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  const wanted = [1, page - 1, page, page + 1, pageCount]
  const pages = [...new Set(wanted)]
    .filter((candidate) => candidate >= 1 && candidate <= pageCount)
    .sort((a, b) => a - b)

  const slots: PageSlot[] = []
  pages.forEach((current, index) => {
    const previous = pages[index - 1]
    if (index > 0 && current - previous > 1) slots.push('gap')
    slots.push(current)
  })

  return slots
}

export function CatalogPagination({
  page,
  pageCount,
  total,
  perPage,
  onPageChange,
}: CatalogPaginationProps): JSX.Element | null {
  if (pageCount <= 1) return null

  const first = (page - 1) * perPage + 1
  const last = Math.min(page * perPage, total)
  const slots = buildSlots(page, pageCount)

  return (
    <nav
      aria-label="Paginação"
      className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
    >
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        {slots.map((slot, index) =>
          slot === 'gap' ? (
            <span
              key={`gap-${index}`}
              aria-hidden="true"
              className="px-1 text-sm text-muted-foreground"
            >
              …
            </span>
          ) : (
            <Button
              key={slot}
              size="icon"
              variant={slot === page ? 'default' : 'ghost'}
              aria-current={slot === page ? 'page' : undefined}
              aria-label={`Página ${slot}`}
              className={cn('tabular-nums', slot === page && 'font-semibold')}
              onClick={() => onPageChange(slot)}
            >
              {slot}
            </Button>
          )
        )}

        <Button
          variant="outline"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="Próxima página"
        >
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight />
        </Button>
      </div>

      <p className="text-sm text-muted-foreground tabular-nums">
        {`Mostrando ${first}–${last} de ${total}`}
      </p>
    </nav>
  )
}
