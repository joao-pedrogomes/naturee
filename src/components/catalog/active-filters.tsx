import type { JSX } from "react"
import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export type ActiveFilterChip = {
  facet: "marca" | "categoria" | "q"
  value: string
  label: string
}

const FACET_PREFIX: Record<ActiveFilterChip["facet"], string> = {
  marca: "Marca",
  categoria: "Categoria",
  q: "Busca",
}

/** `Busca: "shiitake"` for a query chip, `Marca: Sítio Pura Vida` otherwise. */
function chipText(chip: ActiveFilterChip): string {
  const prefix = FACET_PREFIX[chip.facet]
  return chip.facet === "q"
    ? `${prefix}: "${chip.label}"`
    : `${prefix}: ${chip.label}`
}

export function ActiveFilters({
  chips,
  onRemove,
  onClearAll,
}: {
  chips: ActiveFilterChip[]
  onRemove: (chip: ActiveFilterChip) => void
  onClearAll: () => void
}): JSX.Element | null {
  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="sr-only">Filtros ativos</span>
      {chips.map((chip) => {
        const text = chipText(chip)

        return (
          <span
            key={`${chip.facet}:${chip.value}`}
            className="inline-flex h-7 items-center gap-1 rounded-4xl bg-muted py-0.5 pr-1 pl-2.5 text-xs font-medium text-foreground"
          >
            <span className="max-w-48 truncate">{text}</span>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Remover filtro ${text}`}
              onClick={() => onRemove(chip)}
              className="rounded-4xl text-muted-foreground hover:text-foreground"
            >
              <XIcon />
            </Button>
          </span>
        )
      })}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="text-muted-foreground hover:text-foreground"
      >
        Limpar tudo
      </Button>
    </div>
  )
}
