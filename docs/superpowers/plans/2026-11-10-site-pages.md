# Site Pages from PDF Wireframe — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the 5-page Naturee Food Hub site exactly as the client PDF defines it, responsive, accessible, prerendered for SEO, loading well under one second.

**Architecture:** Vite SPA with React 19 + react-router 7. All user-visible content comes from one typed `SiteContent` object served by `SiteContentProvider` (static defaults now, API later). Pages compose shared section components. A post-build prerender renders every route to static HTML with its own head tags.

**Tech Stack:** Vite 8, React 19, TypeScript 6, Tailwind v4, shadcn (button, input, textarea, label, sheet, sonner), lucide-react, @fontsource-variable (Playfair Display, Mulish), sharp (image pipeline), vitest + RTL, Playwright (chromium, firefox, webkit, mobile).

**Spec:** `docs/superpowers/specs/2026-11-10-site-pages-design.md`

## Global Constraints

- Code, identifiers and comments in English. Comments only for edge cases or non-obvious logic.
- Every user-visible string in pt-BR, sourced from `src/content/defaultContent.ts`, never inline in JSX.
- File naming: PascalCase for component files, camelCase for everything else (modules, assets, scripts).
- Declare before use. Named `function` declarations; helpers and sub-components above their consumer; `export default` at the bottom. Early returns. No single-caller abstractions.
- Desktop ≥1280px matches the PDF 1:1 (1280px container). Responsive down to 360px with no horizontal scroll.
- Palette (sampled from PDF): teal `#1F383F`, olive `#697E40`, olive-light `#98B163`, sand `#EFE7C0`, white. Logo SVG uses cream `#F2EBD1` + olive `#798447` (keep as-is).
- Fonts: Playfair Display Variable (headings, italic accents), Mulish Variable (body).
- Body text ≥ 4.5:1 contrast; large headings ≥ 3:1. Cream on olive fails 4.5:1 (≈3.6:1) → small text on olive is white; small olive text on sand/white uses `--color-olive-deep` (`#55692F`).
- Page load target < 1 s on preview; home transfer < 1 MB; Lighthouse A11y 100, SEO 100, Perf ≥ 90.
- No `next-themes`, no dark mode. Base path from `VITE_BASE` (default `/`), GitHub Pages workflow sets `/naturee/`.
- Never print or commit `~/.ssh/naturee_cloudflare_token` (not used in this spec).

## Review Focus

1. A page with `enabled: false` must 404, vanish from nav/footer/sitemap/prerender — test in Task 2 (content), Task 5 (nav), Task 8 (prerender).
2. Contact form with `VITE_CONTACT_API_URL` unset must still open WhatsApp and show success — test in Task 3 (`submitContact`) and Task 7 (`ContactForm`).
3. API returns 500 / network error → toast + WhatsApp still opens — test in Task 3 and Task 7.
4. Narrow viewport (360px): hero headline, ticker strip, logo carousel, footer columns must not overflow — Playwright overflow assertion on every route and both mobile projects in Task 9.
5. Prerendered HTML must carry page-specific `<title>`, description, canonical and OG tags, with no duplicates after hydration — Task 8 test on `dist/*/index.html` + Playwright head assertion in Task 9.

---

### Task 1: Foundation — dependencies, tokens, fonts, cleanup

