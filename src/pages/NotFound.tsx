import Container from '@/components/sections/Container'
import CtaLink from '@/components/sections/CtaLink'
import Heading from '@/components/sections/Heading'
import Seo from '@/components/seo/Seo'
import { renderRichText } from '@/lib/richText'
import { useSiteContent } from '@/content/siteContent'

function NotFound() {
  const { notFound } = useSiteContent()

  return (
    <>
      <Seo seo={notFound.seo} path="/404" noIndex />
      <section className="bg-sand py-24">
        <Container className="text-center">
          <Heading as="h1" text={notFound.title} className="text-title text-teal" />
          <p className="mx-auto mt-4 max-w-[40ch] text-lead text-teal">{renderRichText(notFound.text)}</p>
          <div className="mt-8">
            <CtaLink cta={notFound.cta} variant="olive" size="lg" />
          </div>
        </Container>
      </section>
    </>
  )
}

export default NotFound
