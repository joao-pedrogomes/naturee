import { CircleCheck, MapPin } from 'lucide-react'
import Icon from '@/components/icons/Icon'
import Container from '@/components/sections/Container'
import CtaLink from '@/components/sections/CtaLink'
import FeatureCards from '@/components/sections/FeatureCards'
import Heading from '@/components/sections/Heading'
import HighlightCard from '@/components/sections/HighlightCard'
import MediaText from '@/components/sections/MediaText'
import PartnerBrands from '@/components/sections/PartnerBrands'
import Picture from '@/components/sections/Picture'
import RichText from '@/components/sections/RichText'
import SectionLabel from '@/components/sections/SectionLabel'
import Seo from '@/components/seo/Seo'
import { usePage, useSiteContent } from '@/content/siteContent'
import { pathFor } from '@/routes'

function Home() {
  const page = usePage('home')
  const { brands, categories, site } = useSiteContent()
  const highlighted = page.categories.ids
    .map((id) => categories.find((category) => category.id === id))
    .filter((category) => category !== undefined)

  return (
    <>
      <Seo seo={page.seo} path={pathFor('home')} />

      <section className="relative isolate flex min-h-[40rem] items-end overflow-hidden bg-teal text-sand lg:min-h-[52vw] lg:max-h-[46rem]">
        <Picture image={page.hero.image} priority className="absolute inset-0 -z-10 h-full w-full object-cover object-[70%_center]" />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-black/70 via-black/35 to-transparent" aria-hidden="true" />
        <Container className="pt-32 pb-14 lg:pt-[14rem] lg:pb-[6vw]">
          <div className="max-w-[24rem] lg:max-w-[28vw]">
            <Heading as="h1" text={page.hero.title} className="text-display text-sand [&_em]:text-olive-light" />
            <p className="mt-6 text-lead text-white">{page.hero.text}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink cta={page.hero.primary} variant="teal" icon="catalog" size="sm" />
              <CtaLink cta={page.hero.secondary} variant="outlineCream" size="sm" />
            </div>
          </div>
        </Container>
      </section>

      <section aria-label="Diferenciais em destaque" className="bg-teal py-4">
        <Container>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-3 lg:flex lg:items-center lg:justify-between">
            {page.ticker.map((item) => (
              <li key={item.label} className="flex items-center gap-3 text-body text-olive-light">
                <Icon name={item.icon} className="size-6 shrink-0" />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16 lg:py-[5.5vw]">
        <Container>
          <MediaText image={page.about.image} side="right" imageClassName="aspect-[1.24]">
            <SectionLabel>{page.about.label}</SectionLabel>
            <Heading text={page.about.title} className="mt-5 text-title text-teal" />
            <div className="mt-6 space-y-4 text-body text-teal">
              {page.about.paragraphs.map((paragraph) => (
                <RichText key={paragraph} text={paragraph} />
              ))}
            </div>
            <div className="mt-8">
              <CtaLink cta={page.about.cta} variant="olive" size="sm" className="min-w-[16rem]" />
            </div>
          </MediaText>
        </Container>
      </section>

      <section className="pb-16 lg:pb-[5.5vw]">
        <Container>
          <SectionLabel className="text-center">{page.features.label}</SectionLabel>
          <div className="mt-10">
            <FeatureCards cards={page.features.cards} variant="dark" />
          </div>
        </Container>
      </section>

      <section className="pb-16 lg:pb-[5.5vw]">
        <Container>
          <SectionLabel className="text-center">{page.brands.label}</SectionLabel>
          <Heading text={page.brands.title} className="mx-auto mt-4 max-w-[22ch] text-center text-title text-teal" />
          <div className="mt-10">
            <PartnerBrands brands={brands} layout="carousel" />
          </div>
        </Container>
      </section>

      <section className="bg-sand py-16 lg:py-[4.5vw]">
        <Container>
          <SectionLabel>{page.categories.label}</SectionLabel>
          <Heading text={page.categories.title} className="mt-3 text-title text-teal" />
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[8%]">
            {highlighted.map((category) => (
              <HighlightCard key={category.id} category={category} label="Categoria" />
            ))}
          </ul>
          <div className="mt-10 text-center">
            <CtaLink cta={page.categories.cta} variant="teal" size="sm" className="min-w-[15rem]" />
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-[5vw]">
        <Container>
          <MediaText image={page.logistics.image} side="left" imageClassName="aspect-[1.35]">
            <SectionLabel>{page.logistics.label}</SectionLabel>
            <Heading text={page.logistics.title} className="mt-8 text-title text-teal" />
            <p className="mt-6 text-body text-teal">{page.logistics.text}</p>
            <div className="mt-8">
              <CtaLink cta={page.logistics.cta} variant="olive" size="sm" className="min-w-[16rem]" />
            </div>
          </MediaText>
        </Container>
      </section>

      <section className="pb-16 lg:pb-[4vw]">
        <div className="mx-auto w-full lg:w-[86.6vw] lg:max-w-[104rem]">
          <div className="grid gap-10 bg-sand px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1fr] lg:rounded-t-2xl lg:px-[5.5%] lg:py-[2.5vw]">
            <div>
              <SectionLabel>{page.closing.label}</SectionLabel>
              <Heading text={page.closing.title} className="mt-5 text-title text-teal" />
              <p className="mt-4 text-body text-teal">{page.closing.text}</p>
              <ul className="mt-6 space-y-3">
                {page.closing.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-3 text-lead text-olive-deep">
                    <CircleCheck aria-hidden="true" className="size-5 shrink-0 text-olive" strokeWidth={1.5} />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-teal px-6 py-10 text-sand sm:px-10 lg:px-[9%]">
              <h2 className="font-sans text-subtitle font-bold text-olive-light">{page.closing.card.title}</h2>
              <p className="mt-4 text-body text-sand">{page.closing.card.text}</p>
              <div className="mt-8 flex flex-col gap-3">
                <CtaLink cta={page.closing.card.primary} variant="olive" icon="arrow" size="lg" className="w-full" />
                <CtaLink cta={page.closing.card.secondary} variant="outlineCream" icon="arrow" size="lg" className="w-full" />
              </div>
              <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-sand lg:text-[0.8vw]">
                <MapPin aria-hidden="true" className="size-4 shrink-0 text-olive-light" strokeWidth={1.5} />
                <span>{page.closing.card.note || site.regionLine}</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
