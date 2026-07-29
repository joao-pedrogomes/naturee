# Products Page (Marcas & Produtos) — Design

Date: 2026-07-28
Status: approved
Project: naturee Food Hub — institutional site (SPA catalog, quotation instead of checkout)

## Context

Naturee Food Hub is a B2B curated food hub. It does not sell online: buyers assemble a
list of products and request a quotation ("orçamento"). The site is institutional with a
catalog that behaves like ecommerce minus the transaction.

Content basis: "Proposta de orçamento_naturee Food Hub_etapa 2" (Kubo studio, July 2026).
Page 16 of that proposal defines this page: hero → intro → Marcas & Produtos cards →
"Nosso processo de curadoria" → CTA "Quer levar essas marcas para o seu negócio?".

The hub's own brand, **Sítio Pura Vida**, sells mushrooms in three lines:
- In natura: Shiitake, Shiitake fatiado, Shimeji branco, Shimeji preto, Portobello, Paris,
  Hiratake salmão, Hiratake ostra, Eryngui, Enoki
- Patês: Mediterrâneo (Ibiza Club), Oriental (Thayland), Indiano (Calcutta Dream)
- Marinados: Shitake baby, Shimeji branco

## Goal

One page at `/produtos` that can be browsed two ways — by product or by brand — with
search, filtering, pagination, a persistent quotation list, and two closing CTAs.

## Scope

In scope: the `/produtos` page and everything it needs (data layer, mock catalog, quotation
context, product detail dialog, theme tokens, tests).

Out of scope (stub routes only, no content): `/orcamento` quotation page, `/processos`
curation page, contact form, real API, real photography, i18n.

## Decisions

| Decision | Choice |
|---|---|
| Data source | Local typed mock JSON/TS behind a data module |
| Products/brands duality | Tabs `Produtos \| Marcas` on one page; picking a brand switches to Produtos with that brand filtered |
| Quotation state | React context + `localStorage`, count badge in header |
| Price display | No prices. `Sob consulta` + minimum order quantity |
| Product detail | Dialog, deep-linkable at `/produtos/:slug` |
| Language & scale | pt-BR UI, ~24 products across 5 brands |
| Filters | Popover `Marca` + popover `Categoria` (checkboxes) + `Ordenar` select, removable chips |
| View state | URL query params (`useSearchParams`), no state library |
| Visual direction | Natural/organic palette as CSS tokens, swappable for the real Kubo identity |

## Architecture

State lives in the URL. Filtering, sorting and pagination are pure derived functions over
the mock array, memoized. The quotation list is the one piece of state that is not in the
URL — it is a context persisted to `localStorage`.

```
URL params ──► useCatalogParams() ──► queryProducts(params) ──► ProductGrid
                                  └─► queryBrands(params)   ──► BrandGrid
localStorage ─► QuotationProvider ──► useQuotation()        ──► cards, header, CTA
```

### Data model

```ts
// src/types/catalog.ts
export type Category = { id: string; slug: string; name: string }

export type Brand = {
  id: string
  slug: string
  name: string
  tagline: string          // one line, shown on brand card
  description: string      // 2–3 lines, brand card + active-filter context
  origin: string           // "Antônio Carlos, SC"
  logo: string             // local asset
  cover: string            // local asset
  categoryIds: string[]
}

export type Product = {
  id: string
  slug: string
  name: string             // "Shiitake"
  subtitle: string         // "Fatiado · bandeja 200g"
  brandId: string
  categoryId: string
  image: string
  description: string      // dialog body
  specs: { label: string; value: string }[]   // Peso, Validade, Conservação, Origem
  moq: { qty: number; unit: string }          // → "mín. 12 un"
  available: boolean       // false → "Sob encomenda" badge; still quotable
  createdAt: string        // ISO, powers ordenar=recentes
}
```

Categories (exactly these seven, all used by mock data): `cogumelos-in-natura`, `pates`,
`marinados`, `conservas`, `mel-e-doces`, `castanhas`, `laticinios-artesanais`.

Mock content, 24 products across 5 brands:

| Brand | Products | Categories |
|---|---|---|
| Sítio Pura Vida | 15 (10 in natura, 3 patês, 2 marinados) | cogumelos-in-natura, pates, marinados |
| Mel do Vale | 3 | mel-e-doces |
| Conservas da Serra | 3 | conservas |
| Castanhas Boa Terra | 2 | castanhas |
| Laticínios Vila Nova | 1 | laticinios-artesanais |

The one-product brand exists deliberately, to prove singular/plural copy and a sparse
brand card. Mock files are named as mock; the UI never says "fictício".

### Data layer

```ts
// src/lib/catalog.ts
export type CatalogQuery = {
  q?: string
  marca?: string[]        // brand slugs
  categoria?: string[]    // category slugs
  ordenar?: 'az' | 'za' | 'recentes' | 'marca'
  pagina?: number
  perPage?: number        // default 12
}

queryProducts(query): { items: Product[]; total: number; pageCount: number; page: number }
queryBrands(query: { q?: string }): Brand[]
getProduct(slug): Product | undefined
getBrand(slug): Brand | undefined
getCategories(): Category[]
getBrandProductCount(brandId): number
```