**Files:**
- Modify: `package.json`, `src/index.css`, `index.html`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`, `.github/workflows/deploy.yml`
- Delete: `src/pages/{products,quotation,processes}.tsx`, `src/pages/quotation.test.tsx`, `src/pages/home.tsx`, `src/components/quotation/`, `src/context/`, `src/hooks/`, `src/lib/{catalog,quotation-message,quotation-submit,masks,validation}*.ts`, `src/data/`, `src/types/`, `src/assets/catalog/`, `src/assets/hero-produtos.svg`, `src/assets/vite.svg`, `src/components/layout/app-layout.tsx`, all `src/components/ui/*` except `button, input, textarea, label, sheet, sonner`
- Create: `src/pages/Home.tsx` (placeholder `<h1>` only, replaced in Task 7)

**Interfaces:**
- Produces: CSS tokens `--color-teal`, `--color-olive`, `--color-olive-light`, `--color-olive-deep`, `--color-sand`, `--color-cream`; shadcn semantic tokens mapped (`--primary`=olive, `--primary-foreground`=white, `--foreground`=teal, `--background`=white, `--secondary`=sand, `--secondary-foreground`=teal, `--accent`=olive-light, `--muted`=sand, `--muted-foreground`=olive-deep, `--border`=`#D9D3B5`, `--ring`=olive); `--font-heading`, `--font-sans`; utility classes `font-heading`, `bg-teal`, `text-cream` etc. via `@theme`.

- [ ] Step 1: `npm rm next-themes @fontsource-variable/geist && npm i @fontsource-variable/playfair-display @fontsource-variable/mulish && npm i -D sharp @playwright/test`
- [ ] Step 2: Delete the files listed above (`git rm -r`). Keep `src/test/setup.ts`, `src/lib/utils.ts`.
- [ ] Step 3: Rewrite `src/index.css`: imports (`tailwindcss`, `tw-animate-css`, `shadcn/tailwind.css`, both fonts incl. `wght-italic.css`), `@theme inline` with the tokens above, `:root` values in hex, base layer (`body` bg white / text teal / font-sans; `h1-h4` font-heading; focus-visible ring olive; `prefers-reduced-motion` kills smooth scroll). No `.dark` block, no `@custom-variant dark`.
- [ ] Step 4: `index.html`: `lang="pt-BR"`, `<meta name="theme-color" content="#1F383F">`, default `<title>Naturee Food Hub</title>` and description, favicon link. Keep `<div id="root">`.
- [ ] Step 5: `vite.config.ts`: `base: process.env.VITE_BASE ?? '/'`; keep `spaFallback` plugin; add `build.modulePreload = { polyfill: false }`. Workflow: add `env: VITE_BASE: /naturee/` to the build step.
- [ ] Step 6: `src/main.tsx`: `BrowserRouter basename={import.meta.env.BASE_URL}` + `<App />` only (providers come in Task 2). Use `hydrateRoot` when `root.hasChildNodes()`, else `createRoot`.
- [ ] Step 7: `src/App.tsx` routes: index → `Home` placeholder. Run `npm run lint && npx tsc -b && npm run build` → green, dist contains fonts.
- [ ] Step 8: Commit `chore: strip catalog, switch fonts and tokens to PDF palette`.

---

### Task 2: Content model and default content

**Files:**
- Create: `src/content/types.ts`, `src/content/defaultContent.ts`, `src/content/SiteContentContext.tsx`, `src/content/defaultContent.test.ts`, `src/routes.ts`

**Interfaces (produces):**

```ts
// types.ts
export type Image = { src: string; alt: string; width: number; height: number }
export type Link = { id: string; label: string; href: string; enabled: boolean }
/** href '#whatsapp' resolves to wa.me at render time; '#catalog' to site.catalogPdfUrl */
export type Cta = { label: string; href: string; message?: string }
export type IconName = 'snowflake' | 'truck' | 'zap' | 'shieldCheck' | 'package' | 'star' | 'circleCheck' | 'mapPin' | 'calendar' | 'clock' | 'utensils' | 'building' | 'store' | 'basket'
export type Seo = { title: string; description: string }
export type SiteInfo = { name: string; tagline: string; whatsapp: string; whatsappLabel: string; email: string; instagram: string; instagramUrl: string; regionLine: string; catalogPdfUrl: string; url: string; ogImage: string }
export type TrustItem = { icon: IconName; title: string; text: string }
export type Brand = { id: string; name: string; logo: Image }
export type Category = { id: string; name: string; blurb: string; image: Image }
export type FeatureCard = { title: string; text: string; image: Image }
export type HomePage = { enabled: boolean; seo: Seo; hero: { title: string; text: string; image: Image; primary: Cta; secondary: Cta }; ticker: { icon: IconName; label: string }[]; about: { label: string; title: string; paragraphs: string[]; image: Image; cta: Cta }; features: { label: string; cards: FeatureCard[] }; brands: { label: string; title: string }; categories: { label: string; title: string; ids: string[]; cta: Cta }; logistics: { label: string; title: string; text: string; image: Image; cta: Cta }; closing: { label: string; title: string; text: string; bullets: string[]; card: { title: string; text: string; primary: Cta; secondary: Cta; note: string } } }
export type AboutPage = { enabled: boolean; seo: Seo; hero: { title: string; images: Image[] }; about: { label: string; title: string; paragraphs: string[]; image: Image }; history: { label: string; title: string; paragraphs: string[] }; purpose: { label: string; title: string; text: string; image: Image }; features: FeatureCard[]; banner: { label: string; title: string; primary: Cta; secondary: Cta } }
export type ProductsPage = { enabled: boolean; seo: Seo; hero: { title: string; text: string; image: Image; cta: Cta }; categories: { label: string; title: string; text: string; cta: Cta }; brands: { label: string; title: string; text: string; partner: { label: string; title: string; text: string; cta: Cta } }; catalog: { label: string; title: string; text: string; image: Image; cta: Cta }; banner: { label: string; title: string; cta: Cta } }
export type LogisticsPage = { enabled: boolean; seo: Seo; hero: { title: string; text: string; image: Image; cta: Cta }; how: { label: string; title: string; text: string; steps: { title: string; text: string }[] }; regions: { label: string; title: string; text: string; image: Image }; audience: { label: string; title: string; text: string; items: { icon: IconName; label: string }[] }; planning: { label: string; title: string; text: string; boxes: { icon: IconName; title: string; text: string }[] }; banner: { label: string; title: string; text: string; image: Image; cta: Cta } }
export type ContactPage = { enabled: boolean; seo: Seo; hero: { label: string; title: string; text: string }; form: { title: string; fields: { name: string; email: string; subject: string; message: string }; placeholders: { name: string; email: string; subject: string; message: string }; submit: string; success: { title: string; text: string }; errors: { required: string; email: string; tooLong: string; apiFailed: string } } }
export type SiteContent = { site: SiteInfo; nav: Link[]; footerLinks: Link[]; trust: TrustItem[]; brands: Brand[]; categories: Category[]; pages: { home: HomePage; about: AboutPage; products: ProductsPage; logistics: LogisticsPage; contact: ContactPage } }
export type PageKey = keyof SiteContent['pages']
```

```ts
// routes.ts
export type RouteDef = { key: PageKey; path: string }
export const ROUTES: RouteDef[]  // home '/', about '/sobre', products '/marcas-e-produtos', logistics '/logistica', contact '/contato'
export function pathFor(key: PageKey): string
```

```tsx
// SiteContentContext.tsx
export function SiteContentProvider({ content = defaultContent, children })
export function useSiteContent(): SiteContent
export function usePage<K extends PageKey>(key: K): SiteContent['pages'][K]
export function enabledRoutes(content: SiteContent): RouteDef[]
```

Headings use `*italic*` markup: `"Mais do que distribuir, *conectamos.*"`.

- [ ] Step 1: Write `types.ts` as above.
- [ ] Step 2: Write `defaultContent.test.ts`: every `Image` has non-empty `alt`, `width > 0`, `height > 0`; every page has non-empty `seo.title` and `seo.description`; every `Link.href` is a `ROUTES` path or starts with `http`/`#`; `categories` ids referenced by `home.categories.ids` exist; `nav` has 5 enabled links. Run → fails (module missing).
- [ ] Step 3: Write `defaultContent.ts` with the full PDF copy (pt-BR, verbatim from the PDF text extract, headlines with `*…*` accents). Image `src` imports come from Task 4 — for now point at `plan-assets` copies is NOT allowed; create Task 4 first if needed, otherwise temporarily import the yet-to-exist paths and let Task 4 make them real before the test is run in CI. (Executor: do Task 4 before running this test.)
- [ ] Step 4: Write `routes.ts` and `SiteContentContext.tsx` (context with default value `defaultContent`; `enabledRoutes` filters on `pages[key].enabled`).
- [ ] Step 5: Run `npx vitest run src/content` → pass. Commit `feat: add typed site content model with PDF copy`.

