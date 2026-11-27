import { describe, expect, it } from 'vitest'
import { defaultContent } from '@/content/defaultContent'
import { organizationSchema, postalAddress } from '@/lib/structuredData'

describe('postalAddress', () => {
  it('splits the legal address into its parts', () => {
    expect(postalAddress('Rua Manoel Loureiro, 1112, Barreiros, São José/SC, CEP 88117-330')).toEqual({
      '@type': 'PostalAddress',
      streetAddress: 'Rua Manoel Loureiro, 1112, Barreiros',
      addressLocality: 'São José',
      addressRegion: 'SC',
      postalCode: '88117-330',
      addressCountry: 'BR',
    })
  })

  it('keeps an address in another shape whole', () => {
    expect(postalAddress('Rodovia SC-401, km 5 - Florianópolis')).toEqual({
      '@type': 'PostalAddress',
      streetAddress: 'Rodovia SC-401, km 5 - Florianópolis',
      addressCountry: 'BR',
    })
  })

  it('omits a blank address', () => {
    expect(postalAddress('  ')).toBeUndefined()
  })
})

describe('organizationSchema', () => {
  it('describes the company from the site data', () => {
    const [business, website] = organizationSchema(defaultContent)['@graph'] as Record<string, unknown>[]
    expect(business).toMatchObject({
      '@type': 'LocalBusiness',
      '@id': 'https://natureefoodhub.com.br/#organization',
      name: 'Naturee Food Hub',
      url: 'https://natureefoodhub.com.br/',
      telephone: '+5548991963383',
      email: defaultContent.site.email,
      taxID: defaultContent.site.cnpj,
      sameAs: [defaultContent.site.instagramUrl],
    })
    expect(business.logo).toMatch(/^https:\/\/natureefoodhub\.com\.br\/.+\.svg$/)
    expect(website).toMatchObject({ '@type': 'WebSite', publisher: { '@id': business['@id'] } })
  })

  it('follows admin edits and drops blank fields', () => {
    const content = { ...defaultContent, site: { ...defaultContent.site, email: 'natureealimentos@gmail.com', legalName: '', cnpj: '' } }
    const json = JSON.parse(JSON.stringify(organizationSchema(content)))
    const [business] = json['@graph']
    expect(business.email).toBe('natureealimentos@gmail.com')
    expect(business).not.toHaveProperty('legalName')
    expect(business).not.toHaveProperty('taxID')
  })
})
