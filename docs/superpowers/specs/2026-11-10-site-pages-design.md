# Naturee Food Hub — Site Pages from PDF Wireframe (Spec 1) — Design

Date: 2026-11-10
Status: approved
Project: naturee Food Hub — institutional site rebuilt from the client PDF wireframe


## Context

The `naturee` repo started as a client mock (catalog + quotation flow). The client approved a
real design: `plan-assets/Site/Site_wireframe_naturee food hub 02.pdf` (5 pages, 1920px wide,
Adobe Illustrator export) plus 26 webp photos and ~40 SVG icons/logos in `plan-assets/Site/`.
Goal: ship that design as a production React site — accessible, SEO-friendly, lightweight —
on the existing Vite + React 19 + TypeScript + Tailwind v4 + shadcn stack.

Decisions already made with Joao:
- Catalog (`/produtos`) and quotation (`/orcamento`) are **removed**. Catalog becomes a
  downloadable PDF.
- Backend runs on **Cloudflare free tier only**: Worker (API + serves the static site), D1
  (SQLite) for leads/settings/sessions, R2 for uploaded images, Resend free tier for email.
  Backend + admin UI is **Spec 2** (outlined at the end). Spec 1 builds the site so that
  everything the admin can later change (images, contact info, links, page on/off) flows
  through one `SiteConfig` object with static defaults — Spec 2 only wires the fetch.
- Contact form: save lead (API) → forward to configurable company email → open WhatsApp
  with prefilled message. Spec 1 ships the form with WhatsApp working and the API call behind
  an env flag.
- **Single theme**, no dark-mode toggle (`next-themes` removed).
- Brand/category data replaced with the 6 real brands and 6 categories from the PDF.

## What the PDF defines

Shared chrome on every page:
- **Header** (dark teal): nav `Início · Sobre · Marcas & Produtos` — centered logo — `Logística
  · Contato` — olive pill `FALE COM A NATUREE` (WhatsApp). Active link underlined.
- **Footer** (dark teal): trust strip (4 items: 100% Seguro, Entrega em toda SC, Produtos
  selecionados, Garantia de qualidade), then logo + tagline / `ACESSO RÁPIDO` (5 links) /
  `ATENDIMENTO B2B` (WhatsApp `48 99196 3383`, region line, Instagram `natureealimentos`).

Pages and sections (copy is in the PDF text, already extracted):

| Route | Page | Sections (top → bottom) |
|---|---|---|
| `/` | Início | Hero (photo bg, 2 CTAs) · feature ticker strip (4 items) · Sobre nós (text + photo) · Diferenciais (3 dark cards w/ photo) · Marcas parceiras (logo carousel) · Categorias mais vendidas (sand bg, 3 cards) · Logística (photo + text) · Closing CTA (sand box + dark card w/ 2 buttons) |
| `/sobre` | Sobre | Hero (3-photo strip, centered headline) · Sobre nós (photo + text) · Nossa história (centered) · Nosso propósito (photo + text) · 3 light cards (Curadoria/Logística/Relacionamento) · olive CTA banner (2 buttons) |
| `/marcas-e-produtos` | Marcas & Produtos | Split hero (photo / olive panel) · 6 category cards (alternating olive shades) + `Baixar catálogo` · Marcas parceiras (6 logos grid) + "Sua marca pode estar aqui" box · Catálogo (photo + text + download) · olive banner "Encontrou o que procura?" (WhatsApp) |
| `/logistica` | Logística | Hero (photo bg) · Como funciona (3 numbered steps) · Regiões atendidas (sand, text + SC map image) · Para quem distribuímos (4 cards: Restaurantes/Hotéis/Empórios/Supermercados) · Entregas e planejamento (text + 2 info boxes) · CTA banner w/ photo (WhatsApp) |
| `/contato` | Contato | Dark hero (label + headline + text) · olive form card (Nome, E-mail, Assunto, Mensagem, ENVIAR) overlapping hero |

