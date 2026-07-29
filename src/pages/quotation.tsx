import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BuyerForm,
  QUOTATION_FORM_ID,
  clearBuyerDraft,
} from '@/components/quotation/buyer-form'
import { QuotationEmpty } from '@/components/quotation/quotation-empty'
import { QuotationItemRow } from '@/components/quotation/quotation-item-row'
import { QuotationSuccess } from '@/components/quotation/quotation-success'
import { useQuotation } from '@/context/quotation'
import { getBrandById, getCategories, getProductById } from '@/lib/catalog'
import {
  buildPayload,
  submitQuotation,
  type QuotationReceipt,
  type ResolvedLine,
} from '@/lib/quotation-submit'
import type { BuyerFields } from '@/lib/validation'

export default function QuotationPage() {
  const { items, count, setQty, setNote, remove, restore, clear } = useQuotation()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<QuotationReceipt | null>(null)

  const categoriesById = useMemo(
    () => Object.fromEntries(getCategories().map((category) => [category.id, category])),
    [],
  )

  // An id that no longer resolves is skipped rather than rendered as a broken row.
  const lines = useMemo<ResolvedLine[]>(
    () =>
      items.flatMap((item) => {
        const product = getProductById(item.productId)
        if (!product) return []
        return [{ item, product, brandName: getBrandById(product.brandId)?.name ?? '' }]
      }),
    [items],
  )

  // Carts saved before a product's MOQ existed (or changed) can hold a quantity
  // that is not quotable. Raise those lines to the minimum instead of sending them.
  useEffect(() => {
    for (const { item, product } of lines) {
      if (item.qty < product.moq.qty) setQty(item.productId, product.moq.qty)
    }
  }, [lines, setQty])

  const handleSubmit = async (buyer: BuyerFields) => {
    setSubmitting(true)
    setSubmitError(null)

    try {
      const result = await submitQuotation(buildPayload(lines, buyer, new Date()))
      setReceipt(result)
      clearBuyerDraft()
      clear()
    } catch {
      setSubmitError('Não foi possível enviar agora. Tente novamente em instantes.')
    } finally {
      setSubmitting(false)
    }
  }

  if (receipt) return <QuotationSuccess receipt={receipt} />

  return (
    <div className="space-y-8 pb-28 lg:pb-8">
      <div className="space-y-2">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground -ml-2">
          <Link to="/produtos">
            <ArrowLeft className="size-4" />
            Voltar ao catálogo
          </Link>
        </Button>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Pedido de orçamento
        </h1>
        <p className="text-muted-foreground max-w-xl">
          Ajuste as quantidades, deixe suas observações e envie. Nossa equipe responde com
          disponibilidade e condições — nenhuma compra é finalizada aqui.
        </p>
      </div>

      {lines.length === 0 ? (
        <QuotationEmpty />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
          <section aria-labelledby="itens-heading" className="space-y-4">
            <h2 id="itens-heading" className="font-heading text-lg font-medium">
              Itens selecionados ({count})
            </h2>

            <ul className="divide-y border-y">
              {lines.map(({ item, product, brandName }) => (
                <QuotationItemRow
                  key={item.productId}
                  item={item}
                  product={product}
                  brandName={brandName}
                  categoryName={categoriesById[product.categoryId]?.name ?? ''}
                  onQtyChange={(qty) => setQty(item.productId, qty)}
                  onNoteChange={(note) => setNote(item.productId, note)}
                  onRemove={() => {
                    const removed = item
                    remove(item.productId)
                    toast.success(`${product.name} removido`, {
                      action: { label: 'Desfazer', onClick: () => restore(removed) },
                    })
                  }}
                />
              ))}
            </ul>

            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link to="/produtos">Adicionar mais produtos</Link>
            </Button>
          </section>

          <Card className="lg:sticky lg:top-20">
            <CardHeader>
              <CardTitle>Seus dados</CardTitle>
            </CardHeader>
            <CardContent>
              <BuyerForm
                submitting={submitting}
                submitError={submitError}
                onSubmit={handleSubmit}
              />
            </CardContent>
          </Card>

          {/* Mobile: the submit stays reachable from any scroll position. */}
          <div className="bg-background/90 fixed inset-x-0 bottom-0 z-40 border-t p-3 backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-1">
              <span className="text-muted-foreground text-sm">
                {count} {count === 1 ? 'item' : 'itens'}
              </span>
              <Button
                type="submit"
                form={QUOTATION_FORM_ID}
                className="flex-1"
                disabled={submitting}
              >
                {submitting ? 'Enviando…' : 'Enviar pedido'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
