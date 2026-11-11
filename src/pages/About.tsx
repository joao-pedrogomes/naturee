import Container from '@/components/sections/Container'
import CtaBanner from '@/components/sections/CtaBanner'
import FeatureCards from '@/components/sections/FeatureCards'
import Heading from '@/components/sections/Heading'
import Picture from '@/components/sections/Picture'
import RichText from '@/components/sections/RichText'
import SectionLabel from '@/components/sections/SectionLabel'
import Seo from '@/components/seo/Seo'
import { usePage } from '@/content/siteContent'
import { pathFor } from '@/routes'

/* word-spacing mimics the artboard's justified lines, whose spaces were squeezed to fit. */
const PARAGRAPH = 'text-body text-black lg:text-justify lg:leading-[1.27] lg:[word-spacing:-0.04em]'

function About() {
  const page = usePage('about')

  return (
    <>
      <Seo seo={page.seo} path={pathFor('about')} />

      <section className="relative isolate flex min-h-[22rem] items-center justify-center overflow-hidden bg-teal lg:h-[calc(796*var(--u))]">
        <Picture image={page.hero.image} priority className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-teal/40 lg:hidden" aria-hidden="true" />
        <Container className="py-20 text-center lg:-translate-y-[calc(24*var(--u))] lg:py-0">
          <Heading
            as="h1"
            text={page.hero.title}
            className="text-heading text-sand lg:leading-[1.02] [&_em]:font-semibold"
          />
        </Container>
      </section>

      <section className="bg-sand py-16 lg:pt-[calc(59*var(--u))] lg:pb-[calc(44*var(--u))]">
        <Container>
          <SectionLabel className="text-center">{page.about.label}</SectionLabel>
          <div className="mt-10 grid items-start gap-10 md:grid-cols-2 lg:mt-[calc(60*var(--u))] lg:grid-cols-[calc(668*var(--u))_calc(735*var(--u))] lg:justify-between lg:gap-0 lg:pl-0 lg:ml-[calc(-3*var(--u))] lg:w-[calc(1482*var(--u))]">
            <Picture
              image={page.about.image}
              className="aspect-[4/3] w-full rounded-2xl object-cover lg:aspect-auto lg:h-[calc(534*var(--u))] lg:rounded-[calc(36*var(--u))]"
            />
            <div className="lg:-mt-[calc(8*var(--u))] lg:w-[calc(735*var(--u))]">
              <Heading text={page.about.title} className="text-display text-teal lg:leading-[0.935]" />
              <div className="mt-6 space-y-4 lg:mt-[calc(41*var(--u))] lg:space-y-[calc(39*var(--u))]">
                {page.about.paragraphs.map((paragraph) => (
                  <RichText key={paragraph} text={paragraph} className={PARAGRAPH} />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 lg:pt-[calc(56*var(--u))] lg:pb-[calc(66*var(--u))]">
        <Container className="text-center lg:flex lg:flex-col lg:items-center">
          <SectionLabel>{page.history.label}</SectionLabel>
          <Heading text={page.history.title} className="mt-4 text-title text-teal lg:mt-[calc(37*var(--u))]" />
          <div className="mx-auto mt-8 max-w-[62ch] space-y-5 lg:mt-[calc(52*var(--u))] lg:max-w-none lg:w-[calc(1160*var(--u))] lg:space-y-[calc(44*var(--u))]">
            {page.history.paragraphs.map((paragraph) => (
              <p key={paragraph} className={`${PARAGRAPH} lg:[text-align-last:center]`}>
                {paragraph}
              </p>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-sand pt-16 lg:pt-[calc(88*var(--u))]">
        <Container>
          <div className="grid items-start gap-10 md:grid-cols-2 lg:grid-cols-[calc(669*var(--u))_calc(713*var(--u))] lg:gap-[calc(95*var(--u))]">
            <Picture
              image={page.purpose.image}
              className="aspect-[4/3] w-full rounded-2xl object-cover lg:aspect-auto lg:h-[calc(499*var(--u))] lg:rounded-[calc(36*var(--u))]"
            />
            <div className="lg:w-[calc(713*var(--u))] lg:pt-[calc(24*var(--u))]">
              <SectionLabel>{page.purpose.label}</SectionLabel>
              <Heading text={page.purpose.title} className="mt-8 text-display text-teal lg:mt-[calc(70*var(--u))] lg:leading-[0.935]" />
              <RichText text={page.purpose.text} className={`mt-6 lg:mt-[calc(28*var(--u))] ${PARAGRAPH} lg:leading-[1.3] [&_em]:font-bold`} />
            </div>
          </div>
          <div className="mt-16 lg:mt-[calc(153*var(--u))]">
            <FeatureCards cards={page.features} variant="light" />
          </div>
        </Container>
      </section>

      <section className="bg-sand pb-16 pt-16 lg:bg-[linear-gradient(to_bottom,var(--sand)_calc(238*var(--u)),white_0)] lg:pt-[calc(63*var(--u))] lg:pb-[calc(37*var(--u))]">
        <Container>
          <CtaBanner label={page.banner.label} title={page.banner.title} primary={page.banner.primary} secondary={page.banner.secondary} />
        </Container>
      </section>
    </>
  )
}

export default About
