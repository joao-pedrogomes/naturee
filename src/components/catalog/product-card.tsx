import type { JSX } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Check, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useQuotation } from '@/context/quotation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Product } from '@/types/catalog'

type ProductCardProps = {
  product: Product
  brandName: string
  categoryName: string
}

export function ProductCard({
  product,
  brandName,
  categoryName,
}: ProductCardProps): JSX.Element {
  const { search } = useLocation()
  const { has, add, remove } = useQuotation()

  const added = has(product.id)
  const moqLabel = `mín. ${product.moq.qty} ${product.moq.unit}`

  function handleQuotationClick() {
    if (added) {
      remove(product.id)
      return
    }

    add(product)
    toast.success('Adicionado ao orçamento', {
      action: {
        label: 'Desfazer',
        onClick: () => remove(product.id),
      },
    })
  }

  return (
    <Card className="h-full gap-4 pt-0">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="size-full object-cover"
        />
        <Badge
          variant="secondary"
          className="absolute top-2 left-2 max-w-[calc(100%-1rem)] bg-background/85 text-foreground backdrop-blur-sm"
        >
          <span className="truncate">{categoryName}</span>
        </Badge>
        {!product.available && (
          <Badge className="absolute top-2 right-2 bg-clay text-clay-foreground">
            Sob encomenda
          </Badge>
        )}
      </div>

      <CardHeader className="gap-1">
        <CardTitle className="line-clamp-2">{product.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {product.subtitle}
        </CardDescription>
        <p className="text-xs text-muted-foreground">{brandName}</p>
      </CardHeader>

      <CardContent>
        {/* Single text node on purpose: the whole line is one piece of copy. */}
        <p className="text-sm font-medium">{`Sob consulta · ${moqLabel}`}</p>
      </CardContent>

      <CardFooter className="mt-auto flex-col items-stretch gap-2 sm:flex-row">
        <Button
          asChild
          variant="outline"
          className="w-full sm:flex-1"
        >
          <Link
            to={{ pathname: `/produtos/${product.slug}`, search }}
            state={{ fromCatalog: true }}
            aria-label={`Ver mais sobre ${product.name}`}
          >
            Ver mais
          </Link>
        </Button>
        <Button
          variant={added ? 'secondary' : 'default'}
          className="w-full min-w-0 sm:flex-1"
          onClick={handleQuotationClick}
          aria-label={
            added
              ? `Remover ${product.name} do orçamento`
              : `Adicionar ${product.name} ao orçamento`
          }
        >
          {added ? <Check /> : <Plus />}
          {/*
            The full phrase does not fit a 4-column card. The short label carries
            the meaning next to the icon; the accessible name above stays complete.
          */}
          <span className="truncate">{added ? 'Adicionado' : 'Adicionar'}</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
