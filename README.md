# Naturee Food Hub

Institutional site for Naturee Food Hub, built from the client's PDF wireframe
(`plan-assets/Site/`). Five pages: Início, Sobre, Marcas & Produtos, Logística, Contato.

## Stack

- Vite 8, React 19, TypeScript, react-router 7
- Tailwind CSS v4 with the PDF palette as design tokens (`src/index.css`)
- shadcn/ui primitives kept to `input`, `textarea`, `label`, `sheet`
- Playfair Display (headings) and Mulish (body) via `@fontsource-variable`
- Vitest + Testing Library for unit tests, Playwright + axe for end-to-end

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Typecheck, client build, SSR build, prerender every route into `dist/` |
| `npm run preview` | Serve `dist/` locally on port 4173 |
| `npm test` | Unit tests |
| `npm run e2e` | Playwright on Chromium, Firefox, WebKit, Pixel 7 and iPhone 14 (needs `npx playwright install`) |
| `npm run lint` | oxlint |
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

Validates on the client, then calls `POST $VITE_CONTACT_API_URL` when that variable is
set, and always opens WhatsApp with the message prefilled. Without the variable the API
step is skipped. See `src/lib/contact.ts`.

## Environment variables

| Variable | Purpose |
|---|---|
| `VITE_BASE` | Base path for a subpath deploy (GitHub Pages uses `/naturee/`) |
| `VITE_CONTACT_API_URL` | Contact endpoint; unset means WhatsApp only |

## Conventions

- PascalCase component files, camelCase for everything else.
- Declare before use, early returns, one component per file.
- Code and comments in English; every user-facing string in Portuguese and in the content file.
- Desktop at 1280px matches the PDF; everything is responsive down to 360px.

Design spec: `docs/superpowers/specs/2026-11-10-site-pages-design.md`.