---

### Task 3: Pure libs — whatsapp, richText, contact, seo

**Files:**
- Create: `src/lib/whatsapp.ts`, `src/lib/richText.tsx`, `src/lib/contact.ts`, `src/lib/seo.ts` and `.test.ts` for each

**Interfaces (produces):**

```ts
// whatsapp.ts
export function normalizePhone(raw: string): string            // '48 99196 3383' → '5548991963383' (adds 55 if 10–11 digits)
export function buildWhatsAppUrl(phone: string, message?: string): string // https://wa.me/5548991963383?text=…
export function resolveHref(href: string, site: SiteInfo, message?: string): { href: string; external: boolean }
// '#whatsapp' → wa.me (external), '#catalog' → site.catalogPdfUrl (external), 'http…' external, else internal route

// richText.tsx
export function renderRichText(text: string): ReactNode[]   // "*a* b" → [<em>a</em>, ' b']; unmatched '*' kept literal

// contact.ts
export type ContactFields = { name: string; email: string; subject: string; message: string }
export type ContactErrors = Partial<Record<keyof ContactFields, 'required' | 'email' | 'tooLong'>>
export const CONTACT_LIMITS = { name: 120, email: 160, subject: 120, message: 2000 }
export function validateContact(fields: ContactFields): ContactErrors
export function buildContactMessage(fields: ContactFields): string   // pt-BR WhatsApp body with the 4 fields
export type SubmitResult = { status: 'saved' | 'skipped' | 'failed' }
export function submitContact(fields: ContactFields, options?: { apiUrl?: string; fetchFn?: typeof fetch }): Promise<SubmitResult>
// apiUrl undefined → 'skipped'; 2xx → 'saved'; anything else / throw → 'failed'. Never throws.

// seo.ts
export function absoluteUrl(path: string, siteUrl: string): string   // joins without double slashes
export function pageTitle(title: string, siteName: string): string   // `${title} · ${siteName}`
```

