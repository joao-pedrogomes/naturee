import { ArrowUpRight } from 'lucide-react'
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

const AUDIENCE_TONES = ['bg-olive text-sand', 'border border-olive bg-white text-olive-deep']

function Logistics() {
  const page = usePage('logistics')

  return (
    <>
      <Seo seo={page.seo} path={pathFor('logistics')} />

      <section className="relative isolate flex min-h-[26rem] items-center overflow-hidden bg-teal text-sand lg:min-h-[41vw] lg:max-h-[36rem]">
        <Picture image={page.hero.image} priority className="absolute inset-0 -z-10 h-full w-full object-cover object-right" />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-teal via-teal/70 to-transparent md:to-50%" aria-hidden="true" />
        <Container className="py-16">
          <div className="max-w-[24rem] lg:max-w-[28vw]">
            <Heading as="h1" text={page.hero.title} className="text-display text-olive-light [&_em]:text-olive-light" />
            <p className="mt-5 text-lead text-white">{page.hero.text}</p>
            <div className="mt-8">
              <CtaLink cta={page.hero.cta} variant="olive" size="sm" className="min-w-[10.5rem]" />
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-[3.5vw]">
        <Container className="text-center">
          <SectionLabel>{page.how.label}</SectionLabel>
          <Heading text={page.how.title} className="mx-auto mt-4 max-w-[26ch] text-title text-teal" />
          <p className="mx-auto mt-5 max-w-[66ch] text-body text-teal">{page.how.text}</p>
          <ol className="mt-12 grid gap-10 text-left md:grid-cols-3 md:gap-0 md:divide-x md:divide-olive-light">
            {page.how.steps.map((step, index) => (
              <li key={step.title} className="flex gap-4 md:px-[4%] md:first:pl-0 md:last:pr-0">
                <ArrowUpRight aria-hidden="true" className="mt-1 size-5 shrink-0 text-olive" strokeWidth={1.25} />
                <div>
                  <p className="text-body font-semibold text-olive-deep">{String(index + 1).padStart(2, '0')}</p>
                  <h3 className="mt-3 font-sans text-subtitle font-bold tracking-wide text-olive-deep uppercase">{step.title}</h3>
                  <p className="mt-3 text-body text-teal">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-sand py-16 lg:py-[2vw]">
        <Container>
          <div className="grid items-center gap-10 md:grid-cols-[40%_1fr] lg:gap-[2vw]">
            <div>
              <SectionLabel>{page.regions.label}</SectionLabel>
              <Heading text={page.regions.title} className="mt-6 text-title text-teal" />
              <RichText text={page.regions.text} className="mt-6 text-body text-teal [&_em]:font-semibold" />
            </div>
            <Picture image={page.regions.image} className="w-full object-contain" />
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-[4vw]">
        <Container className="text-center">
          <SectionLabel>{page.audience.label}</SectionLabel>
          <Heading text={page.audience.title} className="mx-auto mt-4 max-w-[26ch] text-title text-teal" />
          <p className="mx-auto mt-5 max-w-[56ch] text-body text-teal">{page.audience.text}</p>
          <ul className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-[1.2vw]">
            {page.audience.items.map((item, index) => (
              <li
                key={item.label}
                className={cn('flex flex-col items-center gap-4 rounded-xl px-4 py-9 lg:py-[3vw]', AUDIENCE_TONES[index % AUDIENCE_TONES.length])}
              >
                <Icon name={item.icon} className="size-8" />
                <h3 className="font-sans text-lead font-bold">{item.label}</h3>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="pb-16 lg:pb-[2vw]">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[45%_1fr] lg:gap-[8vw]">
            <div>
              <SectionLabel>{page.planning.label}</SectionLabel>
              <Heading text={page.planning.title} className="mt-6 text-title text-teal" />
              <p className="mt-6 text-body text-teal">{page.planning.text}</p>
            </div>
            <ul className="flex flex-col justify-center gap-5">
              {page.planning.boxes.map((box, index) => (
                <li key={box.title} className="flex items-start gap-5">
                  <Icon name={box.icon} className="mt-4 size-7 shrink-0 text-olive-deep" />
                  <div
                    className={cn(
                      'flex-1 rounded-xl px-8 py-6',
                      index % 2 === 0 ? 'bg-teal text-sand' : 'border border-teal bg-white text-teal',
                    )}
                  >
                    <h3 className={cn('font-sans text-subtitle font-bold', index % 2 === 0 ? 'text-olive-light' : 'text-olive-deep')}>
                      {box.title}
                    </h3>
                    <RichText text={box.text} className="mt-1 text-body [&_em]:font-bold" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="pb-0">
        <Container className="relative top-10">
          <CtaBanner
            label={page.banner.label}
            title={page.banner.title}
            text={page.banner.text}
            image={page.banner.image}
            primary={page.banner.cta}
            align="left"
          />
        </Container>
      </section>
      <div className="h-10 bg-teal" aria-hidden="true" />
    </>
  )
}

export default Logistics
