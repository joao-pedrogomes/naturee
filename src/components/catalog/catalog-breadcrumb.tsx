import { XIcon } from "lucide-react"
import { Link } from "react-router-dom"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"

const CATALOG_LABEL = "Marcas & Produtos"

/**
 * `Início › Marcas & Produtos` — plus a brand crumb when a single brand
 * filter is active. The brand crumb is the current page but carries an
 * inline control to drop the filter, so it still leads back.
 */
export function CatalogBreadcrumb({
  brandName,
  onClearBrand,
}: {
  brandName?: string
  onClearBrand?: () => void
}): React.JSX.Element {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Início</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>
          {brandName ? (
            <span>{CATALOG_LABEL}</span>
          ) : (
            <BreadcrumbPage>{CATALOG_LABEL}</BreadcrumbPage>
          )}
        </BreadcrumbItem>

        {brandName && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="truncate">{brandName}</BreadcrumbPage>
              {onClearBrand && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={onClearBrand}
                  title="Remover filtro de marca"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <XIcon />
                  <span className="sr-only">Remover filtro de marca</span>
                </Button>
              )}
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