- [ ] Step 1: Write the four test files (cases: phone normalisation with/without 55, URL encoding of `&` and accents; richText nested/unmatched; validation each error type + limits; submitContact skipped/saved/failed incl. thrown fetch; absoluteUrl slashes).
- [ ] Step 2: Run → fail. Implement. Run → pass. Commit `feat: add whatsapp, rich text, contact and seo helpers`.

---

### Task 4: Image pipeline and logos

**Files:**
- Create: `scripts/optimizeImages.ts`, `src/assets/images/*.webp`, `src/assets/logos/*.svg`, `public/ogDefault.jpg`, `public/catalogoNaturee.pdf` (placeholder single page generated with the logo + "Catálogo em breve")
- Modify: `package.json` (script `images`), `tsconfig.node.json` include `scripts`

**Interfaces:** `IMAGE_MAP` in the script: source path → `{ name, widths }`. Output `src/assets/images/<name>-<w>.webp`. Content imports `-1440` for banners and `-800` for cards; `srcSet` built by `imageSrcSet()` in `src/lib/images.ts`:

```ts
export function imageSrcSet(image: Image, variants: { src: string; width: number }[]): string
```
(Keep simpler if only two widths: content stores `src` (largest) and `srcSet` string directly on `Image`? → Decision: extend `Image` with optional `srcSet?: string; sizes?: string`. Update `types.ts`.)

