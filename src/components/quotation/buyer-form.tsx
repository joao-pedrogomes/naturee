import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, Loader2, Send } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatCnpj, formatPhone } from '@/lib/masks'
import {
  BUYER_FIELD_LABELS,
  BUYER_FIELD_ORDER,
  OBSERVACOES_MAX,
  validateBuyer,
  type BuyerField,
  type BuyerFields,
} from '@/lib/validation'

export const BUYER_DRAFT_KEY = 'naturee.quotation-form.v1'
export const QUOTATION_FORM_ID = 'quotation-form'

const EMPTY: BuyerFields = {
  nome: '',
  email: '',
  telefone: '',
  cnpj: '',
  observacoes: '',
}

function readDraft(): BuyerFields {
  try {
    const raw = window.localStorage.getItem(BUYER_DRAFT_KEY)
    if (!raw) return EMPTY
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return EMPTY
    const draft = parsed as Partial<Record<BuyerField, unknown>>
    return BUYER_FIELD_ORDER.reduce<BuyerFields>((fields, key) => {
      const value = draft[key]
      return { ...fields, [key]: typeof value === 'string' ? value : '' }
    }, EMPTY)
  } catch {
    return EMPTY
  }
}

export function clearBuyerDraft() {
  try {
    window.localStorage.removeItem(BUYER_DRAFT_KEY)
  } catch {
    // Nothing to do: the draft is a convenience, not state we depend on.
  }
}

export function BuyerForm({
  submitting,
  submitError,
  onSubmit,
}: {
  submitting: boolean
  submitError: string | null
  onSubmit: (fields: BuyerFields) => void
}) {
  const [fields, setFields] = useState<BuyerFields>(readDraft)
  const [touched, setTouched] = useState<Partial<Record<BuyerField, boolean>>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const errors = validateBuyer(fields)
  const errorList = BUYER_FIELD_ORDER.filter((field) => errors[field])

  // Draft is written on idle, not on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(BUYER_DRAFT_KEY, JSON.stringify(fields))
      } catch {
        // Storage may be blocked; typing must keep working regardless.
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [fields])

  const setField = useCallback((field: BuyerField, value: string) => {
    setFields((prev) => ({ ...prev, [field]: value }))
  }, [])

  const showError = (field: BuyerField) =>
    Boolean(errors[field]) && (submitAttempted || touched[field])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitAttempted(true)

    const firstInvalid = BUYER_FIELD_ORDER.find((field) => errors[field])
    if (firstInvalid) {
      formRef.current
        ?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)
        ?.focus()
      return
    }

    onSubmit(fields)
  }

  const handleClearDraft = () => {
    clearBuyerDraft()
    setFields(EMPTY)
    setTouched({})
    setSubmitAttempted(false)
  }

  return (
    <form
      id={QUOTATION_FORM_ID}
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {submitAttempted && errorList.length > 0 ? (
        <Alert variant="destructive" role="alert">
          <AlertCircle />
          <AlertTitle>Revise os campos destacados</AlertTitle>
          <AlertDescription>
            {errorList.map((field) => BUYER_FIELD_LABELS[field]).join(', ')}
          </AlertDescription>
        </Alert>
      ) : null}

      <Field
        name="nome"
        label="Nome"
        required
        value={fields.nome}
        error={showError('nome') ? errors.nome : undefined}
        autoComplete="name"
        placeholder="Como devemos te chamar"
        onChange={(value) => setField('nome', value)}
        onBlur={() => setTouched((prev) => ({ ...prev, nome: true }))}
      />

      <Field
        name="email"
        label="E-mail"
        required
        type="email"
        value={fields.email}
        error={showError('email') ? errors.email : undefined}
        autoComplete="email"
        placeholder="voce@empresa.com.br"
        onChange={(value) => setField('email', value)}
        onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
      />

      <Field
        name="telefone"
        label="Telefone"
        required
        type="tel"
        inputMode="numeric"
        value={fields.telefone}
        error={showError('telefone') ? errors.telefone : undefined}
        autoComplete="tel"
        placeholder="(48) 99999-0000"
        onChange={(value) => setField('telefone', formatPhone(value))}
        onBlur={() => setTouched((prev) => ({ ...prev, telefone: true }))}
      />

      <Field
        name="cnpj"
        label="CNPJ"
        hint="Opcional"
        inputMode="numeric"
        value={fields.cnpj}
        error={showError('cnpj') ? errors.cnpj : undefined}
        placeholder="00.000.000/0000-00"
        onChange={(value) => setField('cnpj', formatCnpj(value))}
        onBlur={() => setTouched((prev) => ({ ...prev, cnpj: true }))}
      />

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="observacoes">Observações</Label>
          <span className="text-muted-foreground text-xs tabular-nums">
            {fields.observacoes.length}/{OBSERVACOES_MAX}
          </span>
        </div>
        <Textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          maxLength={OBSERVACOES_MAX}
          placeholder="Prazo desejado, frequência de compra, dúvidas…"
          value={fields.observacoes}
          onChange={(event) => setField('observacoes', event.target.value)}
        />
      </div>

      {submitError ? (
        <Alert variant="destructive" role="alert">
          <AlertCircle />
          <AlertTitle>Não foi possível enviar</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? <Loader2 className="animate-spin" /> : <Send />}
        {submitting ? 'Enviando…' : 'Enviar pedido de orçamento'}
      </Button>

      <p className="text-muted-foreground text-center text-xs">
        Nenhuma compra é finalizada aqui.{' '}
        <button
          type="button"
          onClick={handleClearDraft}
          className="hover:text-foreground underline underline-offset-2"
        >
          Limpar meus dados
        </button>
      </p>
    </form>
  )
}

function Field({
  name,
  label,
  value,
  error,
  hint,
  required,
  type = 'text',
  inputMode,
  placeholder,
  autoComplete,
  onChange,
  onBlur,
}: {
  name: BuyerField
  label: string
  value: string
  error?: string
  hint?: string
  required?: boolean
  type?: string
  inputMode?: 'numeric' | 'text'
  placeholder?: string
  autoComplete?: string
  onChange: (value: string) => void
  onBlur: () => void
}) {
  const errorId = `${name}-error`

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={name}>
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
          {required ? <span className="sr-only"> (obrigatório)</span> : null}
        </Label>
        {hint ? <span className="text-muted-foreground text-xs">{hint}</span> : null}
      </div>
      <Input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />
      {error ? (
        <p id={errorId} className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  )
}
