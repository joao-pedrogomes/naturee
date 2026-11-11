import Icon from '@/components/icons/Icon'
import Container from '@/components/sections/Container'
import CtaBanner from '@/components/sections/CtaBanner'
import CtaLink from '@/components/sections/CtaLink'
import Heading from '@/components/sections/Heading'
import Picture from '@/components/sections/Picture'
import RichText from '@/components/sections/RichText'
import SectionLabel from '@/components/sections/SectionLabel'
import Seo from '@/components/seo/Seo'
import { usePage } from '@/content/siteContent'
import { cn } from '@/lib/utils'
import { pathFor } from '@/routes'
import stepArrow from '@/assets/icons/stepArrow.svg'

const AUDIENCE_TONES = ['bg-olive text-sand', 'border-2 border-olive bg-white text-olive']
const STEP_OFFSETS = ['lg:ml-0', 'lg:ml-[calc(36*var(--u))]', 'lg:ml-[calc(45*var(--u))]']

/* word-spacing mimics the artboard's justified lines, whose spaces were squeezed to fit. */
const PARAGRAPH = 'text-body text-black lg:leading-[1.3] lg:[word-spacing:-0.04em]'

function Logistics() {
  const page = usePage('logistics')

  return (
    <>
      <Seo seo={page.seo} path={pathFor('logistics')} />

      <section className="relative isolate flex min-h-[26rem] items-center overflow-hidden bg-teal text-sand lg:h-[calc(796*var(--u))] lg:items-start">
        <Picture image={page.hero.image} priority className="absolute inset-0 -z-10 h-full w-full object-cover object-right" />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-teal via-teal/70 to-transparent md:to-50% lg:hidden" aria-hidden="true" />
        <Container className="py-16 lg:py-0 lg:pt-[calc(184*var(--u))]">
          <Heading as="h1" text={page.hero.title} className="text-display text-olive lg:leading-[0.935] [&_strong]:font-semibold [&_strong]:italic" />
          <RichText text={page.hero.text} className="mt-5 text-body text-sand lg:mt-[calc(23*var(--u))] lg:leading-[1.17]" />
          <div className="mt-8 lg:mt-[calc(60*var(--u))]">
            <CtaLink cta={page.hero.cta} variant="olive" size="sm" className="lg:w-[calc(255*var(--u))]" />
          </div>
        </Container>
      </section>

      <section className="py-16 lg:pt-[calc(26*var(--u))] lg:pb-[calc(69*var(--u))]">
        <Container className="text-center">
          <SectionLabel>{page.how.label}</SectionLabel>
          <Heading text={page.how.title} className="mx-auto mt-4 max-w-[26ch] text-title text-teal lg:mt-[calc(31*var(--u))] lg:max-w-none" />
          <RichText text={page.how.text} className={`mx-auto mt-5 max-w-[66ch] ${PARAGRAPH} lg:mt-[calc(36*var(--u))] lg:max-w-none`} />
          <ol className="mt-12 grid gap-10 text-left md:grid-cols-3 md:gap-0 lg:mt-[calc(66*var(--u))] lg:grid-cols-3">
            {page.how.steps.map((step, index) => (
              <li
                key={step.title}
                className={cn('flex gap-4 md:px-[4%] md:first:pl-0 md:last:pr-0 lg:h-[calc(233*var(--u))] lg:px-0', index > 0 && 'md:border-l-2 md:border-olive')}
              >
                <img
                  src={stepArrow}
                  alt=""
                  aria-hidden="true"
                  className={cn('mt-1 w-5 shrink-0 self-start lg:mt-[calc(75*var(--u))] lg:w-[calc(33*var(--u))]', STEP_OFFSETS[index])}
                />
                <div className="lg:ml-[calc(64*var(--u))] lg:mt-0 lg:whitespace-nowrap">
                  <p className="text-label font-semibold normal-case text-olive lg:leading-none">{String(index + 1).padStart(2, '0')}</p>
                  <h3 className="mt-3 font-sans text-step font-semibold text-olive uppercase lg:mt-[calc(26*var(--u))] lg:leading-none">{step.title}</h3>
                  <RichText text={step.text} className="mt-3 text-body text-black lg:mt-[calc(36*var(--u))] lg:leading-[1.3]" />
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="relative bg-sand py-16 lg:h-[calc(827*var(--u))] lg:py-0">
        <Picture
          image={page.regions.image}
          className="mx-auto w-full max-w-md object-contain lg:absolute lg:inset-x-0 lg:top-[calc(17*var(--u))] lg:mx-0 lg:h-[calc(795*var(--u))] lg:max-w-none lg:w-full"
        />
        <Container className="relative lg:pt-[calc(213*var(--u))]">
          <div className="lg:w-[calc(700*var(--u))]">
            <SectionLabel>{page.regions.label}</SectionLabel>
            <Heading text={page.regions.title} className="mt-6 text-display text-teal lg:mt-[calc(59*var(--u))] lg:leading-[0.935]" />
            <RichText text={page.regions.text} className={`mt-6 ${PARAGRAPH} lg:mt-[calc(48*var(--u))] lg:leading-[1.31] [&_strong]:font-extrabold [&_em]:font-medium`} />
          </div>
        </Container>
      </section>

      <section className="py-16 lg:pt-[calc(68*var(--u))] lg:pb-[calc(0*var(--u))]">
        <Container className="text-center">
          <SectionLabel>{page.audience.label}</SectionLabel>
          <Heading text={page.audience.title} className="mx-auto mt-4 max-w-[26ch] text-title text-teal lg:mt-[calc(31*var(--u))] lg:max-w-none" />
          <RichText text={page.audience.text} className={`mx-auto mt-5 max-w-[56ch] ${PARAGRAPH} lg:mt-[calc(15*var(--u))] lg:max-w-none`} />
          <ul className="mt-12 grid grid-cols-2 gap-4 lg:mt-[calc(64*var(--u))] lg:grid-cols-4 lg:gap-[calc(25*var(--u))]">
            {page.audience.items.map((item, index) => (
              <li
                key={item.label}
                className={cn('flex flex-col items-center justify-center gap-4 rounded-2xl px-4 py-9 lg:h-[calc(249*var(--u))] lg:gap-[calc(18*var(--u))] lg:rounded-[calc(14*var(--u))] lg:py-0', AUDIENCE_TONES[index % AUDIENCE_TONES.length])}
              >
                <Icon name={item.icon} className="h-9 w-auto lg:h-[calc(56*var(--u))]" />
                <h3 className="font-sans text-lead font-semibold lg:text-[length:clamp(1.125rem,calc(32*var(--u)),3.5rem)]">{item.label}</h3>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16 lg:pt-[calc(97*var(--u))] lg:pb-[calc(82*var(--u))]">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[calc(819*var(--u))_1fr] lg:gap-0">
            <div className="lg:pl-[calc(4*var(--u))]">
              <SectionLabel>{page.planning.label}</SectionLabel>
              <Heading text={page.planning.title} className="mt-6 text-display text-teal lg:mt-[calc(68*var(--u))] lg:leading-[0.935]" />
              <RichText text={page.planning.text} className={`mt-6 ${PARAGRAPH} lg:mt-[calc(20*var(--u))] lg:leading-[1.31]`} />
            </div>
            <ul className="flex flex-col gap-5 lg:ml-[calc(-6*var(--u))] lg:gap-[calc(33*var(--u))] lg:pt-[calc(103*var(--u))]">
              {page.planning.boxes.map((box, index) => (
                <li key={box.title} className="flex items-start gap-5 lg:gap-[calc(32*var(--u))]">
                  <Icon name={box.icon} className="mt-4 h-8 w-auto shrink-0 lg:mt-[calc(38*var(--u))] lg:h-[calc(40*var(--u))] lg:w-[calc(36*var(--u))]" />
                  <div
                    className={cn(
                      'flex-1 rounded-2xl px-8 py-6 lg:h-[calc(152*var(--u))] lg:w-[calc(522*var(--u))] lg:flex-none lg:rounded-[calc(8*var(--u))] lg:pr-[calc(8*var(--u))] lg:pl-[calc(50*var(--u))] lg:py-0 lg:pt-[calc(36*var(--u))]',
                      index % 2 === 0 ? 'bg-teal text-sand' : 'border-2 border-teal bg-white text-teal',
                    )}
                  >
                    <h3 className={cn('font-sans text-lead font-semibold lg:leading-none', index % 2 === 0 ? 'text-olive' : 'text-olive')}>{box.title}</h3>
                    <RichText text={box.text} className="mt-1 text-small lg:mt-[calc(15*var(--u))] lg:leading-[1.2] [&_em]:font-extrabold [&_strong]:font-extrabold" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="bg-white pb-0 lg:bg-[linear-gradient(to_bottom,white_calc(274*var(--u)),var(--teal)_0)]">
        <Container>
          <CtaBanner label={page.banner.label} title={page.banner.title} text={page.banner.text} image={page.banner.image} primary={page.banner.cta} />
        </Container>
      </section>
      <div className="h-8 bg-teal lg:h-[calc(4*var(--u))]" aria-hidden="true" />
    </>
  )
}

export default Logistics
