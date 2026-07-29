import { useEffect, useId, useRef, useState, type JSX } from "react"
import { SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react"

import { ActiveFilters, type ActiveFilterChip } from "./active-filters"
import { FilterOptionList, FilterPopover, type FilterOption } from "./filter-popover"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type CatalogView = "produtos" | "marcas"
type CatalogSort = "az" | "za" | "recentes" | "marca"
type FacetName = "marca" | "categoria"

const SEARCH_DEBOUNCE_MS = 250

const SORT_LABELS: Record<CatalogSort, string> = {
  az: "Nome (A–Z)",
  za: "Nome (Z–A)",
  recentes: "Mais recentes",
  marca: "Marca",
}

const PRODUCT_SORTS: CatalogSort[] = ["az", "za", "recentes", "marca"]
const BRAND_SORTS: CatalogSort[] = ["az", "za"]

type CatalogControlsProps = {
  view: CatalogView
  q: string
  marca: string[]
  categoria: string[]
  ordenar: CatalogSort
  brandOptions: FilterOption[]
  categoryOptions: FilterOption[]
  chips: ActiveFilterChip[]
  resultLabel: string
  onViewChange: (view: CatalogView) => void
  onQueryChange: (q: string) => void
  onToggleFilter: (facet: FacetName, value: string) => void
  onClearFacet: (facet: FacetName) => void
  onSortChange: (ordenar: CatalogSort) => void
  onRemoveChip: (chip: ActiveFilterChip) => void
  onClearAll: () => void
}

/**
 * Keeps the typed query local and only reports it upstream after the user
 * pauses. An external change to `q` (chip removal, "Limpar tudo") overwrites
 * the draft; the value we ourselves emitted does not, so fast typing is never
 * clobbered by the round trip through the URL.
 */
function useDebouncedQuery(
  q: string,
  onQueryChange: (q: string) => void
): [string, (next: string) => void] {
  const [draft, setDraft] = useState(q)
  const emittedRef = useRef(q)
  const onQueryChangeRef = useRef(onQueryChange)

  useEffect(() => {
    onQueryChangeRef.current = onQueryChange
  })

  useEffect(() => {
    if (q === emittedRef.current) return
    emittedRef.current = q
    setDraft(q)
  }, [q])

  useEffect(() => {
    if (draft === emittedRef.current) return
    const timer = setTimeout(() => {
      emittedRef.current = draft
      onQueryChangeRef.current(draft)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [draft])

  return [draft, setDraft]
}

export function CatalogControls({
  view,
  q,
  marca,
  categoria,
  ordenar,
  brandOptions,
  categoryOptions,
  chips,
  resultLabel,
  onViewChange,
  onQueryChange,
  onToggleFilter,
  onClearFacet,
  onSortChange,
  onRemoveChip,
  onClearAll,
}: CatalogControlsProps): JSX.Element {
  const searchId = useId()
  const sheetIdPrefix = useId()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [draft, setDraft] = useDebouncedQuery(q, onQueryChange)

  const isBrands = view === "marcas"
  const sortOptions = isBrands ? BRAND_SORTS : PRODUCT_SORTS
  // `ordenar` is preserved across tabs, so it can hold a product-only value
  // while the Marcas tab is showing. Fall back rather than render a blank.
  const sortValue = sortOptions.includes(ordenar) ? ordenar : "az"
  const activeFacetCount = marca.length + (isBrands ? 0 : categoria.length)

  const searchLabel = isBrands ? "Buscar marcas" : "Buscar produtos"

  const sortSelect = (className?: string) => (
    <Select
      value={sortValue}
      onValueChange={(value) => onSortChange(value as CatalogSort)}
    >
      <SelectTrigger aria-label="Ordenar resultados" className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {sortOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {SORT_LABELS[option]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )

  return (
    <div className="sticky top-14 z-30 border-b bg-background/80 py-3 backdrop-blur">
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-2.5 md:flex-row md:items-center">
          <Tabs
            value={view}
            onValueChange={(value) => onViewChange(value as CatalogView)}
            className="w-full md:w-auto"
          >
            <TabsList className="w-full md:w-fit">
              <TabsTrigger value="produtos">Produtos</TabsTrigger>
              <TabsTrigger value="marcas">Marcas</TabsTrigger>
            </TabsList>
          </Tabs>

          <Label htmlFor={searchId} className="sr-only">
            {searchLabel}
          </Label>
          <InputGroup className="w-full md:flex-1">
            <InputGroupAddon align="inline-start">
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              id={searchId}
              type="search"
              value={draft}
              placeholder={`${searchLabel}…`}
              onChange={(event) => setDraft(event.target.value)}
              // The native WebKit clear affordance would duplicate our X.
              className="[&::-webkit-search-cancel-button]:hidden"
            />
            {draft.length > 0 && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  aria-label="Limpar busca"
                  onClick={() => setDraft("")}
                >
                  <XIcon />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>

          <div className="hidden items-center gap-2 md:flex">
            <FilterPopover
              label="Marca"
              options={brandOptions}
              selected={marca}
              onToggle={(value) => onToggleFilter("marca", value)}
              onClear={() => onClearFacet("marca")}
            />
            {!isBrands && (
              <FilterPopover
                label="Categoria"
                options={categoryOptions}
                selected={categoria}
                onToggle={(value) => onToggleFilter("categoria", value)}
                onClear={() => onClearFacet("categoria")}
              />
            )}
            {sortSelect("w-40")}
          </div>
        </div>

        {/* Mobile: everything the desktop row holds, behind one sheet. */}
        <div className="flex md:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <SlidersHorizontalIcon data-icon="inline-start" />
                Filtros
                {activeFacetCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="h-4 px-1.5 tabular-nums"
                  >
                    {activeFacetCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh] gap-0 p-0">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
                <SheetDescription>
                  Refine a lista por marca, categoria e ordenação.
                </SheetDescription>
              </SheetHeader>
              <Separator />
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col gap-4">
                  <section className="flex flex-col gap-1.5">
                    <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Marca
                    </h3>
                    <FilterOptionList
                      idPrefix={`${sheetIdPrefix}-marca`}
                      options={brandOptions}
                      selected={marca}
                      onToggle={(value) => onToggleFilter("marca", value)}
                    />
                  </section>

                  {!isBrands && (
                    <section className="flex flex-col gap-1.5">
                      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Categoria
                      </h3>
                      <FilterOptionList
                        idPrefix={`${sheetIdPrefix}-categoria`}
                        options={categoryOptions}
                        selected={categoria}
                        onToggle={(value) => onToggleFilter("categoria", value)}
                      />
                    </section>
                  )}

                  <section className="flex flex-col gap-1.5">
                    <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Ordenar
                    </h3>
                    {sortSelect("w-full")}
                  </section>
                </div>
              </div>
              <SheetFooter className="flex-row gap-2 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={activeFacetCount === 0}
                  onClick={() => {
                    onClearFacet("marca")
                    if (!isBrands) onClearFacet("categoria")
                  }}
                >
                  Limpar
                </Button>
                {/* Changes apply as they are made; this only dismisses. */}
                <Button className="flex-1" onClick={() => setSheetOpen(false)}>
                  Aplicar
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        <ActiveFilters
          chips={chips}
          onRemove={onRemoveChip}
          onClearAll={onClearAll}
        />

        <p
          role="status"
          aria-live="polite"
          className="text-xs text-muted-foreground"
        >
          {resultLabel}
        </p>
      </div>
    </div>
  )
}