Typography: **Playfair Display** (headings, italic accents) + **Mulish** (body, labels).
Palette (sample exact values from the rendered PDF at implementation): dark teal ≈ `#1F3A3D`,
olive ≈ `#6B7A3F`, light olive ≈ `#9CAF6E`, sand ≈ `#F0E9C3`, cream ≈ `#F2EFD9`, white.

## Architecture

Keep the SPA. Add a **build-time prerender** step so every route ships as static HTML with its
own `<title>`/meta/OG tags. Reason: WhatsApp and most link-preview bots do not run JS; the
client shares links on WhatsApp. Prerender = Vite SSR build of an `entry-server.tsx` +
a ~60-line node script that renders the 5 routes with `StaticRouter` into `dist/<route>/index.html`.
No framework migration (Next/Astro rejected: throws away working stack for little gain).

File naming: **PascalCase** for component files (`SiteHeader.tsx`), **camelCase** for
non-component modules (`siteContent.ts`, `whatsapp.ts`), image/asset files camelCase too.

```
src/
  main.tsx                 client entry (hydrateRoot)
  entryServer.tsx          render(url) → html string, used only by scripts/prerender.ts
  App.tsx                  <Routes> for 5 pages + NotFound
  routes.ts                ROUTES const: path, label, page component — single source for nav, prerender, sitemap
  index.css                tokens (PDF palette), fonts, base
  content/                 V1 SEED ONLY — deleted in Spec 2 once D1 holds content
    types.ts               SiteContent type: the ONE shape the DB will store (see "Content model")
    defaultContent.ts      pt-BR copy, alt texts, links, image URLs, in SiteContent shape
    SiteContentContext.tsx SiteContentProvider + useSiteContent(); Spec 1 serves defaultContent,
                           Spec 2 swaps the source for GET /api/content (same type, no page changes)
  components/
    layout/SiteHeader.tsx, SiteFooter.tsx, SiteLayout.tsx, MobileNav.tsx, SkipLink.tsx
    seo/Seo.tsx            renders <title>, <meta>, <link canonical>, OG — React 19 hoists to <head>
    sections/              shared visual blocks reused across pages
      SectionLabel.tsx     small olive uppercase label ("SOBRE NÓS")
      Heading.tsx          Playfair heading; italic accents via a tiny markup ("*mais vendidas*")
      FeatureCards.tsx     3-card row; variant 'dark' (home) | 'light' (sobre)
      PartnerBrands.tsx    logo carousel (home) | logo grid (produtos) — CSS scroll-snap, no lib
      TrustStrip.tsx       4 trust items (footer top)
      CtaBanner.tsx        olive rounded banner with heading + buttons, optional photo
      MediaText.tsx        photo + text split, side prop
      WhatsAppButton.tsx   pill link builder (wa.me + encoded message)
    contact/ContactForm.tsx, ContactFormFields.tsx
    ui/                    shadcn: keep only button, input, textarea, label, field, sheet, sonner, alert
  lib/
    whatsapp.ts            buildWhatsAppUrl(number, message) — pure
    contact.ts             validateContact(fields), buildContactMessage(fields), submitContact(payload)
    richText.ts            renders "*italic*" markup in headings to <em> — pure
    seo.ts                 absoluteUrl(path), DEFAULT_OG
    utils.ts               cn (existing)
  pages/Home.tsx, About.tsx, Products.tsx, Logistics.tsx, Contact.tsx, NotFound.tsx
  assets/
    images/                optimized webp, e.g. homeHero.webp
    logos/                 brand SVGs + naturee logo SVGs
scripts/
  prerender.ts             node script: ssr bundle → html per route + sitemap.xml
  optimizeImages.ts        one-shot: plan-assets → src/assets/images (sharp, 2 widths)
public/
  robots.txt, catalogoNaturee.pdf (placeholder until client sends), favicon.svg, ogDefault.jpg
```

### Content model (the contract with Spec 2)

Nothing user-visible is hardcoded in JSX. Pages read everything — headlines, paragraphs, button
labels, hrefs, image src + alt, contact values, page enabled flags — from `useSiteContent()`.
`SiteContent` is a plain JSON-serialisable type:

