import { PlusIcon, TagIcon, Trash2Icon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { useQuotation } from "@/context/quotation"
import type { Product } from "@/types/catalog"

/**
 * Product detail. Renders nothing until a product is supplied, so the page can
 * mount it unconditionally and let the route decide when it opens.
 */
export function ProductDialog({
  product,
  brandName,
  categoryName,
  onClose,
}: {
  product: Product | undefined
  brandName: string
  categoryName: string
  onClose: () => void
}): React.JSX.Element | null {
  const { has, add, remove } = useQuotation()

  if (!product) return null

  const added = has(product.id)

  const handleToggle = () => {
    if (added) {
      remove(product.id)
      return
    }

    add(product)
    toast.success("Adicionado ao orçamento", {
      action: {
        label: "Desfazer",
        onClick: () => remove(product.id),
      },
    })
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="grid h-dvh max-h-dvh w-full max-w-full grid-rows-[minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-none p-0 sm:h-auto sm:max-h-[min(90dvh,44rem)] sm:max-w-2xl sm:rounded-xl"
      >
        <div className="min-h-0 overflow-y-auto">
          <div className="relative aspect-4/3 w-full overflow-hidden bg-muted sm:aspect-[2/1]">
            <img
              src={product.image}
              alt={product.name}
              className="size-full object-cover"
            />
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              <Badge variant="secondary">{categoryName}</Badge>
              {!product.available && (
                <Badge className="bg-clay text-clay-foreground">
                  Sob encomenda
                </Badge>
              )}
            </div>
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-2.5 right-2.5 bg-background/80 backdrop-blur-sm hover:bg-background"
              >
                <XIcon />
                <span className="sr-only">Fechar</span>
              </Button>
            </DialogClose>
          </div>

          <div className="flex flex-col gap-4 p-4 sm:p-6">
            <DialogHeader className="gap-1.5">
              <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                {brandName}
              </p>
              <DialogTitle className="font-heading text-xl leading-snug font-semibold">
                {product.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {product.subtitle}
              </p>
            </DialogHeader>

            <DialogDescription className="text-sm leading-relaxed text-pretty text-foreground">
              {product.description}
            </DialogDescription>

            {product.specs.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-medium">Especificações</h3>
                  <Table>
                    <TableCaption className="sr-only">
                      Especificações de {product.name}
                    </TableCaption>
                    <TableBody>
                      {product.specs.map((spec) => (
                        <TableRow key={spec.label}>
                          <TableCell className="w-2/5 px-0 align-top text-muted-foreground">
                            {spec.label}
                          </TableCell>
                          <TableCell className="px-0 text-right font-medium whitespace-normal">
                            {spec.value}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}

            <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-muted/60 px-3 py-2.5 text-sm">
              <TagIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="font-medium">Sob consulta</span>
              <span className="text-muted-foreground">
                · mín. {product.moq.qty} {product.moq.unit}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="m-0 rounded-none sm:rounded-b-xl">
          <Button
            size="lg"
            variant={added ? "secondary" : "default"}
            onClick={handleToggle}
            className="w-full sm:w-auto"
          >
            {added ? (
              <>
                <Trash2Icon data-icon="inline-start" />
                Remover do orçamento
              </>
            ) : (
              <>
                <PlusIcon data-icon="inline-start" />
                Adicionar ao orçamento
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
