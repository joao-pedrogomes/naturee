import ContactForm from '@/components/contact/ContactForm'
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
          <div className="grid gap-6 lg:grid-cols-[calc(659*var(--u))_1fr] lg:gap-0">
            <SectionLabel className="text-olive lg:ml-[calc(20*var(--u))]">{page.hero.label}</SectionLabel>
            <div className="lg:-mt-[calc(4*var(--u))]">
              <Heading as="h1" text={page.hero.title} className="text-display text-olive lg:leading-[0.935]" />
              <RichText
                text={page.hero.text}
                className="mt-5 max-w-[52ch] text-body text-sand lg:mt-[calc(21*var(--u))] lg:max-w-none lg:leading-[1.17]"
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-16 lg:pb-[calc(51*var(--u))]">
        <Container className="-mt-32 lg:-mt-[calc(189*var(--u))]">
          <div className="rounded-3xl bg-olive px-5 py-10 sm:px-10 lg:h-[calc(1171*var(--u))] lg:rounded-[calc(36*var(--u))] lg:py-0 lg:pt-[calc(74*var(--u))] lg:pr-[calc(194*var(--u))] lg:pl-[calc(194*var(--u))]">
            <ContactForm />
          </div>
        </Container>
      </section>
    </>
  )
}

export default Contact
