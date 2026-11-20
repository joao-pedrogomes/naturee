import ContactForm from '@/components/contact/ContactForm'
import LocationInfo from '@/components/contact/LocationInfo'
import Container from '@/components/sections/Container'
import Heading from '@/components/sections/Heading'
import RichText from '@/components/sections/RichText'
import SectionLabel from '@/components/sections/SectionLabel'
import Seo from '@/components/seo/Seo'
import { usePage } from '@/content/siteContent'
import { pathFor } from '@/routes'

function Contact() {
  const page = usePage('contact')

  return (
    <>
      <Seo seo={page.seo} path={pathFor('contact')} />

      <section className="bg-teal pt-6 pb-40 text-sand lg:h-[calc(587*var(--u))] lg:pt-[calc(46*var(--u))] lg:pb-0">
        <Container>
          {/* The title column starts at 1180u (362u container offset + 818u), the same start as the Marcas e Produtos hero title. */}
          <div className="grid gap-6 lg:grid-cols-[calc(818*var(--u))_1fr] lg:gap-0">
            <SectionLabel className="text-olive">{page.hero.label}</SectionLabel>
            {/* On desktop the box is as wide as the title's longest line; the paragraph (w-0 + min-w-full) is sized by it, not the other way round.
                The paragraph size is 0.435 x the title's (27 / 62.1, bounds too), so its justified lines stay almost gap-free at any width. */}
            <div className="lg:-mt-[calc(4*var(--u))] lg:w-fit">
              <Heading as="h1" text={page.hero.title} className="text-title leading-[0.94] text-olive lg:leading-[0.935]" />
              <RichText
                text={page.hero.text}
                className="mt-5 max-w-[52ch] text-body text-sand lg:mt-[calc(21*var(--u))] lg:w-0 lg:min-w-full lg:max-w-none lg:text-[length:clamp(0.87rem,calc(27*var(--u)),3.48rem)] lg:text-justify lg:leading-[1.17] lg:[&_br]:hidden"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* 60 / 40 columns on the header's grid, one uniform gap (60u) between them, below the teal band and above the footer. */}
      <section className="pb-16 lg:pb-[calc(60*var(--u))]">
        <Container className="-mt-32 lg:-mt-[calc(189*var(--u))]">
          <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:gap-x-[calc(60*var(--u))]">
            <div className="rounded-3xl bg-olive px-5 py-10 sm:px-10 lg:rounded-[calc(36*var(--u))] lg:px-[calc(70*var(--u))] lg:pt-[calc(70*var(--u))] lg:pb-[calc(56*var(--u))]">
              <ContactForm />
            </div>
            {/* The teal band ends 189u below the top of this grid; the info starts one gap under it. */}
            <div className="lg:pt-[calc((189+60)*var(--u))]">
              <LocationInfo page={page} />
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

export default Contact
