import type { SiteInfo } from '@/content/types'

const BRAZIL_COUNTRY_CODE = '55'
const WHATSAPP_SENTINEL = '#whatsapp'
const CATALOG_SENTINEL = '#catalog'

/** Files served by the Worker, not routes of the single-page app. */
const FILE_PATH = /^\/(catalogo|media)\//

export type ResolvedHref = { href: string; external: boolean }

/** Keeps digits only and prefixes Brazil's country code when it is missing. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10 || digits.length === 11) return `${BRAZIL_COUNTRY_CODE}${digits}`
  return digits
}

export function buildWhatsAppUrl(phone: string, message?: string): string {
  const base = `https://wa.me/${normalizePhone(phone)}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}

export function resolveHref(href: string, site: SiteInfo, message?: string): ResolvedHref {
  if (href === WHATSAPP_SENTINEL) {
    return { href: buildWhatsAppUrl(site.whatsapp, message), external: true }
  }
  if (href === CATALOG_SENTINEL) {
    return { href: site.catalogPdfUrl, external: true }
  }
  if (/^https?:\/\//.test(href) || FILE_PATH.test(href)) {
    return { href, external: true }
  }
  return { href, external: false }
}
