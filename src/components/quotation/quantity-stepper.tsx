import { useEffect, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function QuantityStepper({
  value,
  min,
  unit,
  label,
  onChange,
  className,
}: {
  value: number
  /** Minimum order quantity: the floor, never a suggestion. */
  min: number
  unit: string
  /** Product name, used to build accessible button names. */
  label: string
  onChange: (value: number) => void
  className?: string
}) {
  // The input is free-form while focused so a value can be retyped; it is
  // reconciled against the floor on blur.
  const [draft, setDraft] = useState(String(value))

  useEffect(() => {
    setDraft(String(value))
  }, [value])

  const commit = (raw: string) => {
    const parsed = Number.parseInt(raw.replace(/\D/g, ''), 10)
    const next = Number.isNaN(parsed) ? min : Math.max(min, parsed)
    setDraft(String(next))
    if (next !== value) onChange(next)
  }

  const atFloor = value <= min

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-9 shrink-0"
        disabled={atFloor}
        aria-label={`Diminuir quantidade de ${label}`}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="size-4" />
      </Button>

      <div className="relative">
        <Input
          value={draft}
          inputMode="numeric"
          aria-label={`Quantidade de ${label} em ${unit}`}
          className="h-9 w-20 pr-8 text-center tabular-nums"
          onChange={(event) => setDraft(event.target.value)}
          onBlur={(event) => commit(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commit(draft)
            }
          }}
        />
        <span className="text-muted-foreground pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs">
          {unit}
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-9 shrink-0"
        aria-label={`Aumentar quantidade de ${label}`}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  )
}