`queryProducts` applies search → filter → sort → paginate, in that order. Search is
accent- and case-insensitive (`String.prototype.normalize('NFD')` with diacritics
stripped) and matches product name, subtitle and brand name, so "pate" finds "Patê".
`page` in the return value is the clamped page actually used.

Sort definitions (all ties broken by product name ascending, `localeCompare('pt-BR')`):
`az` product name ascending · `za` descending · `recentes` `createdAt` descending ·
`marca` brand name ascending, then product name ascending. Multiple selected values
within one facet are OR'd; different facets are AND'd.

When the PHP backend exists, this module becomes fetch calls with identical signatures.
No component imports mock data directly.

### URL contract

Route `/produtos`; detail dialog at `/produtos/:slug` with search params preserved.

| param | values | default (omitted from URL) |
|---|---|---|
| `view` | `produtos` \| `marcas` | `produtos` |
| `q` | free text | — |
| `marca` | comma-separated brand slugs | — |
| `categoria` | comma-separated category slugs | — |
| `ordenar` | `az` \| `za` \| `recentes` \| `marca` | `az` |
| `pagina` | integer ≥ 1 | `1` |

Rules:
- Changing `q`, `marca`, `categoria` or `ordenar` resets `pagina` to 1.
- Search typing navigates with `replace: true` (debounced 250ms) so Back does not step
  through keystrokes. Tab switches, page changes and brand picks use push navigation.
- Unknown or malformed params are ignored, never fatal: `?pagina=abc` renders page 1,
  an unknown brand slug is dropped from the filter set.
- `pagina` past the last page clamps to the last page and rewrites the URL.

One hook owns all parsing; components never call `useSearchParams` directly:

```ts
// src/hooks/use-catalog-params.ts
const {
  view, q, marca, categoria, ordenar, pagina,
  setView, setQuery, toggleFilter, setSort, setPage, clearFilters,
} = useCatalogParams()
```

### Quotation

```ts
// src/context/quotation.tsx
export type QuotationItem = { productId: string; qty: number; addedAt: string }

useQuotation() → {
  items, count, has(id), add(product), remove(id), setQty(id, n), clear
}
```

- Persisted to `localStorage` key `naturee.quotation.v1`.
- Hydration is guarded: JSON parse in try/catch, shape validated, entries whose
  `productId` no longer exists in the catalog are dropped, any failure falls back to an
  empty list. A corrupted value can never white-screen the page.
- Cross-tab sync through the `storage` event.
- Adding fires a sonner toast "Adicionado ao orçamento" with a "Desfazer" action.
- Header shows a quotation button with a count badge (hidden at 0) linking to `/orcamento`.
- `setQty` accepts values ≥ 1; setting 0 or below removes the item. Adding an already
  present product is a no-op on quantity, not a duplicate entry.

## Page composition

Blocks in order:

1. **Breadcrumb** — `Início › Marcas & Produtos`; a third crumb with the brand name appears
   when exactly one brand filter is active, and clicking it clears that filter.
2. **Hero** — full-bleed image, `aspect-[21/9]` desktop / `aspect-[4/3]` mobile, gradient
   overlay, `h1` + one-line curation pitch. No CTA button here; the CTAs are block 6.
3. **Controls** — sticky under the site header on scroll (`bg-background/80 backdrop-blur`,
   bottom border).
   - Desktop: `[Produtos | Marcas]` tabs, then search (icon inside, debounced), then
     `Marca ▾` and `Categoria ▾` popovers with checkboxes, then `Ordenar ▾`. A result
     count line sits below: "24 produtos · 5 marcas".
   - Mobile: tabs full width, search full width, one `Filtros (n)` button opening a Sheet
     containing both facets and sort, with `Aplicar` / `Limpar` in the footer.
   - On the Marcas tab the Categoria popover is hidden, search matches brand names, and
     `Ordenar` offers only `az` / `za` (applied to brand names). The `categoria` and
     `ordenar` params are preserved in the URL while on that tab, so switching back to
     Produtos restores the previous product view exactly.
   - Active choices render as removable chips below the row, plus `Limpar tudo`.
