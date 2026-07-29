import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useQuotation } from '@/context/quotation'

/** Stub: the quotation flow itself is out of scope for the catalog page. */
export default function QuotationPage() {
  const { count } = useQuotation()

  return (
    <div className="mx-auto max-w-xl space-y-4 py-10 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Seu orçamento</h1>
      <p className="text-muted-foreground">
        {count > 0
          ? `${count} ${count === 1 ? 'item selecionado' : 'itens selecionados'}. O formulário de envio será construído nesta página.`
          : 'Nenhum item selecionado ainda. Escolha produtos no catálogo para montar seu orçamento.'}
      </p>
      <Button asChild>
        <Link to="/produtos">Voltar ao catálogo</Link>
      </Button>
    </div>
  )
}
