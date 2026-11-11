export type Env = {
  DB: D1Database
  ASSETS: Fetcher
  CF_VERSION?: { id: string }
  RESEND_API_KEY?: string
  MAIL_FROM?: string
  IP_PEPPER?: string
}
