import CategoryCard from '@/components/sections/CategoryCard'
import Container from '@/components/sections/Container'
import CtaLink from '@/components/sections/CtaLink'
import Heading from '@/components/sections/Heading'
import MediaText from '@/components/sections/MediaText'
import PartnerBrands from '@/components/sections/PartnerBrands'
import Picture from '@/components/sections/Picture'
import SectionLabel from '@/components/sections/SectionLabel'
import Seo from '@/components/seo/Seo'
import { usePage, useSiteContent } from '@/content/siteContent'
import { pathFor } from '@/routes'

const CARD_TONES = ['dark', 'light', 'dark', 'light', 'dark', 'light'] as const

function Products() {
  const page = usePage('products')
  const { brands, categories } = useSiteContent()

  return (
    <>
      <Seo seo={page.seo} path={pathFor('products')} />

      <section className="grid bg-olive text-sand md:grid-cols-2">
        <Picture image={page.hero.image} priority className="h-64 w-full object-cover object-left md:h-full md:min-h-[24rem] lg:min-h-[36vw]" />
        <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-[6vw] lg:py-16">
          <Heading as="h1" text={page.hero.title} className="max-w-[16ch] text-title text-sand" />
          <p className="mt-6 max-w-[42ch] text-body text-white">{page.hero.text}</p>
          <div className="mt-8">
            <CtaLink cta={page.hero.cta} variant="teal" icon="catalog" size="sm" />
          </div>
        </div>
      </section>

      <section className="bg-sand py-16 lg:py-[4.5vw]">
        <Container className="text-center">
          <SectionLabel>{page.categories.label}</SectionLabel>
          <Heading text={page.categories.title} className="mx-auto mt-4 max-w-[24ch] text-title text-teal" />
          <p className="mx-auto mt-5 max-w-[60ch] text-body text-teal">{page.categories.text}</p>
          <ul className="mt-12 grid gap-7 text-left sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <CategoryCard key={category.id} category={category} tone={CARD_TONES[index % CARD_TONES.length]} />
            ))}
          </ul>
          <div className="mt-12">
            <CtaLink cta={page.categories.cta} variant="teal" icon="download" size="lg" className="w-full sm:w-auto sm:min-w-[24rem]" />
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-[4vw]">
        <Container className="text-center">
          <SectionLabel>{page.brands.label}</SectionLabel>
          <Heading text={page.brands.title} className="mx-auto mt-4 max-w-[26ch] text-title text-teal" />
          <p className="mx-auto mt-5 max-w-[66ch] text-body text-teal">{page.brands.text}</p>
          <div className="mx-auto mt-12 max-w-[58rem]">
            <PartnerBrands brands={brands} layout="grid" />
          </div>
          <div className="mx-auto mt-14 flex max-w-[46rem] flex-col items-center gap-6 rounded-xl bg-sand px-6 py-6 text-center sm:flex-row sm:text-left lg:px-[9rem]">
            <div className="flex-1">
              <SectionLabel>{page.brands.partner.label}</SectionLabel>
              <Heading as="h3" text={page.brands.partner.title} className="mt-2 text-card-title text-teal" />
              <p className="mt-1 text-small text-teal">{page.brands.partner.text}</p>
            </div>
            <CtaLink cta={page.brands.partner.cta} variant="teal" icon="arrow" size="sm" className="normal-case tracking-normal" />
          </div>
        </Container>
      </section>

      <section className="bg-sand py-16 lg:py-[4vw]">
        <Container>
          <MediaText image={page.catalog.image} side="left" imageClassName="aspect-[1.25]">
            <SectionLabel>{page.catalog.label}</SectionLabel>
            <Heading text={page.catalog.title} className="mt-8 text-title text-teal" />
            <p className="mt-5 text-body text-teal">{page.catalog.text}</p>
            <div className="mt-8">
              <CtaLink cta={page.catalog.cta} variant="olive" icon="download" size="lg" />
            </div>
          </MediaText>
        </Container>
      </section>

      <section className="bg-sand pb-0">
        <Container>
          <div className="relative top-8 rounded-2xl bg-olive px-6 py-10 text-center text-sand lg:px-[9%] lg:py-12">
            <SectionLabel tone="cream">{page.banner.label}</SectionLabel>
            <Heading text={page.banner.title} className="mt-3 text-title text-sand" />
            <div className="mt-8">
              <CtaLink cta={page.banner.cta} variant="teal" icon="arrow" size="lg" className="w-full max-w-[46rem]" />
            </div>
          </div>
        </Container>
      </section>
      <div className="h-8 bg-teal" aria-hidden="true" />
    </>
  )
}

export default Products
