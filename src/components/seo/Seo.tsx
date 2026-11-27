import { useSiteContent } from '@/content/siteContent'
import type { Seo as SeoContent } from '@/content/types'
import { absoluteUrl, pageTitle } from '@/lib/seo'
import { serializeForScript } from '@/lib/serializeContent'
import { organizationSchema } from '@/lib/structuredData'

type SeoProps = {
  seo: SeoContent
  path: string
  noIndex?: boolean
  /** Adds the company's schema.org data (JSON-LD); the home page carries it. */
  organization?: boolean
}

function Seo({ seo, path, noIndex = false, organization = false }: SeoProps) {
  const content = useSiteContent()
  const { site } = content
  const title = pageTitle(seo.title, site.name)
  const url = absoluteUrl(path, site.url)
  const image = absoluteUrl(site.ogImage, site.url)

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={url} />
      {noIndex ? <meta name="robots" content="noindex" /> : null}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={site.name} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={image} />
      {/* Not hoisted into <head> like the tags above; search engines read JSON-LD anywhere in the page. */}
      {organization ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeForScript(organizationSchema(content)) }} />
      ) : null}
    </>
  )
}

export default Seo