```ts
type SiteContent = {
  site: { name, tagline, whatsapp, email, instagram, regionLine, catalogPdfUrl }
  nav: Link[]; footerLinks: Link[]; trust: { title, text, icon }[]
  pages: { home: HomePage; about: AboutPage; products: ProductsPage; logistics: LogisticsPage; contact: ContactPage }
  brands: { name, logo: Image, href? }[]
  categories: { name, blurb, image: Image }[]
}
type Image = { src: string; alt: string; width: number; height: number }
type Link = { id: string; label: string; href: string; enabled: boolean }
// each XxxPage = { enabled: boolean; seo: { title, description }; <sections as named objects> }
```

In Spec 1 the provider returns `defaultContent`. In Spec 2 the Worker seeds D1 from that same
object once, the provider fetches `GET /api/content`, the admin edits any field, and
`content/defaultContent.ts` is deleted (only a JSON seed file remains in `worker/`). Pages and
sections never change. Image `src` is a plain URL so bundled assets (v1) and R2 uploads
(v2, `/media/<key>`) are interchangeable. A page with `enabled: false` renders 404 and leaves
nav, sitemap and prerender.

Sections never import content directly — props only. That keeps them testable in isolation.

### Code style (Joao's rules, enforced in plan tasks)
- Declare before use: helpers and sub-components above the component that uses them; no
  inline-defined-and-called functions. Named `function` declarations, `export default` at bottom.
- Early returns over nested conditionals. KISS: no abstraction with a single caller.
- One component per file. PascalCase component files, camelCase everything else.

### Layout fidelity and responsiveness
Desktop (≥1280px) matches the PDF **1:1**: 1920px artboard scaled to a 1280px content
container (same proportions as the PDF's inner column), same section order, spacing ratios,
card shapes, colours, type scale. Tailwind breakpoints:
- `xl` ≥1280: PDF layout as designed.
- `lg` 1024–1279: same grid, container fluid, type one step smaller.
- `md` 768–1023: 3-card rows → 2 columns (+1 centered), split sections stack (image on top),
  header keeps logo centered with nav collapsed into hamburger `Sheet`.
- `<md`: single column, hero text over photo with stronger overlay, ticker strip wraps to 2×2,
  logo carousel swipeable, footer columns stack, form card full-width with 16px gutters, buttons
  full-width. No horizontal scroll at 360px.
Fluid type via `clamp()` for Playfair headings so the hero reads at 360px without manual steps.

### Design tokens (`index.css`)
Replace the placeholder oklch palette. Semantic shadcn tokens map to PDF colors (`--primary` =
olive, `--foreground` = teal, `--secondary` = sand, `--accent` = light olive) plus named brand
tokens (`--color-teal`, `--color-olive`, `--color-olive-light`, `--color-sand`, `--color-cream`)
for section backgrounds. `--font-heading: 'Playfair Display Variable'`, `--font-sans: 'Mulish
Variable'` via `@fontsource-variable/playfair-display` + `@fontsource-variable/mulish`
(Geist removed). Pill radius for buttons. Verify contrast of cream-on-olive and olive-on-sand
≥ 4.5:1 for body text; adjust shade if it fails (document in spec).

### Images
`scripts/optimize-images.ts` (sharp) converts the 26 source webps (≈19 MB, 500–1000 KB each)
into `src/assets/images/<kebab>.webp` at 1440w and 800w quality ~78 (target ≤150 KB each).
Components use `<img>` with explicit `width`/`height`, `alt` from content, `loading="lazy"`
everywhere except the page hero (`fetchpriority="high"`). Hero uses `srcset` 800/1440.
Icons: lucide-react equivalents for generic icons (snowflake, truck, zap, shield-check, package,
star, map-pin, calendar, clock, utensils, building-2, store, shopping-basket, instagram,
arrow-up-right, download, check-circle). PDF SVGs used only for naturee logos, WhatsApp mark and
the 6 brand logos.

### Contact form (frontend side of the Spec 2 contract)
Fields: `nome`, `email`, `assunto`, `mensagem` (PDF labels the third field "E-mail" by mistake —
render "Assunto"). Validation: required, email format, max lengths; errors inline with
`aria-describedby` + `aria-invalid`, summary in `role="alert"`.
Submit flow:
1. `submitContact(payload)` POSTs `{ nome, email, assunto, mensagem, origem: 'site' }` to
   `VITE_CONTACT_API_URL` and expects `201`.
2. If `VITE_CONTACT_API_URL` is unset → skip step 1 (no backend yet).
3. On success or skip → open WhatsApp (`wa.me/5548991963383?text=…`) in new tab, show success
   state inline.
4. On API error → toast "Não conseguimos registrar sua mensagem, mas você pode falar conosco
   pelo WhatsApp" and still open WhatsApp. (Business flow must never dead-end; flagged as a
   deliberate choice.)

