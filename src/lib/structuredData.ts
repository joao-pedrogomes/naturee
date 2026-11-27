import logo from '@/assets/logos/natureeSeal.svg'
import type { SiteContent } from '@/content/types'
import { absoluteUrl } from '@/lib/seo'
import { normalizePhone } from '@/lib/whatsapp'

type PostalAddress = {
  '@type': 'PostalAddress'
  streetAddress: string
  addressLocality?: string
  addressRegion?: string
  postalCode?: string
  addressCountry: 'BR'
}

/** "Street, number, district, City/UF, CEP 00000-000", the shape the admin's legal address field uses. */
const ADDRESS_PATTERN = /^(.+),\s*([^,]+?)\s*\/\s*([A-Za-z]{2})\s*,\s*CEP:?\s*([\d.-]+)\s*$/

/** Splits the legal address for search engines; anything that does not fit stays whole in streetAddress. */
export function postalAddress(text: string): PostalAddress | undefined {
  const value = text.trim()
  if (!value) return undefined
  const match = ADDRESS_PATTERN.exec(value)
  if (!match) return { '@type': 'PostalAddress', streetAddress: value, addressCountry: 'BR' }
  const [, street, locality, region, postalCode] = match
  return {
    '@type': 'PostalAddress',
    streetAddress: street.trim(),
    addressLocality: locality.trim(),
    addressRegion: region.toUpperCase(),
    postalCode,
    addressCountry: 'BR',
  }
}

/** schema.org graph describing the company, built from the admin-editable site data. Blank fields are left out. */
export function organizationSchema(content: SiteContent): Record<string, unknown> {
  const { site } = content
  const home = absoluteUrl('/', site.url)
  const organizationId = `${home}#organization`
  const business = {
    '@type': 'LocalBusiness',
    '@id': organizationId,
    name: site.name,
    legalName: site.legalName || undefined,
    description: content.pages.home.seo.description || undefined,
    url: home,
    logo: absoluteUrl(logo, site.url),
    image: absoluteUrl(site.ogImage, site.url),
    telephone: site.whatsapp ? `+${normalizePhone(site.whatsapp)}` : undefined,
    email: site.email || undefined,
    taxID: site.cnpj || undefined,
    address: postalAddress(site.legalAddress),
    areaServed: { '@type': 'State', name: 'Santa Catarina' },
    sameAs: site.instagramUrl ? [site.instagramUrl] : undefined,
  }
  const website = { '@type': 'WebSite', '@id': `${home}#website`, url: home, name: site.name, inLanguage: 'pt-BR', publisher: { '@id': organizationId } }
  return { '@context': 'https://schema.org', '@graph': [business, website] }
}
