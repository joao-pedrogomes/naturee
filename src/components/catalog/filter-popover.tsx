import { useId, type JSX } from "react"
import { ChevronDownIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export type FilterOption = {
  value: string
  label: string
  count?: number
}

/** Above this many options the list scrolls instead of growing the popover. */
const SCROLL_THRESHOLD = 8

type FilterOptionListProps = {
  idPrefix: string
  options: FilterOption[]
  selected: string[]
  onToggle: (value: string) => void
}

/**
 * Bare checkbox list. Exported so the mobile sheet in `catalog-controls`
 * can reuse the exact same rows without a popover around them.
 */
export function FilterOptionList({
  idPrefix,
  options,
  selected,
  onToggle,
}: FilterOptionListProps): JSX.Element {
  return (
    <div className="flex flex-col gap-0.5">
      {options.map((option) => {
        const id = `${idPrefix}-${option.value}`
        const checked = selected.includes(option.value)

        return (
          <div
            key={option.value}
            className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
          >
            <Checkbox
              id={id}
              checked={checked}
              onCheckedChange={() => onToggle(option.value)}
            />
            <Label
              htmlFor={id}
              className="flex-1 cursor-pointer justify-between gap-3 py-0.5 font-normal"
            >
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              {option.count !== undefined && (
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {option.count}
                </span>
              )}
            </Label>
          </div>
        )
      })}
    </div>
  )
}

export function FilterPopover({
  label,
  options,
  selected,
  onToggle,
  onClear,
}: {
  label: string
  options: FilterOption[]
  selected: string[]
  onToggle: (value: string) => void
  onClear: () => void
}): JSX.Element {
  const idPrefix = useId()
  const count = selected.length
  const scrolls = options.length > SCROLL_THRESHOLD

  const list = (
    <FilterOptionList
      idPrefix={idPrefix}
      options={options}
      selected={selected}
      onToggle={onToggle}
    />
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-label={`Filtrar por ${label.toLowerCase()}`}
          className={cn(count > 0 && "border-primary/40")}
        >
          {label}
          {count > 0 && (
            <Badge variant="secondary" className="h-4 px-1.5 tabular-nums">
              {count}
            </Badge>
          )}
          <ChevronDownIcon
            data-icon="inline-end"
            className="text-muted-foreground"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 gap-0 p-1.5">
        {/* Fixed height rather than max-h: a Radix ScrollArea viewport is
            sized with `h-full`, which needs a definite height to scroll.
            Only reached past SCROLL_THRESHOLD options, so it is always full. */}
        {scrolls ? <ScrollArea className="h-72">{list}</ScrollArea> : list}
        <Separator className="my-1.5" />
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            disabled={count === 0}
            onClick={onClear}
          >
            Limpar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
