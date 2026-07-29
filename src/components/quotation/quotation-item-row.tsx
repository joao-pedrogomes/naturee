import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquarePlus, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { QuantityStepper } from '@/components/quotation/quantity-stepper'
import { NOTE_MAX_LENGTH } from '@/context/quotation'
import type { QuotationItem } from '@/context/quotation'
import type { Product } from '@/types/catalog'

export function QuotationItemRow({
  item,
  product,
  brandName,
  categoryName,
  onQtyChange,
  onNoteChange,
  onRemove,
}: {
  item: QuotationItem
  product: Product
  brandName: string
  categoryName: string
  onQtyChange: (qty: number) => void
  onNoteChange: (note: string) => void
  onRemove: () => void
}) {
  const [noteOpen, setNoteOpen] = useState(Boolean(item.note))

  return (
    <li className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start">
      <Link
        to={`/produtos/${product.slug}`}
        className="focus-visible:ring-ring shrink-0 overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:outline-none"
        aria-label={`Ver ${product.name}`}
      >
        <img
          src={product.image}
          alt={product.name}
          className="size-16 object-cover sm:size-20"
        />
      </Link>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{product.name}</p>
          {!product.available ? (
            <Badge className="bg-clay text-clay-foreground">Sob encomenda</Badge>
          ) : null}
        </div>
        <p className="text-muted-foreground text-sm">{product.subtitle}</p>
        <p className="text-muted-foreground text-xs">
          {brandName} · {categoryName} · mín. {product.moq.qty} {product.moq.unit}
        </p>

        {noteOpen ? (
          <div className="pt-2">
            <Textarea
              defaultValue={item.note ?? ''}
              maxLength={NOTE_MAX_LENGTH}
              rows={2}
              placeholder="Observação deste item (ex.: preferência de embalagem)"
              aria-label={`Observação sobre ${product.name}`}
              className="text-sm"
              onBlur={(event) => onNoteChange(event.target.value)}
            />
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground -ml-2 mt-1 h-8"
            onClick={() => setNoteOpen(true)}
          >
            <MessageSquarePlus className="size-4" />
            Adicionar observação
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 sm:flex-col sm:items-end">
        <QuantityStepper
          value={item.qty}
          min={product.moq.qty}
          unit={product.moq.unit}
          label={product.name}
          onChange={onQtyChange}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive size-9"
          aria-label={`Remover ${product.name} do orçamento`}
          onClick={onRemove}
        >
          <X className="size-4" />
        </Button>
      </div>
    </li>
  )
}
