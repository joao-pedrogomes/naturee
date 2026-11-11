import CategoryCard from '@/components/sections/CategoryCard'
import Container from '@/components/sections/Container'
import CtaLink from '@/components/sections/CtaLink'
import Heading from '@/components/sections/Heading'
import RichText from '@/components/sections/RichText'
import PartnerBrands from '@/components/sections/PartnerBrands'
import Picture from '@/components/sections/Picture'
import SectionLabel from '@/components/sections/SectionLabel'
import Seo from '@/components/seo/Seo'
import { usePage, useSiteContent } from '@/content/siteContent'
import { renderRichText } from '@/lib/richText'
import { pathFor } from '@/routes'

const CARD_TONES = ['dark', 'light', 'dark', 'light', 'dark', 'light'] as const

/* word-spacing mimics the artboard's justified lines, whose spaces were squeezed to fit. */
const PARAGRAPH = 'text-body text-black lg:leading-[1.3] lg:[word-spacing:-0.04em]'

function Products() {
  const page = usePage('products')
  const { brands, categories } = useSiteContent()

  return (
    <>
      <Seo seo={page.seo} path={pathFor('products')} />

      <section className="grid bg-olive text-sand md:grid-cols-2 lg:h-[calc(721*var(--u))] lg:grid-cols-[calc(966*var(--u))_1fr]">
        <Picture image={page.hero.image} priority className="h-64 w-full object-cover object-left md:h-full md:min-h-[24rem] lg:h-full lg:min-h-0" />
        <div className="flex flex-col justify-start px-4 py-12 sm:px-6 lg:py-0 lg:pt-[calc(125*var(--u))] lg:pr-0 lg:pl-[calc(111*var(--u))]">
          <Heading as="h1" text={page.hero.title} className="text-display text-teal lg:leading-[0.935]" />
          <p className={`mt-6 max-w-[42ch] text-sand lg:mt-[calc(11*var(--u))] lg:max-w-[calc(640*var(--u))] lg:text-[length:clamp(1rem,calc(30*var(--u)),3.5rem)] lg:leading-[1.17]`}>
            {renderRichText(page.hero.text)}
          </p>
          <div className="mt-8 lg:mt-[calc(40*var(--u))]">
            <CtaLink cta={page.hero.cta} variant="teal" icon="catalog" size="sm" className="lg:w-[calc(255*var(--u))]" />
          </div>
        </div>
      </section>

      <section className="bg-sand py-16 lg:pt-[calc(101*var(--u))] lg:pb-[calc(83*var(--u))]">
        <Container className="text-center">
          <SectionLabel>{page.categories.label}</SectionLabel>
          <Heading text={page.categories.title} className="mx-auto mt-4 max-w-[24ch] text-title text-teal lg:mt-[calc(36*var(--u))] lg:max-w-none" />
          <RichText text={page.categories.text} className={`mx-auto mt-5 max-w-[60ch] ${PARAGRAPH} lg:mt-[calc(31*var(--u))] lg:max-w-none`} />
          <ul className="mt-12 grid gap-7 text-left sm:grid-cols-2 lg:mt-[calc(75*var(--u))] lg:w-full lg:grid-cols-3 lg:gap-[calc(46*var(--u))] lg:gap-y-[calc(42*var(--u))]">
            {categories.map((category, index) => (
              <CategoryCard key={category.id} category={category} tone={CARD_TONES[index % CARD_TONES.length]} />
            ))}
          </ul>
          <div className="mt-12 lg:mt-[calc(69*var(--u))]">
            <CtaLink cta={page.categories.cta} variant="teal" icon="download" size="lg" className="w-full sm:w-auto sm:min-w-[24rem] lg:h-[calc(66*var(--u))] lg:w-[calc(564*var(--u))]" />
          </div>
        </Container>
      </section>

      <section className="py-16 lg:pt-[calc(64*var(--u))] lg:pb-[calc(63*var(--u))]">
        <Container className="text-center">
          <SectionLabel>{page.brands.label}</SectionLabel>
          <Heading text={page.brands.title} className="mx-auto mt-4 max-w-[26ch] text-title text-teal lg:mt-[calc(30*var(--u))] lg:max-w-none" />
          <RichText text={page.brands.text} className={`mx-auto mt-5 max-w-[66ch] ${PARAGRAPH} lg:mt-[calc(34*var(--u))] lg:max-w-none`} />
          <div className="mx-auto mt-12 max-w-[58rem] lg:mt-[calc(58*var(--u))] lg:w-[calc(1194*var(--u))] lg:max-w-none">
            <PartnerBrands brands={brands} layout="grid" />
          </div>
          <div className="mx-auto mt-14 flex flex-col items-center gap-6 rounded-xl bg-sand px-6 py-6 text-center sm:flex-row sm:text-left lg:mt-[calc(78*var(--u))] lg:h-[calc(160*var(--u))] lg:w-[calc(1089*var(--u))] lg:justify-between lg:rounded-[calc(24*var(--u))] lg:py-0 lg:pr-[calc(180*var(--u))] lg:pl-[calc(218*var(--u))]">
            <div className="flex-1">
              <SectionLabel className="lg:text-[length:calc(17*var(--u))]">{page.brands.partner.label}</SectionLabel>
              <Heading as="h3" text={page.brands.partner.title} className="mt-2 text-card-title text-teal lg:mt-[calc(6*var(--u))] lg:text-[length:calc(31*var(--u))]" />
              <p className="mt-1 text-small text-black lg:mt-[calc(10*var(--u))] lg:text-[length:calc(17*var(--u))]">{renderRichText(page.brands.partner.text)}</p>
            </div>
            <CtaLink cta={page.brands.partner.cta} variant="teal" icon="arrow" size="sm" className="normal-case lg:mt-[calc(40*var(--u))] lg:h-[calc(44*var(--u))] lg:w-[calc(250*var(--u))] lg:text-[length:calc(21*var(--u))]" />
          </div>
        </Container>
      </section>

      <section className="bg-sand py-16 lg:pt-[calc(98*var(--u))] lg:pb-[calc(123*var(--u))]">
        <Container>
          <div className="grid items-start gap-10 md:grid-cols-2 lg:grid-cols-[calc(668*var(--u))_calc(669*var(--u))] lg:gap-[calc(57*var(--u))] lg:ml-[calc(-3*var(--u))]">
            <Picture image={page.catalog.image} className="aspect-[4/3] w-full rounded-2xl object-cover lg:aspect-auto lg:h-[calc(534*var(--u))] lg:rounded-[calc(36*var(--u))]" />
            <div className="lg:ml-[calc(2*var(--u))] lg:pt-[calc(44*var(--u))]">
              <SectionLabel>{page.catalog.label}</SectionLabel>
              <Heading text={page.catalog.title} className="mt-8 text-display text-teal lg:mt-[calc(64*var(--u))] lg:leading-[0.935]" />
              <p className={`mt-5 ${PARAGRAPH} lg:mt-[calc(25*var(--u))] lg:max-w-[calc(690*var(--u))]`}>{renderRichText(page.catalog.text)}</p>
              <div className="mt-8 lg:mt-[calc(25*var(--u))]">
                <CtaLink cta={page.catalog.cta} variant="olive" icon="download" size="lg" className="lg:h-[calc(66*var(--u))] lg:w-[calc(322*var(--u))]" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-sand pb-0 lg:bg-[linear-gradient(to_bottom,var(--sand)_calc(177*var(--u)),var(--teal)_0)] lg:pt-[calc(0*var(--u))]">
        <Container>
          <div className="rounded-3xl bg-olive px-6 py-10 text-center text-sand lg:h-[calc(360*var(--u))] lg:rounded-[calc(36*var(--u))] lg:px-[calc(176*var(--u))] lg:py-0 lg:pt-[calc(70*var(--u))]">
            <SectionLabel tone="cream" className="lg:text-[length:calc(23*var(--u))] lg:font-normal">{page.banner.label}</SectionLabel>
            <Heading text={page.banner.title} className="mt-3 text-display text-teal lg:mt-[calc(12*var(--u))]" />
            <div className="mt-8 lg:mt-[calc(39*var(--u))]">
              <CtaLink cta={page.banner.cta} variant="teal" icon="arrow" size="lg" className="w-full lg:h-[calc(66*var(--u))] lg:w-[calc(1104*var(--u))]" />
            </div>
          </div>
        </Container>
      </section>
      <div className="h-8 bg-teal lg:h-[calc(56*var(--u))]" aria-hidden="true" />
    </>
  )
}

export default Products