### SEO
- `index.html`: `lang="pt-BR"`, theme-color, favicon, default description.
- `<Seo>` per page: title pattern `"{Page} · Naturee Food Hub"`, description, canonical
  (`VITE_SITE_URL` + path), OG title/description/image/url, `twitter:card`.
- Home adds JSON-LD `Organization` (name, url, logo, telephone, areaServed, sameAs Instagram).
- Prerender writes `dist/sobre/index.html` etc. + `dist/sitemap.xml`; `public/robots.txt`.
- One `<h1>` per page, heading order sane, landmark elements (`header/nav/main/footer`).

### Accessibility
Skip link, `aria-current="page"` on nav, mobile nav via shadcn `Sheet` (focus trap, Esc),
focus-visible rings on PDF palette, `prefers-reduced-motion` respected (ticker strip, carousel
smooth scroll), decorative images `alt=""`, informative images descriptive alt in content files,
form labels bound, buttons ≥44px tap targets, carousel buttons labelled + keyboard scroll.

### Routing / hosting
Routes: `/`, `/sobre`, `/marcas-e-produtos`, `/logistica`, `/contato`, `*` → 404.
GitHub Pages deploy stays working in this spec: `base` becomes `VITE_BASE ?? '/'`
(`/naturee/` set in the workflow). SPA fallback plugin stays until Cloudflare Pages migration
(Spec 2). Prerender writes nested `index.html` files which also work on Pages.

### Removal list
Delete: `pages/products.tsx`, `pages/quotation.tsx`, `pages/processes.tsx`,
`components/quotation/*`, `context/quotation*`, `hooks/use-catalog-params*`, `lib/catalog*`,
`lib/quotation-*`, `lib/masks*`, `lib/validation*` (email check moves to `lib/contact.ts`),
`data/*`, `types/catalog.ts`, `assets/catalog/*`, `assets/hero-produtos.svg`, unused `ui/*`
(accordion, avatar, badge, breadcrumb, button-group, card, checkbox, dialog, dropdown-menu,
empty, input-group, item, navigation-menu, popover, progress, radio-group, scroll-area, select,
separator, skeleton, spinner, switch, table, tabs, tooltip). Deps removed: `next-themes`,
`@fontsource-variable/geist`. Deps added: `@fontsource-variable/playfair-display`,
`@fontsource-variable/mulish`, `sharp` (dev). Old specs in `docs/superpowers/specs/` get a
"Superseded" status line, not deleted.

## Testing (vitest + RTL, existing setup)
- `lib/whatsapp.test.ts`, `lib/contact.test.ts`, `lib/richText.test.ts` (validation, message
  builder, submit with/without API URL, error path, italic markup).
- `components/layout/SiteHeader.test.tsx`: nav links, active state, disabled link hidden,
  mobile menu open/close/Esc.
- `components/contact/ContactForm.test.tsx`: errors shown and announced, success path opens
  WhatsApp (mock `window.open`).
- `content/defaultContent.test.ts`: every image has non-empty alt + dimensions, every page has
  seo title/description, every link href resolves to a route or external URL.
- Per page smoke: renders `h1`, sets `document.title`.
- `scripts/prerender.test.ts`: route list ↔ `ROUTES` in sync, sitemap contains every route.

