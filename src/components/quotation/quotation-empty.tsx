import { Link } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

export function QuotationEmpty() {
  return (
    <Empty className="border py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ClipboardList />
        </EmptyMedia>
        <EmptyTitle>Seu orçamento está vazio</EmptyTitle>
        <EmptyDescription>
          Escolha os produtos no catálogo e eles aparecem aqui para você ajustar as
          quantidades antes de enviar.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild size="lg">
          <Link to="/produtos">Ver marcas e produtos</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
