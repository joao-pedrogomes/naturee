export type Image = {
  src: string
  alt: string
  width: number
  height: number
  srcSet?: string
  sizes?: string
}

export type Link = {
  id: string
  label: string
  href: string
  enabled: boolean
}

/**
 * `href` accepts a route path, an absolute URL, or one of the sentinels
 * `#whatsapp` (resolved against site.whatsapp) and `#catalog`
 * (resolved against site.catalogPdfUrl).
 */
export type Cta = {
  label: string
  href: string
  message?: string
}

export type IconName =
  | 'snowflake'
  | 'truck'
  | 'zap'
  | 'shieldCheck'
  | 'package'
  | 'trustRoute'
  | 'trustCheck'
  | 'star'
  | 'circleCheck'
  | 'mapPin'
  | 'calendar'
  | 'clock'
  | 'utensils'
  | 'building'
  | 'store'
  | 'basket'

export type Seo = {
  title: string
  description: string
}

export type SiteInfo = {
  name: string
  tagline: string
  whatsapp: string
  whatsappLabel: string
  whatsappCta: string
  email: string
  instagram: string
  instagramUrl: string
  regionLine: string
  catalogPdfUrl: string
  url: string
  ogImage: string
}

export type TrustItem = {
  icon: IconName
  title: string
  text: string
}

export type Brand = {
  id: string
  name: string
  logo: Image
}

export type Category = {
  id: string
  name: string
  blurb: string
  image: Image
}

export type FeatureCard = {
  title: string
  text: string
  image: Image
}

export type LabeledSection = {
  label: string
  title: string
}

export type HomePage = {
  enabled: boolean
  seo: Seo
  hero: {
    title: string
    text: string
    image: Image
    primary: Cta
    secondary: Cta
  }
  ticker: { icon: IconName; label: string }[]
  about: LabeledSection & { paragraphs: string[]; image: Image; cta: Cta }
  features: { label: string; cards: FeatureCard[] }
  brands: LabeledSection
  categories: LabeledSection & { ids: string[]; cta: Cta }
  logistics: LabeledSection & { text: string; image: Image; cta: Cta }
  closing: LabeledSection & {
    text: string
    bullets: string[]
    card: { title: string; text: string; primary: Cta; secondary: Cta; note: string }
  }
}

export type AboutPage = {
  enabled: boolean
  seo: Seo
  hero: { title: string; image: Image }
  about: LabeledSection & { paragraphs: string[]; image: Image }
  history: LabeledSection & { paragraphs: string[] }
  purpose: LabeledSection & { text: string; image: Image }
  features: FeatureCard[]
  banner: LabeledSection & { primary: Cta; secondary: Cta }
}

export type ProductsPage = {
  enabled: boolean
  seo: Seo
  hero: { title: string; text: string; image: Image; cta: Cta }
  categories: LabeledSection & { text: string; cta: Cta }
  brands: LabeledSection & {
    text: string
    partner: LabeledSection & { text: string; cta: Cta }
  }
  catalog: LabeledSection & { text: string; image: Image; cta: Cta }
  banner: LabeledSection & { cta: Cta }
}

export type LogisticsPage = {
  enabled: boolean
  seo: Seo
  hero: { title: string; text: string; image: Image; cta: Cta }
  how: LabeledSection & { text: string; steps: { title: string; text: string }[] }
  regions: LabeledSection & { text: string; image: Image }
  audience: LabeledSection & { text: string; items: { icon: IconName; label: string }[] }
  planning: LabeledSection & {
    text: string
    boxes: { icon: IconName; title: string; text: string }[]
  }
  banner: LabeledSection & { text: string; image: Image; cta: Cta }
}

export type ContactFieldKey = 'name' | 'email' | 'subject' | 'message'

export type ContactPage = {
  enabled: boolean
  seo: Seo
  hero: LabeledSection & { text: string }
  form: {
    title: string
    fields: Record<ContactFieldKey, string>
    placeholders: Record<ContactFieldKey, string>
    submit: string
    submitting: string
    success: { title: string; text: string; cta: string }
    errors: { required: string; email: string; tooLong: string; apiFailed: string; summary: string }
  }
}

export type NotFoundContent = {
  seo: Seo
  title: string
  text: string
  cta: Cta
}

export type SiteContent = {
  site: SiteInfo
  nav: Link[]
  footerLinks: Link[]
  footer: { quickLinksTitle: string; contactTitle: string; menuOpen: string; menuClose: string; menuTitle: string; skipLink: string }
  trust: TrustItem[]
  brands: Brand[]
  categories: Category[]
  pages: {
    home: HomePage
    about: AboutPage
    products: ProductsPage
    logistics: LogisticsPage
    contact: ContactPage
  }
  notFound: NotFoundContent
}

export type PageKey = keyof SiteContent['pages']