- [ ] Step 1: Write `scripts/optimizeImages.ts` (sharp): for each entry resize to each width (no enlargement), `webp({ quality: 76, effort: 6 })`, strip metadata, log size before/after. Run `node scripts/optimizeImages.ts`. Target ≤ 150 KB for 1440w, ≤ 70 KB for 800w.
- [ ] Step 2: Copy SVG logos/icons to `src/assets/logos/` with camelCase names: `naturee.svg`, `natureeFooter.svg`, `whatsapp.svg`, `instagram.svg`, `brandSitioPuraVida.svg`, `brandGranarolo.svg`, `brandTartufoBrasil.svg`, `brandSalubi.svg`, `brandMassasDiNapoli.svg`, `brandConfitHaus.svg`. Strip XML prolog, `<metadata>` and `id="Camada_1"`; keep `viewBox`.
- [ ] Step 3: Create `public/ogDefault.jpg` 1200×630 from the home hero (sharp). Create `public/robots.txt` (`Allow: /`, `Sitemap: <site>/sitemap.xml`).
- [ ] Step 4: Wire imports into `defaultContent.ts`. `npm test` green. Commit `feat: optimized webp images, brand logos and static assets`.

---

### Task 5: Layout — header, mobile nav, footer, trust strip, skip link

**Files:**
- Create: `src/components/layout/SiteLayout.tsx`, `SiteHeader.tsx`, `MobileNav.tsx`, `SiteFooter.tsx`, `SkipLink.tsx`, `src/components/sections/TrustStrip.tsx`, `src/components/icons/Icon.tsx`, `src/components/layout/SiteHeader.test.tsx`, `SiteFooter.test.tsx`

**Interfaces:**
- `Icon({ name: IconName, className })` maps `IconName` → lucide component (declared map above the component).
- `SiteHeader()` reads `useSiteContent()`: left links = first 3 enabled nav, logo centered (link to `/`), right links = rest, WhatsApp pill (`resolveHref('#whatsapp')`, `target=_blank rel=noopener`). `NavLink` with `aria-current`. Below `lg`: logo left, hamburger right opening `MobileNav` (shadcn `Sheet side="right"`), `SheetTitle` sr-only.
- `SiteFooter()` : `TrustStrip` + 3 columns from `footerLinks`, `site`.
- `SiteLayout()` : `SkipLink` + header + `<main id="conteudo">` + `<Outlet />` + footer.

- [ ] Step 1: Tests: header renders 5 links with correct hrefs; disabled link hidden; active link has `aria-current="page"`; WhatsApp pill href starts with `https://wa.me/5548991963383`; mobile: click button labelled "Abrir menu" → dialog visible → Esc closes. Footer: phone, region, Instagram link, 5 quick links, 4 trust items.
- [ ] Step 2: Implement. Styling per PDF: header `bg-teal`, height 128px desktop (logo 110px tall), links Mulish 15px uppercase `text-cream` with 2px underline on active. Pill olive `rounded-full` 40px high. Footer: trust strip 4 cols with icon, title bold cream, text cream/80, bottom olive hairline; columns logo+tagline / "ACESSO RÁPIDO" / "ATENDIMENTO B2B" headings olive-light uppercase.
- [ ] Step 3: Pass tests, commit `feat: site header, mobile nav and footer from PDF`.

---

### Task 6: Shared section components

**Files:**
- Create under `src/components/sections/`: `SectionLabel.tsx`, `Heading.tsx`, `FeatureCards.tsx`, `PartnerBrands.tsx`, `CtaBanner.tsx`, `MediaText.tsx`, `CtaLink.tsx`, `Picture.tsx`, `Container.tsx`; `src/components/seo/Seo.tsx`; tests `Heading.test.tsx`, `PartnerBrands.test.tsx`, `CtaLink.test.tsx`, `Seo.test.tsx`