4. **Grid** — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`, `gap-5`,
   equal-height cards with footers pinned to the bottom.
   - Product card: 4:3 image, category badge top-left, `Sob encomenda` badge when
     `available === false`, title (`line-clamp-2`), muted subtitle, price line
     `Sob consulta · mín. 12 un`, footer with `Ver mais` (outline) and
     `Adicionar ao orçamento` (primary). When already added the primary flips to
     `Adicionado ✓` (secondary) and clicking it removes the item. Buttons stack full
     width on mobile.
   - Brand card: cover, logo, name, tagline, count line ("15 produtos · 3 categorias",
     singular "1 produto · 1 categoria" when applicable), `Ver produtos` → Produtos tab
     filtered to that brand.
5. **Pagination** — 12 per page, prev/next plus numbered pages truncated with an ellipsis
   past 5 pages, and "Mostrando 1–12 de 24". Changing page scrolls to the top of the grid
   (not the page) and moves focus to the grid heading.
6. **CTA blocks** — `grid gap-4 md:grid-cols-2`.
   - Left, stateful: empty → "Comece seu orçamento" / "Selecione produtos e envie sua
     lista para nossa equipe" / `Ver produtos`; with items → "Finalizar orçamento" /
     "N itens selecionados" / `Finalizar orçamento` → `/orcamento`.
   - Right, static: "Como funciona nossa curadoria" / short line / `Conhecer o processo`
     → `/processos`.

### Product dialog

Rendered when the route carries a slug. Larger image, full description, specs table, MOQ,
add/remove from quotation. Opening from a card navigates with `state: { fromCatalog: true }`;
on close, that flag means `navigate(-1)`, and its absence (direct link, refresh) means
`navigate('/produtos' + search)`. Either way the filter params survive. An unknown slug
shows a toast and redirects to `/produtos`. On mobile the dialog fills the viewport height.

## File layout

```
src/pages/products.tsx                 orchestrator
src/pages/quotation.tsx                stub
src/pages/processes.tsx                stub
src/components/catalog/
  catalog-breadcrumb.tsx
  catalog-hero.tsx
  catalog-controls.tsx
  filter-popover.tsx                   reusable: label, options, checked set, onChange
  active-filters.tsx
  product-grid.tsx
  product-card.tsx
  brand-grid.tsx
  brand-card.tsx
  product-dialog.tsx
  catalog-pagination.tsx
  catalog-cta.tsx
src/components/layout/app-layout.tsx   header gains quotation button + badge
src/context/quotation.tsx
src/hooks/use-catalog-params.ts
src/lib/catalog.ts
src/data/brands.ts, products.ts, categories.ts
src/types/catalog.ts
src/assets/catalog/                    generated SVG placeholders
```

Each file has one job. If any grows past roughly 150 lines it is a sign to split it.

## Edge and empty states

- No results after filtering → `Empty` component: icon, "Nenhum produto encontrado", the
  active filters restated, `Limpar filtros`. Never a bare blank grid.
- Query matches nothing but facets are active → offer clearing just the query.
- Brand with zero products → card shows "Em breve" instead of a count; `Ver produtos`
  disabled.
- `pagina` beyond the last page → clamps and rewrites the URL.
- Long names clamp at two lines so card heights stay uniform.

## Accessibility

- Tabs, popovers, dialog and pagination use Radix primitives; focus order is verified and
  the dialog returns focus to the card that opened it.
- Search input has an `sr-only` label; a `role="status"` live region announces
  "24 produtos encontrados" after the debounce so filtering is not silent for screen
  readers.
- Product images use the product name as `alt`. Cards are not wrapped in a single link
  (they hold two actions); `Ver mais` carries the accessible name.
- Contrast verified in light and dark themes.

## Theming

Palette defined only as CSS custom properties in `src/index.css`, light and dark: deep
green primary, warm off-white background, clay accent, neutral text ramp. Components use
semantic classes (`bg-primary`, `text-muted-foreground`), never hex values. Swapping in
the real Kubo identity is a single-file token edit.

## Images

No photography exists yet. Locally generated SVG placeholders (brand-tinted, product
initial) are committed under `src/assets/catalog/`. No external URLs, so the build works
under the Artifact CSP and offline. Replacing them with real photos is a file swap.

## Testing

Vitest + Testing Library (not yet in the repo; added as part of this work). Tests are
written before the implementation they cover.

- `catalog.ts`: accent/case-insensitive search, each facet alone, facets combined, all
  four sort orders, pagination math, page clamping, unknown slugs ignored.
- `quotation`: add / remove / setQty, persistence round-trip, corrupted-localStorage
  recovery, dropping stale product ids, count derivation.
- `use-catalog-params`: param parsing defaults, page reset on filter change, malformed
  input tolerance.
- Component: `ProductCard` renders MOQ and toggles added state; filtering down to zero
  results renders the empty state with a working `Limpar filtros`.

Manual verification at the end: browser screenshots at mobile (390px) and desktop
(1440px), light and dark, confirming no console errors.

## Deployment compatibility

The page is a static SPA and stays deployable to the two targets already discussed:

- **GitHub Pages**: needs `base: '/naturee/'` in `vite.config.ts` and a `404.html` copy of
  `index.html` so deep links survive a refresh. Nothing in this design blocks it.
- **Claude Artifact**: needs `HashRouter` instead of `BrowserRouter` and inlined assets.
  All catalog assets are local, so only the router swap is required.

Both are build-time concerns, handled when sharing is requested.
