import { Fragment } from 'react'
import Icon from '@/components/icons/Icon'
import Container from '@/components/sections/Container'
import CtaBanner from '@/components/sections/CtaBanner'
import CtaLink from '@/components/sections/CtaLink'
import Heading from '@/components/sections/Heading'
import JustifiedLines from '@/components/sections/JustifiedLines'
import Picture from '@/components/sections/Picture'
import RichText from '@/components/sections/RichText'
import SectionLabel from '@/components/sections/SectionLabel'
import Seo from '@/components/seo/Seo'
import { usePage } from '@/content/siteContent'
import { cn } from '@/lib/utils'
import { holdLine } from '@/lib/layout'
import { pathFor } from '@/routes'
import stepArrow from '@/assets/icons/stepArrow.svg'

const AUDIENCE_TONES = ['bg-olive text-sand', 'border-2 border-olive bg-white text-olive']

/* word-spacing mimics the artboard's justified lines, whose spaces were squeezed to fit. */
const PARAGRAPH = 'text-body text-black lg:leading-[1.3] lg:[word-spacing:-0.04em]'

function Logistics() {
  const page = usePage('logistics')

  return (
    <>
      <Seo seo={page.seo} path={pathFor('logistics')} />

      <section className="relative isolate flex min-h-[26rem] items-center overflow-hidden bg-teal text-sand lg:h-[calc(796*var(--u))] lg:items-start">
        <Picture image={page.hero.image} priority className="absolute inset-0 -z-10 h-full w-full object-cover object-right" />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-teal via-teal/70 to-transparent md:to-50% sm:max-lg:hidden" aria-hidden="true" />
        <Container className="py-16 lg:py-0 lg:pt-[calc(184*var(--u))]">
          <Heading as="h1" text={page.hero.title} className="text-display text-olive max-sm:brightness-[2.5] lg:leading-[0.935] [&_strong]:font-semibold [&_strong]:italic" />
          <RichText text={page.hero.text} className="mt-5 text-body text-sand md:max-w-[26rem] lg:max-w-none lg:mt-[calc(23*var(--u))] lg:leading-[1.17]" />
          <div className="mt-8 lg:mt-[calc(60*var(--u))]">
            <CtaLink cta={page.hero.cta} variant="olive" size="sm" className="max-sm:w-[210px] lg:w-[calc(255*var(--u))]" />
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-[calc(118*var(--u))]">
        <Container className="text-center">
          <SectionLabel>{page.how.label}</SectionLabel>
          <Heading text={page.how.title} className="mx-auto mt-4 max-w-[26ch] text-title text-teal lg:mt-[calc(31*var(--u))] lg:max-w-none" />
          <RichText text={page.how.text} className={`mx-auto mt-5 max-w-[66ch] ${PARAGRAPH} lg:mt-[calc(36*var(--u))] lg:max-w-none`} />
          <ol className="mt-12 grid gap-10 text-left md:grid-cols-3 md:gap-0 lg:mt-[calc(66*var(--u))] lg:grid-cols-3">
            {page.how.steps.map((step, index) => (
              <Fragment key={step.title}>
                {/* Phones only: a 210px olive divider between the steps; equal 10px above and below it, on top of the list gap. */}
                {index > 0 ? (
                  <li aria-hidden="true" className="hidden max-sm:block">
                    <hr className="mx-auto my-[10px] h-px w-[210px] border-0 bg-olive" />
                  </li>
                ) : null}
                <li
                  className={cn(
                    'grid content-start md:px-4 lg:h-[calc(233*var(--u))] lg:px-0',
                    index > 0 && 'md:border-l-2 md:border-olive',
                    holdLine(`${step.title} ${step.text}`, 70),
                  )}
                >
                  {/* The group is as wide as its widest line and centred between the dividers; the text inside stays left-aligned. */}
                  <div className="md:mx-auto md:w-fit">
                    {/* The arrow sits with the number, on the same left edge as the title and text below. */}
                    <div className="mb-3 flex items-center gap-3 max-sm:justify-center lg:mb-[calc(26*var(--u))] lg:gap-[calc(20*var(--u))]">
                      <img src={stepArrow} alt="" aria-hidden="true" className="w-5 shrink-0 lg:w-[calc(33*var(--u))]" />
                      <p className="text-label font-semibold normal-case text-olive lg:leading-none">{String(index + 1).padStart(2, '0')}</p>
                    </div>
                    <h3 className="font-sans text-step font-semibold text-olive uppercase lg:leading-none">{step.title}</h3>
                    <RichText text={step.text} className="mt-3 text-body text-black md:whitespace-nowrap md:[&_br:not(.sm\:hidden)]:inline lg:mt-[calc(36*var(--u))] lg:leading-[1.3]" />
                  </div>
                </li>
              </Fragment>
            ))}
          </ol>
        </Container>
      </section>

      <section className="relative bg-sand py-16 max-sm:pt-[44px] lg:h-[calc(867*var(--u))] lg:py-0">
        <Picture
          image={page.regions.image}
          className="mx-auto w-full max-w-md object-contain max-sm:aspect-[1.33] max-sm:w-[calc(100%-2rem)] max-sm:object-cover max-sm:object-[87%_center] sm:absolute sm:top-1/2 sm:right-0 sm:mx-0 sm:w-[72%] sm:max-w-none sm:-translate-y-1/2 lg:inset-x-0 lg:top-[calc(17*var(--u))] lg:h-[calc(795*var(--u))] lg:translate-y-0 lg:w-full"
        />
        <Container className="relative lg:pt-[calc(213*var(--u))]">
          <div className="sm:w-[60%] lg:w-[calc(700*var(--u))]">
            <SectionLabel>{page.regions.label}</SectionLabel>
            <Heading text={page.regions.title} className="mt-6 text-title leading-[0.94] text-teal lg:mt-[calc(59*var(--u))] lg:leading-[0.935]" />
            <RichText text={page.regions.text} className={`mt-6 ${PARAGRAPH} leading-[1.28] lg:mt-[calc(48*var(--u))] lg:leading-[1.31] [&_strong]:font-extrabold [&_em]:font-medium`} />
          </div>
        </Container>
      </section>

      <section className="py-16 lg:pt-[calc(68*var(--u))] lg:pb-[calc(0*var(--u))]">
        <Container className="text-center">
          <SectionLabel>{page.audience.label}</SectionLabel>
          <Heading text={page.audience.title} className="mx-auto mt-4 max-w-[26ch] text-title text-teal lg:mt-[calc(31*var(--u))] lg:max-w-none" />
          <RichText text={page.audience.text} className={`mx-auto mt-12 max-w-[56ch] ${PARAGRAPH} lg:mt-[calc(64*var(--u))] lg:max-w-none`} />
          {/* On phones the second row is swapped (3rd and 4th cards trade places), which also gives the filled/outline tones a checkerboard. */}
          <ul className="mt-12 grid grid-cols-2 gap-4 lg:mt-[calc(64*var(--u))] lg:grid-cols-4 lg:gap-[calc(25*var(--u))]">
            {page.audience.items.map((item, index) => (
              <li
                key={item.label}
                className={cn('flex flex-col items-center justify-center gap-4 rounded-2xl px-4 py-9 lg:h-[calc(249*var(--u))] lg:gap-[calc(18*var(--u))] lg:rounded-[calc(14*var(--u))] lg:py-0', AUDIENCE_TONES[index % AUDIENCE_TONES.length], index === 2 && 'max-lg:order-4', index === 3 && 'max-lg:order-3')}
              >
                <Icon name={item.icon} className="h-9 w-auto lg:h-[calc(56*var(--u))]" />
                <h3 className="font-sans text-lead font-semibold lg:text-[length:clamp(1.125rem,calc(32*var(--u)),3.5rem)]">{item.label}</h3>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16 max-sm:pt-0 lg:py-[calc(97*var(--u))]">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[calc(819*var(--u))_1fr] lg:gap-0">
            <div className="lg:flex lg:flex-col lg:pl-[calc(4*var(--u))]">
              <SectionLabel>{page.planning.label}</SectionLabel>
              <Heading text={page.planning.title} className="mt-6 text-title leading-[0.94] text-teal lg:mt-[calc(68*var(--u))] lg:leading-[0.935]" />
              <JustifiedLines text={page.planning.text} className={`mt-6 ${PARAGRAPH} leading-[1.28] lg:mt-auto lg:w-[calc(610*var(--u))] lg:pt-[calc(20*var(--u))] lg:leading-[1.31]`} />
            </div>
            <ul className="flex flex-col gap-5 lg:ml-[calc(-6*var(--u))] lg:gap-[calc(33*var(--u))] lg:pt-[calc(103*var(--u))]">
              {page.planning.boxes.map((box, index) => (
                <li key={box.title} className="flex items-start gap-5 lg:gap-[calc(32*var(--u))]">
                  <Icon name={box.icon} className="mt-4 h-8 w-auto shrink-0 lg:mt-[calc(38*var(--u))] lg:h-[calc(40*var(--u))] lg:w-[calc(36*var(--u))]" />
                  <div
                    className={cn(
                      'flex flex-1 flex-col justify-center rounded-2xl px-8 py-6 lg:h-[calc(152*var(--u))] lg:w-[calc(522*var(--u))] lg:flex-none lg:rounded-[calc(8*var(--u))] lg:pr-[calc(8*var(--u))] lg:pl-[calc(50*var(--u))] lg:py-0',
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

      <section className="bg-white pb-0 max-lg:bg-[linear-gradient(to_bottom,white_calc(100%-36px),var(--teal)_0)] lg:bg-[linear-gradient(to_bottom,white_calc(274*var(--u)),var(--teal)_0)]">
        <Container>
          <div className="max-lg:translate-y-5">
            <CtaBanner label={page.banner.label} title={page.banner.title} text={page.banner.text} image={page.banner.image} primary={page.banner.cta} />
          </div>
        </Container>
      </section>
      <div className="h-8 bg-teal max-lg:-mt-px max-lg:h-[calc(2rem+1px)] lg:h-[calc(4*var(--u))]" aria-hidden="true" />
    </>
  )
}

export default Logistics
