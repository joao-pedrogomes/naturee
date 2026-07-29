import heroProdutos from "@/assets/hero-produtos.svg"

const DEFAULT_EYEBROW = "Marcas & Produtos"
const DEFAULT_TITLE = "Produtos e marcas selecionados"
const DEFAULT_DESCRIPTION =
  "Trabalhamos com produtores artesanais e marcas selecionadas uma a uma para abastecer restaurantes, mercados e empórios."

/**
 * Full-bleed catalog banner. The image is decorative — all meaning lives in
 * the text on top of it — so the gradient exists purely to keep that text
 * legible over any photography that replaces the placeholder.
 */
export function CatalogHero({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image = heroProdutos,
  eyebrow = DEFAULT_EYEBROW,
}: {
  title?: string
  description?: string
  image?: string
  eyebrow?: string
}): React.JSX.Element {
  return (
    <section className="relative isolate aspect-[4/3] w-full overflow-hidden rounded-none bg-primary sm:aspect-[21/9] sm:rounded-xl">
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
      />

      <div className="relative flex size-full flex-col justify-end gap-2 p-5 sm:gap-2.5 sm:p-8 lg:p-12">
        {eyebrow && (
          <p className="text-[0.7rem] font-medium tracking-[0.2em] text-white/70 uppercase sm:text-xs">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-[18ch] font-heading text-2xl leading-tight font-semibold text-balance text-white sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        <p className="max-w-[52ch] text-sm leading-relaxed text-pretty text-white/85 sm:text-base">
          {description}
        </p>
      </div>
    </section>
  )
}