## Verification
1. `npm run lint && npm test && npm run build` green; `dist/` contains 5 route folders + sitemap.
2. `npm run preview`, open each route: compare side-by-side with PDF slices
   (`scratchpad/pdf/hi-*-slice-*.png`) at 1280 and 390 px widths.
3. Lighthouse (chrome-devtools MCP) on `/` and `/contato`: Performance ≥ 90, A11y 100, SEO 100,
   total transfer < 1 MB on home.
4. `curl dist/sobre/index.html | grep '<title>'` shows page-specific title without JS.
5. Keyboard-only pass: skip link, nav, mobile menu, carousel, form.

## Spec 2 outline — backend + admin (brainstormed in detail after Spec 1 ships)

All within Cloudflare free tier (Workers 100k req/day, D1 5 GB / 5M reads/day, R2 10 GB +
zero egress, Resend 3k emails/month). No paid add-ons.

- **One Worker** (`worker/`, Hono + TypeScript) serves `dist/` via Workers Static Assets and
  handles `/api/*` and `/media/*`. Same origin as the site → no CORS, cookies just work.
  Replaces GitHub Pages; `base` becomes `/`.
- **D1 tables**: `leads` (id, nome, email, assunto, mensagem, origem, ip_hash, created_at,
  emailed_at), `content` (id=1, json = full `SiteContent`, version, updated_at, updated_by —
  seeded once from Spec 1's `defaultContent`; every text, link, flag and image ref lives here),
  `content_history` (version, json, updated_at — last 20 versions, one-click restore),
  `media` (key, mime, size, width, height, created_at), `users` (id, email,
  password_hash, salt, created_at), `sessions` (token_hash, user_id, expires_at, created_at),
  `login_attempts` (ip_hash, count, window_start) for rate limiting.
- **Auth**: PBKDF2-SHA256 via WebCrypto (600k iterations, 16-byte salt, constant-time compare);
  session = 256-bit random token, stored hashed, 12 h expiry, sent as `HttpOnly; Secure;
  SameSite=Strict; Path=/` cookie; Origin header checked on every mutating request; 5 failed
  logins per IP per 15 min → 429. Every `/api/admin/*` route requires a valid session; `/admin`
  pages are `noindex`, lazy-loaded chunk, redirect to login without session. Initial admin
  created by a one-off `wrangler d1 execute` seed script (no public signup). Password change
  from inside admin.
- **Public API**: `GET /api/content` (the `SiteContent` JSON, ETag + 60 s cache),
  `POST /api/contact` (zod-validated, honeypot field, stores lead, sends Resend email to the
  company address stored in content, returns 201).
- **Admin API**: leads list/detail/export CSV, content read/update (whole-object PUT with
  version check, zod-validated against the shared `SiteContent` schema), media upload
  (multipart → R2, 2 MB cap, webp/png/svg only, dimension check), media list/delete.
- **Admin UI** (`src/admin/`, same React app, shadcn forms): login, dashboard (recent leads),
  leads table, content editor generated from the `SiteContent` schema (per-page forms: text
  fields, link rows with enable toggles, page enable switch, image pickers backed by media
  manager), site settings (WhatsApp, email, Instagram), media manager, history/restore,
  change password.
- **Runtime content**: site fetches `/api/content` at startup; prerender script fetches it at
  build time so static HTML reflects current admin values. Cloudflare Deploy Hook (free) lets
  the admin trigger a re-prerender after edits. Worker's embedded seed JSON is the fallback
  when D1 is unreachable.
- Shared zod schemas in `shared/` imported by both site and worker.
- **Cloudflare credentials**: API token lives at `~/.ssh/naturee_cloudflare_token`. Every
  wrangler call reads it inline — `CLOUDFLARE_API_TOKEN="$(cat ~/.ssh/naturee_cloudflare_token)"
  npx wrangler …` — never echoed, never written to `.env`, `wrangler.toml` or git. Secrets for
  the Worker (Resend key, session pepper) go in via `wrangler secret put`, also fed from files.
  File is currently `-rw-r--r--`; first Spec 2 task runs `chmod 600` on it.

