import type { JSX } from 'react'
import { MapPin } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import type { Brand } from '@/types/catalog'

type BrandCardProps = {
  brand: Brand
  productCount: number
  categoryCount: number
  onSelect: (slug: string) => void
}

/** "15 produtos · 3 categorias" — singular forms when the count is exactly 1. */
function countLabel(productCount: number, categoryCount: number) {
  const products = `${productCount} ${productCount === 1 ? 'produto' : 'produtos'}`
  const categories = `${categoryCount} ${categoryCount === 1 ? 'categoria' : 'categorias'}`

  return `${products} · ${categories}`
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export function BrandCard({
  brand,
  productCount,
  categoryCount,
  onSelect,
}: BrandCardProps): JSX.Element {
  const empty = productCount === 0

  return (
    <Card className="h-full gap-4 pt-0">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        <img
          src={brand.cover}
          alt=""
          loading="lazy"
          className="size-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 to-transparent" />
        <Avatar
          size="lg"
          className="absolute bottom-3 left-3 bg-background ring-2 ring-background"
        >
          <AvatarImage src={brand.logo} alt="" className="bg-background" />
          <AvatarFallback>{initials(brand.name)}</AvatarFallback>
        </Avatar>
      </div>

      <CardHeader className="gap-1">
        <CardTitle className="line-clamp-2">{brand.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {brand.tagline}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-1.5">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{brand.origin}</span>
        </p>
        {empty ? (
          <Badge className="bg-clay text-clay-foreground">Em breve</Badge>
        ) : (
          <p className="text-sm text-muted-foreground">
            {countLabel(productCount, categoryCount)}
          </p>
        )}
      </CardContent>

      <CardFooter className="mt-auto">
        <Button
          className="w-full"
          disabled={empty}
          onClick={() => onSelect(brand.slug)}
          aria-label={`Ver produtos da marca ${brand.name}`}
        >
          Ver produtos
        </Button>
      </CardFooter>
    </Card>
  )
}
