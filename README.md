# Naturee Food Hub

Institutional site for Naturee Food Hub, built from the client's PDF wireframe
(`plan-assets/Site/`). Five pages: Início, Sobre, Marcas & Produtos, Logística, Contato.

## Stack

- Vite 8, React 19, TypeScript, react-router 7
- Tailwind CSS v4 with the PDF palette as design tokens (`src/index.css`)
- shadcn/ui primitives kept to `input`, `textarea`, `label`, `sheet`
- Playfair Display (headings) and Mulish (body) via `@fontsource-variable`
- Vitest + Testing Library for unit tests, Playwright + axe for end-to-end
- Cloudflare Worker + D1 (SQLite) behind the site: lead capture, admin dashboard, editable content

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Typecheck, client build, SSR build, prerender every route into `dist/` |
| `npm run preview` | Serve `dist/` locally on port 4173 |
| `npm test` | Unit tests |
| `npm run e2e` | Playwright on Chromium, Firefox, WebKit, Pixel 7 and iPhone 14 (needs `npx playwright install`) |
| `npm run lint` | oxlint |
| `npm run dev:worker` | Build, migrate the local D1 and run the Worker on :8787 (`wrangler dev`) |
| `npm run db:local` | Apply `migrations/` to the local D1 |
| `npm run seed:admin -- <email> [--remote]` | Create or reset an admin; random password saved to `~/.naturee_admin_password` (mode 600) |
| `npm run e2e:admin` | Admin and API end-to-end against `wrangler dev` with a throwaway D1 |
| `npm run typecheck:worker` | Typecheck `worker/` |
| `npm run deploy` | Build and `wrangler deploy` (production, needs `CLOUDFLARE_API_TOKEN`) |
| `npm run images` | Regenerate optimized webp variants from `plan-assets/Site/` with sharp |

## How the site is put together

### Content model

Nothing user-visible lives in JSX. All copy, links, images, contact details and page
flags come from one `SiteContent` object (`src/content/types.ts`). Version 1 serves the
static defaults in `src/content/defaultContent.ts` through `SiteContentProvider`; the
admin backend planned for version 2 stores the same shape in a database and the provider
fetches it instead. Headings accept `*italic*` and `**bold**` markup, rendered by
`src/lib/richText.tsx`.

CTA hrefs may be a route, an absolute URL, or a sentinel: `#whatsapp` resolves to a
`wa.me` link using the configured number, `#catalog` to the catalog PDF.

### Pages and sections

`src/pages/*` compose shared blocks from `src/components/sections/*` and read content via
`usePage()`. `PageGate` renders the 404 page when a page is disabled in content, and that
page also drops out of the nav, sitemap and prerender.

### Prerender

`npm run build` renders every enabled route with `react-dom/server` and writes
`dist/<route>/index.html` plus `dist/<route>.html`, each with its own `<title>`,
description, canonical and Open Graph tags, font preloads and the hero image preload.
Crawlers and WhatsApp link previews get real HTML; the client then hydrates. The script
lives in `scripts/prerender.ts`; `dist/404.html` stays a bare shell for client routing.

### Images

Source photos (500 KB to 1 MB each) are converted by `scripts/optimizeImages.ts` into
`src/assets/images/*-<width>.webp` (1440/960/640 for banners, 800/480 for cards). Every
image has width, height, alt text and `srcset`; only the hero loads eagerly.

### Contact form

Validates on the client, posts to `/api/contact` (override with `VITE_CONTACT_API_URL`) and always
opens WhatsApp with the message prefilled, even when the API fails. See `src/lib/contact.ts`.

## Backend (Cloudflare Worker + D1)

One Worker (`worker/index.ts`) serves the static assets and the dynamic routes. Only the page
routes, `/sitemap.xml`, `/admin/*`, `/api/*` and `/media/*` run through it (`run_worker_first`
in `wrangler.jsonc`); JS, CSS, fonts and images are served straight from assets.

- **Public pages** are server-rendered per request from `defaultContent` plus the overrides stored in D1,
  using the same SSR bundle the prerender uses (`dist-ssr/entryServer.js`, imported as `@ssr`).
  The result is cached in the edge cache per Worker version and content version, so a publish
  invalidates it without purging. Any failure falls back to the prerendered static page.
- **Content model:** the admin never stores a full copy. D1 `content_overrides` holds only edited leaves
  (`pages.home.hero.title`, image references, flags); `applyOverrides` merges them over the defaults
  (`src/content/overrides.ts`). New builds with new asset hashes keep working.
- **Leads:** `POST /api/contact` validates, rejects honeypot/too-fast posts silently, rate limits per IP,
  stores the lead and, when enabled in settings and `RESEND_API_KEY` is set, emails the company.
  The site then still opens WhatsApp with the prefilled message.
- **Admin:** `/admin` (noindex, strict CSP). PBKDF2-SHA256 hashes, hashed session tokens in D1, `__Host-`
  HttpOnly SameSite=Strict cookie, Origin check on every write, login throttling, forced password change
  after seeding. The panel code is a separate lazy chunk and does not load on public pages.
- **Images** are resized to WebP in the browser (1440 px and 720 px) and stored as D1 blobs, served
  from `/media/<id>` with immutable caching. No R2 bucket, so no payment method is needed.
- **Limits worth knowing:** workerd caps PBKDF2 at 100,000 iterations; the free plan allows 10 ms of CPU
  per request, so rendering happens only on cache misses.

Secrets are never in the repo: `RESEND_API_KEY` and `IP_PEPPER` are set with `wrangler secret put`,
and the Cloudflare token is read from `~/.ssh/naturee_cloudflare_token`.

## Environment variables

| Variable | Purpose |
|---|---|
| `VITE_BASE` | Base path for a subpath deploy (GitHub Pages uses `/naturee/`) |
| `VITE_CONTACT_API_URL` | Contact endpoint; defaults to `/api/contact` |

## Conventions

- PascalCase component files, camelCase for everything else.
- Declare before use, early returns, one component per file.
- Code and comments in English; every user-facing string in Portuguese and in the content file.
- Desktop at 1280px matches the PDF; everything is responsive down to 360px.

Design spec: `docs/superpowers/specs/2026-11-10-site-pages-design.md`.
