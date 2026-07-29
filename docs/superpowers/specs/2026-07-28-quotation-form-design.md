# Quotation Form (`/orcamento`) — Design

Date: 2026-07-28
Status: approved
Depends on: `2026-07-28-products-page-design.md` (catalog page, quotation context)

## Context

Naturee Food Hub never sells online. Buyers assemble a list of products in the catalog
and request a quotation. `/orcamento` is where that list is reviewed, quantities are set,
and contact details are captured. It currently exists only as a stub page.

The quotation context (`src/context/quotation.tsx`) already holds the selected items and
persists them to `localStorage`; the header badge and the catalog CTA already read its
`count`.

## Goal

A page that makes sending a quotation request obvious and quick: review what you picked,
adjust quantities, fill four fields, submit. No account, no prices, no checkout.

## Scope

In scope: the `/orcamento` page, quantity and note editing, buyer fields with validation,
a fake submit with an inspectable payload, and a success screen with WhatsApp / e-mail
handoffs.

Out of scope: real API integration, an admin view of submitted quotations, authentication,
file attachments, and address or delivery scheduling.

## Decisions

| Decision | Choice |
|---|---|
| Submit behaviour | Fake submit + success screen now; WhatsApp and e-mail handoffs offered on the success screen |
| List editing | Quantity stepper, remove, and an optional per-item note |
| Layout | Two columns with a sticky buyer card on desktop; single column with a sticky submit bar on mobile |
| Validation | Hand-rolled, no new dependencies: input masks, e-mail shape, CNPJ check digits |
| Required fields | Nome, e-mail, telefone. CNPJ optional, validated only when filled |

## Data model changes

`QuotationItem` gains an optional note:

```ts
export type QuotationItem = {
  productId: string
  qty: number
  addedAt: string
  note?: string        // new, optional, max 120 chars
}
```

`useQuotation()` gains `setNote(productId: string, note: string): void`. An empty or
whitespace-only note is stored as `undefined` rather than an empty string.

`add(product)` now starts the quantity at `product.moq.qty` instead of `1`. A B2B buyer
ordering a 12-unit box never means "1". The existing hydration guard already accepts any
positive integer, so stored carts stay valid.

Storage stays on `naturee.quotation.v1`: `note` is optional and its absence is not an
error, so no key bump and no migration.

`catalog.ts` gains `getProductById(id: string, source?: CatalogSource): Product | undefined`.
Quotation items reference product ids, and the existing lookup is keyed by slug.

## New modules

Each is small, pure, and unit-tested.

### `src/lib/masks.ts`

```ts
onlyDigits(value: string): string
formatPhone(value: string): string   // (48) 3241-0000 | (48) 99999-0000
formatCnpj(value: string): string    // 00.000.000/0000-00
```

Masks format progressively as the user types and never block input: extra digits beyond
the pattern are dropped, non-digits are ignored. Formatting is applied on change; the raw
digits are what validation and the payload use.

### `src/lib/validation.ts`

```ts
isFilled(value: string): boolean
isValidEmail(value: string): boolean
isValidPhone(value: string): boolean   // 10 or 11 digits after stripping
isValidCnpj(value: string): boolean    // 14 digits AND both check digits correct
validateBuyer(fields: BuyerFields): Partial<Record<BuyerField, string>>
```

`isValidCnpj` implements the real check-digit algorithm (weights 5,4,3,2,9,8,7,6,5,4,3,2
for the first digit and 6,5,4,3,2,9,8,7,6,5,4,3,2 for the second) and rejects the
all-same-digit sequences (`11.111.111/1111-11`) that pass the arithmetic. Length alone is
not accepted.

`validateBuyer` returns pt-BR messages keyed by field; an empty object means valid.

### `src/lib/quotation-submit.ts`

```ts
export type QuotationPayload = {
  buyer: { nome: string; email: string; telefone: string; cnpj?: string; observacoes?: string }
  items: { productId: string; slug: string; nome: string; marca: string; qty: number; unidade: string; note?: string }[]
  enviadoEm: string           // ISO
}
export type QuotationReceipt = { protocol: string; payload: QuotationPayload }

buildPayload(items, buyer, now): QuotationPayload
submitQuotation(payload): Promise<QuotationReceipt>
```

`submitQuotation` waits ~800ms, generates a protocol `ORC-YYYYMMDD-XXXX` (four uppercase
hex characters), appends `{ protocol, payload }` to `localStorage` under
`naturee.quotation-log` (capped at the 20 most recent, failures ignored), and resolves.
Phone and CNPJ are sent as digits only. **This is the only file that changes when the PHP
endpoint exists** — its signature is already the shape of a fetch call.

### `src/lib/quotation-message.ts`

```ts
buildWhatsappUrl(receipt): string   // https://wa.me/<number>?text=<encoded>
buildMailtoUrl(receipt): string     // mailto:<address>?subject=…&body=…
formatQuotationText(receipt): string
```

The company WhatsApp number and e-mail live in one exported constant block marked
`TODO: substituir pelos contatos oficiais`. Until they are filled the success screen still
renders, but the two handoff buttons are disabled with the tooltip "Contato ainda não
configurado" rather than opening a broken link.

## Page composition

Route `/orcamento`. Three mutually exclusive states: empty, form, success.

### Empty

