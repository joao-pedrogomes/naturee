import { Link } from 'react-router-dom'
import { CheckCircle2, Copy, Mail, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  buildMailtoUrl,
  buildWhatsappUrl,
  hasEmailContact,
  hasWhatsappContact,
} from '@/lib/quotation-message'
import { formatCnpj, formatPhone } from '@/lib/masks'
import type { QuotationReceipt } from '@/lib/quotation-submit'

export function QuotationSuccess({ receipt }: { receipt: QuotationReceipt }) {
  const { payload, protocol } = receipt
  const whatsappReady = hasWhatsappContact()
  const emailReady = hasEmailContact()

  const copyProtocol = async () => {
    try {
      await navigator.clipboard.writeText(protocol)
      toast.success('Protocolo copiado')
    } catch {
      toast.error('Não foi possível copiar. Anote o protocolo.')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-6">
      <div className="space-y-3 text-center">
        <div className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-full">
          <CheckCircle2 className="size-6" />
        </div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Pedido de orçamento enviado
        </h1>
        <p className="text-muted-foreground">
          Nossa equipe responde em até 1 dia útil com disponibilidade e condições.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardDescription>Protocolo</CardDescription>
          <CardTitle className="flex items-center gap-2 font-mono text-lg">
            <span role="status">{protocol}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Copiar protocolo"
              onClick={copyProtocol}
            >
              <Copy className="size-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-1">
            <p className="font-medium">{payload.buyer.nome}</p>
            <p className="text-muted-foreground">{payload.buyer.email}</p>
            <p className="text-muted-foreground">{formatPhone(payload.buyer.telefone)}</p>
            {payload.buyer.cnpj ? (
              <p className="text-muted-foreground">CNPJ {formatCnpj(payload.buyer.cnpj)}</p>
            ) : null}
          </div>

          <Separator />

          <ul className="space-y-2">
            {payload.items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-4">
                <span>
                  {item.nome}
                  <span className="text-muted-foreground"> · {item.marca}</span>
                  {item.note ? (
                    <span className="text-muted-foreground block text-xs">{item.note}</span>
                  ) : null}
                </span>
                <span className="shrink-0 tabular-nums">
                  {item.qty} {item.unidade}
                </span>
              </li>
            ))}
          </ul>

          {payload.buyer.observacoes ? (
            <>
              <Separator />
              <p className="text-muted-foreground">{payload.buyer.observacoes}</p>
            </>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row">
        {/*
          Without a configured contact the button stays in place but inert, so the
          layout does not shift once the real numbers land.
        */}
        {whatsappReady ? (
          <Button asChild variant="outline" className="flex-1">
            <a href={buildWhatsappUrl(receipt)} target="_blank" rel="noreferrer">
              <MessageCircle className="size-4" />
              Enviar por WhatsApp
            </a>
          </Button>
        ) : (
          <Button
            variant="outline"
            className="flex-1"
            disabled
            title="Contato ainda não configurado"
          >
            <MessageCircle className="size-4" />
            Enviar por WhatsApp
          </Button>
        )}

        {emailReady ? (
          <Button asChild variant="outline" className="flex-1">
            <a href={buildMailtoUrl(receipt)}>
              <Mail className="size-4" />
              Enviar por e-mail
            </a>
          </Button>
        ) : (
          <Button
            variant="outline"
            className="flex-1"
            disabled
            title="Contato ainda não configurado"
          >
            <Mail className="size-4" />
            Enviar por e-mail
          </Button>
        )}
      </div>

      <div className="text-center">
        <Button asChild size="lg">
          <Link to="/produtos">Voltar ao catálogo</Link>
        </Button>
      </div>
    </div>
  )
}
