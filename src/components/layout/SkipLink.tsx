import { useSiteContent } from '@/content/siteContent'

export const MAIN_CONTENT_ID = 'conteudo'

function SkipLink() {
  const { footer } = useSiteContent()

  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-sand focus:px-5 focus:py-3 focus:text-teal focus:outline-2 focus:outline-olive"
    >
      {footer.skipLink}
    </a>
  )
}

export default SkipLink