No items → `Empty` block: icon, "Seu orçamento está vazio", one line explaining that
products are added from the catalog, and a primary button to `/produtos`. No form is
rendered, so there is nothing to submit.

### Form

Desktop `lg:grid-cols-[1fr_380px]`, gap 8. Mobile: single column, list first, then the
buyer card, plus a sticky bottom bar.

**Left column — items.** A heading with the count, then one row per item:
thumbnail (64px, rounded), product name, brand and category, MOQ hint, quantity stepper,
remove button, and a collapsed "Adicionar observação" toggle.

- Stepper: `−` and `+` buttons plus a typed numeric input. The MOQ is the floor: `−` is
  disabled at the minimum, and a typed value below it clamps up on blur with an inline
  hint "mínimo 12 un". No maximum.
- Remove fires a toast with an "Desfazer" action that restores the item with its previous
  quantity and note.
- Note: 120 characters, textarea, shown expanded when a note already exists.
- Below the list, a ghost link back to `/produtos` labelled "Adicionar mais produtos".

**Right column — buyer card** (`sticky top-20` on desktop). Fields in order:

| Field | Required | Notes |
|---|---|---|
| Nome | yes | min 2 characters after trim |
| E-mail | yes | shape check |
| Telefone | yes | masked, 10 or 11 digits |
| CNPJ | no | masked, validated only when non-empty |
| Observações gerais | no | 500 chars, live counter |

Errors appear on blur and on submit, never while a field is being typed for the first
time. An invalid submit focuses the first invalid field and renders a `role="alert"`
summary listing what is missing. The submit button is never disabled — a disabled button
hides the reason; validation on click explains it.

The card also shows the item count and a one-line reassurance that no purchase is being
made ("Envio de pedido de orçamento — nenhuma compra é finalizada aqui").

**Mobile bar**: fixed bottom, `3 itens · Enviar pedido`, associated with the form through
`form="quotation-form"` so it submits from any scroll position.

**Draft persistence**: buyer fields are saved to `localStorage` under
`naturee.quotation-form.v1` on change (debounced 400ms) and restored on mount, so a
refresh or an accidental navigation does not lose typing. This is personal data on the
device, so: it is cleared on successful submit, and the card carries a "Limpar meus dados"
link that wipes it on demand. Nothing is ever sent anywhere without pressing submit.

### Success

Replaces the whole page (no items remain, so the form state is gone):

- Confirmation heading, the protocol in a copyable line, and "Nossa equipe responde em até
  1 dia útil com disponibilidade e condições."
- A read-only summary of what was sent: buyer name and contact, item lines with quantities.
- Secondary buttons: `Enviar por WhatsApp`, `Enviar por e-mail`, and a primary
  `Voltar ao catálogo`.
- The cart is cleared through `clear()` when submission resolves; the receipt lives in
  page state so the summary survives the clear.

## File layout

```
src/pages/quotation.tsx                     state machine: empty | form | success
src/components/quotation/
  quotation-item-row.tsx
  quantity-stepper.tsx                      reusable, min-aware
  buyer-form.tsx                            fields, masks, validation, submit
  quotation-summary-card.tsx                sticky wrapper: count, reassurance, buyer form
  quotation-success.tsx
  quotation-empty.tsx
src/lib/masks.ts
src/lib/validation.ts
src/lib/quotation-submit.ts
src/lib/quotation-message.ts
```

## Error handling

- `submitQuotation` rejection → an inline `Alert` above the submit button ("Não foi
  possível enviar agora. Tente novamente."), the form keeps every value, the button
  returns from its loading state. Nothing is cleared.
- An item whose product id no longer resolves is skipped in the payload and removed from
  the list with a toast, rather than rendering a broken row.
- `localStorage` writes are wrapped in try/catch; blocked storage degrades to in-memory
  behaviour and never throws.

## Accessibility

- Every field has a real `<label>`; errors are tied through `aria-describedby` and
  `aria-invalid`.
- The submit-time error summary is a `role="alert"` region, and focus moves to the first
  invalid field.
- The stepper buttons carry `aria-label`s naming the product ("Aumentar quantidade de
  Shiitake"); the numeric input is a real `input` with `inputMode="numeric"`.
- The success protocol is announced through `role="status"`.
- The mobile bar never covers the last item: the page reserves bottom padding equal to its
  height.

## Testing

Vitest + Testing Library, tests written before implementation.

- `masks`: progressive formatting for 10- and 11-digit phones, CNPJ, non-digit rejection,
  paste of an already-formatted value.
- `validation`: e-mail shapes, phone lengths, CNPJ valid / wrong check digit / repeated
  digits / short, `validateBuyer` required-field messages, optional CNPJ left empty.
- `quotation-submit`: payload shape, digits-only phone and CNPJ, protocol format, log
  capped at 20.
- `quantity-stepper`: clamps to the minimum, `−` disabled at the floor, typed value below
  the floor clamps on blur.
- `buyer-form`: invalid submit shows the summary and does not call submit; valid submit
  calls it once with the expected payload.
- Page-level: empty state renders no form; successful submit clears the cart and shows the
  protocol.

Manual verification: browser pass at 390px and 1440px, light and dark, with console clean.

## Deployment compatibility

Unchanged from the catalog page: static SPA, no server. The WhatsApp and mailto handoffs
are plain links and work identically on GitHub Pages and inside an Artifact.
