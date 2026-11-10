export function absoluteUrl(path: string, siteUrl: string): string {
  const base = siteUrl.replace(/\/+$/, '')
  const suffix = path.startsWith('/') ? path : `/${path}`
  return suffix === '/' ? `${base}/` : `${base}${suffix}`
}

export function pageTitle(title: string, siteName: string): string {
  if (!title || title === siteName) return siteName
  return `${title} · ${siteName}`
}
