import type { Env } from '../env'

export type MailMessage = { to: string; replyTo: string; subject: string; text: string }

const RESEND_URL = 'https://api.resend.com/emails'
const DEFAULT_FROM = 'Naturee Food Hub <noreply@natureefoodhub.com.br>'

function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim()
}

/** Returns true when Resend accepted the message; never throws. */
export async function sendMail(env: Env, message: MailMessage, fetchFn: typeof fetch = fetch): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false
  try {
    const response = await fetchFn(RESEND_URL, {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: env.MAIL_FROM ?? DEFAULT_FROM,
        to: [singleLine(message.to)],
        reply_to: singleLine(message.replyTo),
        subject: singleLine(message.subject),
        text: message.text,
      }),
    })
    return response.ok
  } catch {
    return false
  }
}
