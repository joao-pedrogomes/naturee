import { ArrowRightIcon, ClipboardListIcon, SproutIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

/** Closing blocks: the quotation call to action plus the curation story. */
export function CatalogCta({
  itemCount,
}: {
  itemCount: number
}): React.JSX.Element {
  const hasItems = itemCount > 0

  const selectionLine =
    itemCount === 1 ? "1 item selecionado" : `${itemCount} itens selecionados`

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <Card className="h-full ring-primary/30">
        <CardHeader className="flex-1 gap-2">
          <span className="mb-1 flex size-9 items-center justify-center rounded-lg bg-clay/15 text-clay">
            <ClipboardListIcon className="size-4.5" />
          </span>
          <CardTitle className="text-lg">
            {hasItems ? "Finalizar orçamento" : "Comece seu orçamento"}
          </CardTitle>
          <CardDescription className="text-pretty">
            {hasItems ? (
              <>
                <span className="font-medium text-foreground">
                  {selectionLine}
                </span>
                . Envie sua lista e nossa equipe responde com disponibilidade e
                condições.
              </>
            ) : (
              "Selecione os produtos que interessam ao seu negócio e envie sua lista para nossa equipe."
            )}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to={hasItems ? "/orcamento" : "/produtos"}>
              {hasItems ? "Finalizar orçamento" : "Ver produtos"}
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <Card className="h-full">
        <CardHeader className="flex-1 gap-2">
          <span className="mb-1 flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <SproutIcon className="size-4.5" />
          </span>
          <CardTitle className="text-lg">
            Como funciona nossa curadoria
          </CardTitle>
          <CardDescription className="text-pretty">
            Visitamos cada produtor, provamos a linha inteira e cuidamos da
            logística — do sítio até o estoque do seu negócio.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link to="/processos">
              Conhecer o processo
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </section>
  )
}