**Interfaces:**
- `Container({ className, children })` → `mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-0`.
- `SectionLabel({ children, tone: 'olive' | 'cream' })` uppercase Mulish 600 tracking-wide.
- `Heading({ as: 'h1'|'h2'|'h3', text, className })` → Playfair, `renderRichText(text)`.
- `CtaLink({ cta, variant: 'primary'|'outline'|'dark'|'light', icon?: 'arrow'|'download'|'catalog', className })` resolves href via `resolveHref` with `useSiteContent().site`; external → `<a target=_blank rel=noopener>`, internal → `<Link>`. Pill shape. ≥44px tall.
- `Picture({ image, priority?: boolean, className, sizes })` → `<img>` with width/height, `loading` lazy unless priority, `fetchPriority` high + `preload()` from `react-dom` when priority, `decoding="async"`.
- `FeatureCards({ cards, variant: 'dark'|'light' })` 3 cols, image 4:3 top, title Playfair, text, check icon bottom.
- `PartnerBrands({ brands, layout: 'carousel'|'grid' })` carousel: `ul` scroll-snap x, 3 visible desktop, prev/next buttons `aria-label="Marcas anteriores"/"Próximas marcas"` scrolling by `clientWidth`; grid: 3×2.
- `CtaBanner({ label, title, text?, image?, primary, secondary?, tone: 'olive'|'teal' })`.
- `MediaText({ image, side: 'left'|'right', children })` 2-col, stacks below `md`.
- `Seo({ title, description, path })` renders `<title>`, `<meta name=description>`, `<link rel=canonical>`, OG + twitter tags, using `site.url`, `site.ogImage`. React 19 hoists them.

- [ ] Step 1: Tests: Heading renders `<em>`; PartnerBrands renders all logos with alt and two labelled buttons; CtaLink `#whatsapp` → external anchor with `rel`, route → internal link; Seo sets `document.title` and description meta.
- [ ] Step 2: Implement, pass, commit `feat: shared section components`.

---

### Task 7: Pages and contact form

**Files:**
- Create: `src/pages/Home.tsx`, `About.tsx`, `Products.tsx`, `Logistics.tsx`, `Contact.tsx`, `NotFound.tsx`, `src/components/contact/ContactForm.tsx`, `src/components/contact/ContactField.tsx`, `src/components/pages/PageGate.tsx`; tests `ContactForm.test.tsx`, `pages.test.tsx` (smoke per page: h1 text from content, `document.title`)
- Modify: `src/App.tsx`, `src/main.tsx` (wrap with `SiteContentProvider`, `Toaster`)

**Interfaces:**
- `PageGate({ pageKey, children })` renders `NotFound` when `pages[pageKey].enabled === false`.
- `App` maps `ROUTES` → `<Route path element={<PageGate pageKey><Page/></PageGate>}>`, `*` → `NotFound`.
- `ContactForm()` state via `useState<ContactFields>`, `errors`, `status: 'idle'|'submitting'|'done'`. On submit: validate → focus first invalid; `submitContact(fields, { apiUrl: import.meta.env.VITE_CONTACT_API_URL })`; `failed` → `toast.error(errors.apiFailed)`; then `window.open(buildWhatsAppUrl(site.whatsapp, buildContactMessage(fields)), '_blank', 'noopener')`; render success block (`role="status"`).
- `ContactField({ id, label, error, children })` binds `htmlFor`, `aria-describedby`, `aria-invalid`.

Page layouts follow the spec table and PDF slices (`/tmp/.../scratchpad/pdf/hi-*-slice-*.png`): hero heights 596px desktop; sand sections `bg-sand`; dark cards `bg-teal`; Contact form card `bg-olive rounded-3xl` overlapping hero by 128px, inputs `bg-sand`.

- [ ] Step 1: Tests first (ContactForm: empty submit shows 4 errors + alert; invalid email; success path calls `window.open` with wa.me URL containing encoded name; API failure path toasts and still opens). Pages smoke.
- [ ] Step 2: Implement pages one by one, checking each against its PDF slice in the browser (`npm run dev`).
- [ ] Step 3: `npm run lint && npm test` green. Commit per page (`feat: home page`, …, `feat: contact page with form`).

---

### Task 8: Prerender, sitemap, head preloads

**Files:**
- Create: `src/entryServer.tsx`, `scripts/prerender.ts`, `scripts/prerender.test.ts`
- Modify: `package.json` scripts, `tsconfig.node.json` include, `.gitignore` (`dist-ssr`)

