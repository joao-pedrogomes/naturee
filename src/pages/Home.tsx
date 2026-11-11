import Icon from '@/components/icons/Icon'
import Container from '@/components/sections/Container'
import CtaLink from '@/components/sections/CtaLink'
import FeatureCards from '@/components/sections/FeatureCards'
import Heading from '@/components/sections/Heading'
import HighlightCard from '@/components/sections/HighlightCard'
import PartnerBrands from '@/components/sections/PartnerBrands'
import Picture from '@/components/sections/Picture'
import RichText from '@/components/sections/RichText'
import SectionLabel from '@/components/sections/SectionLabel'
import Seo from '@/components/seo/Seo'
import { usePage, useSiteContent } from '@/content/siteContent'
import { pathFor } from '@/routes'
import footerPin from '@/assets/icons/footerPin.svg'

/* word-spacing mimics the artboard's justified lines, whose spaces were squeezed to fit. */
const PARAGRAPH = 'text-body text-black lg:text-justify lg:leading-[1.2] lg:[word-spacing:-0.04em]'

function Home() {
  const page = usePage('home')
  const { brands, categories, site } = useSiteContent()
  const highlighted = page.categories.ids
    .map((id) => categories.find((category) => category.id === id))
    .filter((category) => category !== undefined)

  return (
    <>
      <Seo seo={page.seo} path={pathFor('home')} />

      <section className="relative isolate overflow-hidden bg-teal text-sand lg:h-[calc(949*var(--u))]">
        <Picture image={page.hero.image} priority className="absolute inset-0 -z-10 h-full w-full object-cover object-[70%_center] lg:object-[43%_center]" />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-black/45 via-black/15 to-transparent lg:hidden" aria-hidden="true" />
        <Container className="pt-36 pb-14 lg:pt-[calc(336*var(--u))] lg:pb-0">
          <div className="max-w-[24rem] lg:max-w-none">
            <Heading
              as="h1"
              text={page.hero.title}
              className="font-normal text-display text-sand lg:leading-[0.935] [&_em]:font-semibold [&_strong]:text-olive-bright [&_strong]:font-semibold"
            />
            <p className="mt-6 text-body text-sand lg:mt-[calc(29*var(--u))] lg:max-w-[calc(500*var(--u))] lg:leading-[1.17]">
              {page.hero.text}
            </p>
            <div className="mt-8 flex flex-wrap gap-3 lg:mt-[calc(58*var(--u))] lg:gap-[calc(15*var(--u))]">
              <CtaLink cta={page.hero.primary} variant="teal" icon="catalog" size="sm" className="lg:w-[calc(255*var(--u))]" />
              <CtaLink cta={page.hero.secondary} variant="outlineCream" size="sm" className="border-2 lg:w-[calc(255*var(--u))]" />
            </div>
          </div>
        </Container>
      </section>

      <section aria-label="Diferenciais em destaque" className="bg-teal py-4 lg:flex lg:h-[calc(84*var(--u))] lg:items-center lg:py-0">
        <div className="container-site lg:w-[calc(1737*var(--u))]">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-3 lg:flex lg:items-center lg:justify-center lg:gap-0">
            {page.ticker.map((item, index) => (
              <li key={item.label} className="flex items-center font-semibold text-lead text-olive">
                {index > 0 ? (
                  <span aria-hidden="true" className="hidden text-sand lg:mx-[calc(55*var(--u))] lg:inline lg:text-[length:calc(22*var(--u))]">
                    •
                  </span>
                ) : null}
                <span className="flex items-center gap-3 lg:gap-[calc(14*var(--u))] lg:whitespace-nowrap">
                  <Icon name={item.icon} className="h-6 w-auto lg:h-[calc(40*var(--u))]" />
                  <span>{item.label}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 lg:pt-[calc(77*var(--u))] lg:pb-[calc(118*var(--u))]">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[calc(648*var(--u))_calc(690*var(--u))] lg:justify-between lg:gap-0">
            <div>
              <SectionLabel className="lg:leading-[1.3]">{page.about.label}</SectionLabel>
              <Heading text={page.about.title} className="mt-5 text-title text-teal lg:mt-[calc(43*var(--u))] lg:leading-[0.985]" />
              <div className="mt-6 space-y-4 lg:mt-[calc(31*var(--u))] lg:space-y-[calc(24*var(--u))]">
                {page.about.paragraphs.map((paragraph) => (
                  <RichText key={paragraph} text={paragraph} className={PARAGRAPH} />
                ))}
              </div>
              <div className="mt-8 lg:mt-[calc(44*var(--u))]">
                <CtaLink cta={page.about.cta} variant="olive" size="sm" className="lg:h-[calc(42*var(--u))] lg:w-[calc(383*var(--u))]" />
              </div>
            </div>
            <Picture
              image={page.about.image}
              className="aspect-[4/3] w-full rounded-2xl object-cover lg:mt-[calc(35*var(--u))] lg:aspect-auto lg:h-[calc(582*var(--u))] lg:w-[calc(690*var(--u))] lg:rounded-[calc(36*var(--u))]"
            />
          </div>
        </Container>
      </section>

      <section className="pb-16 lg:pb-[calc(186*var(--u))]">
        <Container>
          <SectionLabel className="text-center">{page.features.label}</SectionLabel>
          <div className="mt-10 lg:mt-[calc(73*var(--u))]">
            <FeatureCards cards={page.features.cards} variant="dark" />
          </div>
        </Container>
      </section>

      <section className="pb-16 lg:pb-[calc(31*var(--u))]">
        <Container>
          <SectionLabel className="text-center">{page.brands.label}</SectionLabel>
          <Heading text={page.brands.title} className="mx-auto mt-4 max-w-[22ch] text-center text-title text-teal lg:mt-[calc(18*var(--u))] lg:max-w-none lg:leading-[1.02]" />
          <div className="mt-10 lg:mt-[calc(78*var(--u))]">
            <PartnerBrands brands={brands} layout="carousel" />
          </div>
        </Container>
      </section>

      <section className="bg-sand py-16 lg:pt-[calc(77*var(--u))] lg:pb-[calc(44*var(--u))]">
        <Container>
          <SectionLabel>{page.categories.label}</SectionLabel>
          <Heading text={page.categories.title} className="mt-3 text-title text-teal lg:mt-[calc(18*var(--u))]" />
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:mx-auto lg:mt-[calc(68*var(--u))] lg:w-[calc(1638*var(--u))] lg:grid-cols-3 lg:justify-items-center lg:gap-0">
            {highlighted.map((category) => (
              <HighlightCard key={category.id} category={category} label="Categoria" />
            ))}
          </ul>
          <div className="mt-10 text-center lg:mt-[calc(70*var(--u))]">
            <CtaLink cta={page.categories.cta} variant="teal" size="sm" className="lg:h-[calc(42*var(--u))] lg:w-[calc(363*var(--u))]" />
          </div>
        </Container>
      </section>

      <section className="py-16 lg:pt-[calc(88*var(--u))] lg:pb-[calc(70*var(--u))]">
        <div className="container-site lg:w-full lg:pr-0 lg:pl-[calc(228*var(--u))]">
          <div className="grid items-start gap-10 lg:grid-cols-[calc(668*var(--u))_calc(697*var(--u))] lg:gap-[calc(96*var(--u))]">
            <Picture
              image={page.logistics.image}
              className="aspect-[4/3] w-full rounded-2xl object-cover lg:aspect-auto lg:h-[calc(499*var(--u))] lg:rounded-[calc(36*var(--u))]"
            />
            <div className="lg:pt-[calc(29*var(--u))]">
              <SectionLabel>{page.logistics.label}</SectionLabel>
              <Heading text={page.logistics.title} className="mt-8 text-title text-teal lg:mt-[calc(64*var(--u))] lg:text-[length:clamp(2rem,calc(75*var(--u)),9rem)]" />
              <p className={`mt-6 lg:mt-[calc(29*var(--u))] lg:max-w-[calc(668*var(--u))] ${PARAGRAPH} lg:leading-[1.3]`}>{page.logistics.text}</p>
              <div className="mt-8 lg:mt-[calc(40*var(--u))]">
                <CtaLink cta={page.logistics.cta} variant="olive" size="sm" className="lg:h-[calc(42*var(--u))] lg:w-[calc(384*var(--u))]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto w-full bg-sand px-4 py-12 sm:px-6 lg:w-[calc(1662*var(--u))] lg:px-0 lg:py-0 lg:h-[calc(710*var(--u))]">
          <div className="grid gap-10 lg:h-full lg:grid-cols-[calc(759*var(--u))_calc(702*var(--u))] lg:gap-0 lg:pl-[calc(104*var(--u))]">
            <div className="lg:pt-[calc(84*var(--u))]">
              <SectionLabel>{page.closing.label}</SectionLabel>
              <Heading text={page.closing.title} className="mt-5 text-display text-teal lg:mt-[calc(41*var(--u))] lg:leading-[1.01]" />
              <p className={`mt-4 lg:mt-[calc(10*var(--u))] lg:max-w-[calc(720*var(--u))] ${PARAGRAPH} lg:leading-[1.3]`}>{page.closing.text}</p>
              <ul className="mt-6 space-y-3 lg:mt-[calc(26*var(--u))] lg:space-y-[calc(18*var(--u))]">
                {page.closing.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-3 font-semibold text-body text-olive lg:gap-[calc(14*var(--u))]">
                    <Icon name="circleCheck" className="size-5 shrink-0 lg:size-[calc(32*var(--u))]" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-teal px-6 py-10 text-sand sm:px-10 lg:mt-[calc(94*var(--u))] lg:h-[calc(528*var(--u))] lg:rounded-[calc(32*var(--u))] lg:pr-[calc(30*var(--u))] lg:pl-[calc(84*var(--u))] lg:pt-[calc(62*var(--u))] lg:pb-0">
              <h2 className="font-sans font-bold text-olive lg:whitespace-nowrap lg:text-[length:clamp(1.5rem,calc(37*var(--u)),4rem)] lg:leading-[1.05]">
                {page.closing.card.title.split('\n').map((line, index) => (
                  <span key={line} className={index > 0 ? 'lg:block' : ''}>
                    {index > 0 ? ' ' : ''}
                    {line}
                  </span>
                ))}
              </h2>
              <p className="mt-4 text-body text-sand lg:mt-[calc(20*var(--u))] lg:max-w-[calc(580*var(--u))] lg:text-[length:clamp(1rem,calc(27*var(--u)),3rem)] lg:leading-[1.22]">
                {page.closing.card.text}
              </p>
              <div className="mt-8 flex flex-col gap-3 lg:-ml-[calc(28*var(--u))] lg:mt-[calc(28*var(--u))] lg:w-[calc(590*var(--u))] lg:gap-[calc(10*var(--u))]">
                <CtaLink cta={page.closing.card.primary} variant="olive" icon="arrow" size="lg" className="w-full lg:h-[calc(67*var(--u))]" />
                <CtaLink cta={page.closing.card.secondary} variant="outlineCream" icon="arrow" size="lg" className="w-full lg:h-[calc(67*var(--u))]" />
              </div>
              <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-sand lg:mt-[calc(46*var(--u))] lg:gap-[calc(8*var(--u))] lg:text-[length:clamp(0.75rem,calc(16*var(--u)),1.5rem)]">
                <img src={footerPin} alt="" aria-hidden="true" className="size-4 shrink-0 lg:size-[calc(18*var(--u))]" />
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
