import ContactForm from '@/components/contact/ContactForm'
import Container from '@/components/sections/Container'
import Heading from '@/components/sections/Heading'
import SectionLabel from '@/components/sections/SectionLabel'
import Seo from '@/components/seo/Seo'
import { usePage } from '@/content/siteContent'
import { pathFor } from '@/routes'

function Contact() {
  const page = usePage('contact')

  return (
    <>
      <Seo seo={page.seo} path={pathFor('contact')} />

      <section className="bg-teal pt-6 pb-40 text-sand lg:pt-[2vw] lg:pb-[12vw]">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[45%_1fr]">
            <SectionLabel tone="olive" className="text-olive-light">{page.hero.label}</SectionLabel>
            <div>
              <Heading as="h1" text={page.hero.title} className="text-title text-olive-light" />
              <p className="mt-5 max-w-[52ch] text-body text-white">{page.hero.text}</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-16 lg:pb-[4vw]">
        <Container className="-mt-32 lg:-mt-[10vw]">
          <div className="rounded-2xl bg-olive px-5 py-10 sm:px-10 lg:px-[13%] lg:py-14">
            <ContactForm />
          </div>
        </Container>
      </section>
    </>
  )
}

export default Contact
