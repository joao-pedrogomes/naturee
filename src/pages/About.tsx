import Container from '@/components/sections/Container'
import CtaBanner from '@/components/sections/CtaBanner'
import FeatureCards from '@/components/sections/FeatureCards'
import Heading from '@/components/sections/Heading'
import MediaText from '@/components/sections/MediaText'
import Picture from '@/components/sections/Picture'
import RichText from '@/components/sections/RichText'
import SectionLabel from '@/components/sections/SectionLabel'
import Seo from '@/components/seo/Seo'
import { usePage } from '@/content/siteContent'
import { pathFor } from '@/routes'

function About() {
  const page = usePage('about')

  return (
    <>
      <Seo seo={page.seo} path={pathFor('about')} />

      <section className="relative isolate flex min-h-[22rem] items-center justify-center overflow-hidden bg-teal lg:min-h-[41vw] lg:max-h-[36rem]">
        <Picture image={page.hero.image} priority className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-teal/55" aria-hidden="true" />
        <Container className="py-20 text-center">
          <Heading as="h1" text={page.hero.title} className="mx-auto max-w-[18ch] text-subtitle text-sand lg:text-[2.6vw] lg:leading-tight [&_em]:text-olive-light" />
        </Container>
      </section>

      <section className="bg-sand py-16 lg:py-[4.5vw]">
        <Container>
          <SectionLabel className="text-center">{page.about.label}</SectionLabel>
          <div className="mt-10">
            <MediaText image={page.about.image} side="left" imageClassName="aspect-[1.1]">
              <Heading text={page.about.title} className="text-title text-teal" />
              <div className="mt-6 space-y-4 text-body text-teal">
                {page.about.paragraphs.map((paragraph) => (
                  <RichText key={paragraph} text={paragraph} />
                ))}
              </div>
            </MediaText>
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-[3.5vw]">
        <Container className="text-center">
          <SectionLabel>{page.history.label}</SectionLabel>
          <Heading text={page.history.title} className="mt-4 text-title text-teal" />
          <div className="mx-auto mt-8 max-w-[62ch] space-y-5 text-body text-teal">
            {page.history.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-sand py-16 lg:py-[4.5vw]">
        <Container>
          <MediaText image={page.purpose.image} side="left" imageClassName="aspect-[1.35]">
            <SectionLabel>{page.purpose.label}</SectionLabel>
            <Heading text={page.purpose.title} className="mt-8 text-title text-teal" />
            <RichText text={page.purpose.text} className="mt-6 text-body text-teal [&_em]:font-bold" />
          </MediaText>
          <div className="mt-16 lg:mt-[5vw]">
            <FeatureCards cards={page.features} variant="light" />
          </div>
        </Container>
      </section>

      <section className="pb-16 lg:pb-[2vw]">
        <Container className="lg:-mt-[3vw]">
          <CtaBanner
            label={page.banner.label}
            title={page.banner.title}
            primary={page.banner.primary}
            secondary={page.banner.secondary}
          />
        </Container>
      </section>
    </>
  )
}

export default About
