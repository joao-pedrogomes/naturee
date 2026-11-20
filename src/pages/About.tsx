import Container from '@/components/sections/Container'
import CtaBanner from '@/components/sections/CtaBanner'
import FeatureCards from '@/components/sections/FeatureCards'
import Heading from '@/components/sections/Heading'
import JustifiedLines from '@/components/sections/JustifiedLines'
import Picture from '@/components/sections/Picture'
import RichText from '@/components/sections/RichText'
import SectionLabel from '@/components/sections/SectionLabel'
import Seo from '@/components/seo/Seo'
import { usePage } from '@/content/siteContent'
import { pathFor } from '@/routes'

/* word-spacing mimics the artboard's justified lines, whose spaces were squeezed to fit. */
const PARAGRAPH = 'text-body text-black lg:text-justify lg:leading-[1.27] lg:[word-spacing:-0.04em]'
/* Justified blocks are tuned at 1920x1080: a size close to the 27u standard plus a box width where the lines fill without wide word gaps. */
const INTRO_TUNING = [
  'lg:max-w-[calc(716*var(--u))] lg:text-[length:clamp(1rem,calc(26.6*var(--u)),3.5rem)]',
  'lg:max-w-[calc(710*var(--u))] lg:text-[length:clamp(1rem,calc(27.4*var(--u)),3.5rem)]',
]

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
            className="text-title text-sand lg:leading-[1.02] [&_em]:font-semibold"
          />
        </Container>
      </section>

      <section className="bg-sand py-16 lg:py-[calc(118*var(--u))]">
        <Container>
          <SectionLabel className="text-center">{page.about.label}</SectionLabel>
          <div className="mt-10 grid items-start gap-10 md:grid-cols-2 lg:mt-[calc(60*var(--u))] lg:items-center lg:grid-cols-[calc(668*var(--u))_calc(735*var(--u))] lg:justify-between lg:gap-0 lg:pl-0 lg:ml-[calc(-3*var(--u))] lg:w-[calc(1482*var(--u))]">
            <Picture
              image={page.about.image}
              className="aspect-[4/3] w-full rounded-2xl object-cover lg:aspect-auto lg:h-[calc(534*var(--u))] lg:rounded-[calc(36*var(--u))]"
            />
            <div className="lg:w-[calc(735*var(--u))]">
              <Heading text={page.about.title} className="text-title leading-[1.02] text-teal lg:leading-[0.985]" />
              <div className="mt-6 space-y-4 lg:mt-[calc(41*var(--u))] lg:space-y-[calc(18*var(--u))]">
                {page.about.paragraphs.map((paragraph, index) => (
                  <RichText key={paragraph} text={paragraph} className={`${PARAGRAPH} ${INTRO_TUNING[index % INTRO_TUNING.length]}`} />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-[calc(118*var(--u))]">
        <Container className="text-center lg:flex lg:flex-col lg:items-center">
          <SectionLabel>{page.history.label}</SectionLabel>
          <Heading text={page.history.title} className="mt-4 text-title text-teal lg:mt-[calc(37*var(--u))]" />
          <div className="mx-auto mt-8 max-w-[62ch] space-y-5 lg:mt-[calc(52*var(--u))] lg:max-w-none lg:w-[calc(1150*var(--u))] lg:translate-x-[calc(6*var(--u))] lg:space-y-[calc(44*var(--u))]">
            {page.history.paragraphs.map((paragraph) => (
              <JustifiedLines key={paragraph} text={paragraph} lastLine="center" className={`${PARAGRAPH} lg:text-[length:clamp(1rem,calc(25.6*var(--u)),3.5rem)]`} />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-sand pt-16 max-sm:pt-[58px] lg:pt-[calc(88*var(--u))]">
        <Container>
          <div className="grid items-start gap-10 md:grid-cols-2 lg:grid-cols-[calc(669*var(--u))_calc(713*var(--u))] lg:gap-[calc(95*var(--u))]">
            <Picture
              image={page.purpose.image}
              className="aspect-[4/3] w-full rounded-2xl object-cover max-sm:order-2 lg:aspect-auto lg:h-[calc(499*var(--u))] lg:rounded-[calc(36*var(--u))]"
            />
            {/* The column is as wide as the title's longest line (w-fit); the paragraph (w-0 + min-w-full) takes that width, so the text ends where the title ends. */}
            <div className="max-sm:contents lg:w-fit lg:pt-[calc(24*var(--u))]">
              <SectionLabel className="max-sm:order-1 max-sm:-mb-2">{page.purpose.label}</SectionLabel>
              {/* Phones: only the label goes above the photo; this wrapper keeps the title and text together below it. It has no box from sm up. */}
              <div className="contents max-sm:order-3 max-sm:-mt-4 max-sm:block">
                <Heading text={page.purpose.title} className="mt-8 text-title text-teal max-sm:mt-0 lg:mt-[calc(70*var(--u))] lg:leading-[0.935]" />
                {/* Four hand-broken lines at 24u: with the title's width as the box, these breaks give the most even word spacing. */}
                <JustifiedLines handBroken text={page.purpose.text} className={`mt-6 lg:mt-[calc(28*var(--u))] lg:w-0 lg:min-w-full ${PARAGRAPH} lg:text-[length:clamp(0.8rem,calc(24*var(--u)),3.5rem)] lg:leading-[1.3] [&_em]:font-bold`} />
              </div>
            </div>
          </div>
          <div className="mt-16 lg:mt-[calc(153*var(--u))]">
            <FeatureCards cards={page.features} variant="light" />
          </div>
        </Container>
      </section>

      <section className="bg-sand pb-16 pt-16 lg:bg-[linear-gradient(to_bottom,var(--sand)_calc(391*var(--u)),white_0)] lg:pt-[calc(153*var(--u))] lg:pb-[calc(37*var(--u))]">
        <Container>
          <CtaBanner label={page.banner.label} title={page.banner.title} primary={page.banner.primary} secondary={page.banner.secondary} />
        </Container>
      </section>
    </>
  )
}

export default About