**Interfaces:**
```ts
// entryServer.tsx
export function render(url: string): string            // renderToString(<StaticRouter location={url}><Providers><App/></Providers></StaticRouter>)
export function routesToPrerender(): string[]         // enabledRoutes(defaultContent).map(path)
// scripts/prerender.ts
export function extractHead(html: string): { head: string; body: string }   // pulls <title>, <meta>, <link rel=canonical>, <script type="application/ld+json"> out of the body string
export function fontPreloads(assetsDir: string, base: string): string       // <link rel=preload as=font> for playfair-display-latin-wght-normal + mulish-latin-wght-normal
export function buildSitemap(paths: string[], siteUrl: string): string
```
Build script: `"build": "tsc -b && vite build && vite build --ssr src/entryServer.tsx --outDir dist-ssr && node scripts/prerender.ts"`. Prerender reads `dist/index.html` as template, for each path writes `dist/<path>/index.html` (root stays `dist/index.html`), copies to `404.html` the root, writes `dist/sitemap.xml`.

- [ ] Step 1: Tests for `extractHead`, `fontPreloads` (temp dir with fake hashed files), `buildSitemap`, and `routesToPrerender` ↔ `ROUTES` enabled set.
- [ ] Step 2: Implement; run `npm run build`; `grep -o '<title>[^<]*' dist/sobre/index.html` shows "Sobre · Naturee Food Hub". Open `npm run preview`, confirm hydration without console warnings and no duplicate `<title>`.
- [ ] Step 3: Commit `feat: prerender routes with head tags, sitemap and font preloads`.

---

### Task 9: Playwright cross-engine and mobile validation

**Files:**
- Create: `playwright.config.ts`, `e2e/pages.spec.ts`, `e2e/navigation.spec.ts`, `e2e/contact.spec.ts`, `e2e/seo.spec.ts`
- Modify: `package.json` (`"e2e": "playwright test"`), `.gitignore` (`test-results`, `playwright-report`)

Config: `webServer: { command: 'npm run preview -- --port 4173', url: 'http://localhost:4173' }`, projects: `chromium`, `firefox`, `webkit`, `Mobile Chrome` (Pixel 7), `Mobile Safari` (iPhone 14). `npx playwright install chromium firefox webkit`.

Tests:
- `pages.spec.ts`: for each route: status 200, exactly one `h1`, no console errors, `scrollWidth <= clientWidth` on `documentElement` and on `body`, every `img` has `alt` attribute and `naturalWidth > 0` after load, all focusable controls ≥ 44px on mobile projects.
- `navigation.spec.ts`: desktop nav links navigate and set `aria-current`; mobile: menu button opens sheet, link navigates, sheet closes; skip link focuses `#conteudo`; logo carousel next button scrolls.
- `contact.spec.ts`: empty submit → 4 error messages; valid submit → popup opened with `wa.me` URL containing encoded message; success status visible.
- `seo.spec.ts`: each route `title` matches content, `meta[name=description]`, `link[rel=canonical]`, `meta[property=og:title]` present exactly once; `/sitemap.xml` lists all 5; `/robots.txt` 200.

- [ ] Step 1: Install, write config and specs, run `npm run e2e`; fix layout/overflow findings until all 5 projects pass.
- [ ] Step 2: Commit `test: playwright cross-browser and mobile coverage`.

---

### Task 10: Performance, Lighthouse, final review

- [ ] Step 1: `npm run build && npm run preview`; run Lighthouse (chrome-devtools MCP `lighthouse_audit`) on `/`, `/marcas-e-produtos`, `/contato` desktop + mobile. Record scores in the PR description.
- [ ] Step 2: Fix findings: hero `preload`, `sizes` attributes, font preloads present, no render-blocking beyond CSS, total home transfer < 1 MB, LCP < 1 s on desktop preview. Check `dist/assets/*.js` gzip size (`gzip -c | wc -c`) < 120 KB.
- [ ] Step 3: Keyboard-only pass; axe via Playwright (`@axe-core/playwright`) on each route → 0 violations.
- [ ] Step 4: Compare each route against PDF slices at 1280px and 390px (Playwright screenshots into `.screenshots/`).
- [ ] Step 5: Update `README.md` (stack, scripts, content model, image pipeline, prerender). `npm run lint && npm test && npm run e2e` green.
- [ ] Step 6: Push `feat/site-pages`, open PR to `main` (repo is GitHub; `gh` unavailable → give the compare URL).
