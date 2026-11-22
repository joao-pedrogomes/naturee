import Container from '@/components/sections/Container'
import Seo from '@/components/seo/Seo'
import { usePage, useSiteContent } from '@/content/siteContent'
import { pathFor } from '@/routes'

function Privacy() {
  const page = usePage('privacy')
  const { site } = useSiteContent()
  const identification = [site.legalName, site.cnpj ? `CNPJ ${site.cnpj}` : '', site.legalAddress].filter(Boolean)

  return (
    <>
      <Seo seo={page.seo} path={pathFor('privacy')} />
      <section className="bg-sand py-14 lg:pt-[calc(80*var(--u))] lg:pb-[calc(110*var(--u))]">
        <Container>
          <article className="mx-auto max-w-[46rem] lg:max-w-[calc(900*var(--u))]">
            <h1 className="font-heading text-[clamp(2rem,calc(54.6*var(--u)),4.5rem)] leading-[1.05] text-teal">{page.title}</h1>
            <p className="mt-3 text-sm text-olive-deep">{page.updated}</p>
            <p className="mt-8 text-body text-black lg:leading-[1.45]">{page.intro}</p>
            {identification.length ? <p className="mt-4 text-sm text-olive-deep">{identification.join(' · ')}</p> : null}

            {page.sections.map((section) => (
              <section key={section.title} className="mt-10 lg:mt-[calc(52*var(--u))]">
                <h2 className="font-heading text-[clamp(1.375rem,calc(34*var(--u)),2.25rem)] leading-tight text-teal">{section.title}</h2>
                <p className="mt-3 text-body text-black lg:leading-[1.45]">{section.text}</p>
                {section.items.length ? (
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-body text-black marker:text-olive lg:leading-[1.45]">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </article>
        </Container>
      </section>
    </>
  )
}

export default Privacy
