import { useRef, useState, type FormEvent } from 'react'
import ContactField from '@/components/contact/ContactField'
import Heading from '@/components/sections/Heading'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useSiteContent } from '@/content/siteContent'
import type { ContactFieldKey } from '@/content/types'
import {
  buildContactMessage,
  CONTACT_FIELD_ORDER,
  CONTACT_LIMITS,
  EMPTY_CONTACT,
  submitContact,
  validateContact,
  type ContactErrors,
  type ContactFields,
} from '@/lib/contact'
import { cn } from '@/lib/utils'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

type FormStatus = 'idle' | 'submitting' | 'done'

const INPUT_CLASS =
  'h-14 rounded-xl border-0 bg-sand px-5 text-base text-teal shadow-none placeholder:text-[#a9a995] focus-visible:ring-2 focus-visible:ring-white aria-invalid:ring-2 aria-invalid:ring-white md:text-base lg:h-[calc(81*var(--u))] lg:rounded-[calc(14*var(--u))] lg:px-[calc(27*var(--u))] lg:text-[length:clamp(1rem,calc(32*var(--u)),3rem)] md:lg:text-[length:clamp(1rem,calc(32*var(--u)),3rem)]'

function firstInvalid(errors: ContactErrors): ContactFieldKey | undefined {
  return CONTACT_FIELD_ORDER.find((key) => errors[key] !== undefined)
}

function openWhatsApp(url: string): void {
  window.open(url, '_blank', 'noopener')
}

function ContactForm() {
  const { site, pages } = useSiteContent()
  const copy = pages.contact.form
  const formRef = useRef<HTMLFormElement>(null)
  const [fields, setFields] = useState<ContactFields>(EMPTY_CONTACT)
  const [errors, setErrors] = useState<ContactErrors>({})
  const [status, setStatus] = useState<FormStatus>('idle')
  const [whatsappUrl, setWhatsappUrl] = useState<string>()
  const [apiFailed, setApiFailed] = useState(false)

  function updateField(key: ContactFieldKey, value: string) {
    setFields((current) => ({ ...current, [key]: value }))
    if (!errors[key]) return
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  function focusField(key: ContactFieldKey) {
    const element = formRef.current?.elements.namedItem(key)
    if (element instanceof HTMLElement) element.focus()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateContact(fields)
    const invalid = firstInvalid(nextErrors)
    setErrors(nextErrors)
    if (invalid) {
      focusField(invalid)
      return
    }

    setStatus('submitting')
    const result = await submitContact(fields, { apiUrl: import.meta.env.VITE_CONTACT_API_URL })
    setApiFailed(result.status === 'failed')

    const url = buildWhatsAppUrl(site.whatsapp, buildContactMessage(fields))
    setWhatsappUrl(url)
    openWhatsApp(url)
    setStatus('done')
  }

  if (status === 'done' && whatsappUrl) {
    return (
      <div role="status" className="text-center">
        <Heading as="h2" text={copy.success.title} className="text-title text-sand" />
        <p className="mx-auto mt-4 max-w-[40ch] text-body text-white">{copy.success.text}</p>
        {apiFailed ? (
          <p role="alert" className="mx-auto mt-4 max-w-[44ch] rounded-xl bg-teal/40 px-4 py-3 text-small font-semibold text-white">
            {copy.errors.apiFailed}
          </p>
        ) : null}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener"
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-teal px-8 text-body font-semibold text-sand hover:bg-teal/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand"
        >
          {copy.success.cta}
        </a>
      </div>
    )
  }

  const hasErrors = firstInvalid(errors) !== undefined

  return (
    <form ref={formRef} noValidate onSubmit={handleSubmit} className="flex flex-col gap-6 lg:gap-[calc(31*var(--u))]">
      <Heading as="h2" text={copy.title} className="text-display text-sand lg:mb-[calc(10*var(--u))] lg:ml-[calc(24*var(--u))] lg:leading-[0.935] [&_em]:font-medium" />
      {hasErrors ? (
        <p role="alert" className="rounded-xl bg-teal/40 px-4 py-3 text-small font-semibold text-white">
          {copy.errors.summary}
        </p>
      ) : null}

      {CONTACT_FIELD_ORDER.map((key) => {
        const error = errors[key] ? copy.errors[errors[key]] : undefined
        const shared = {
          id: key,
          name: key,
          value: fields[key],
          placeholder: copy.placeholders[key],
          maxLength: CONTACT_LIMITS[key],
          required: true,
          'aria-invalid': error ? true : undefined,
          'aria-describedby': error ? `${key}-error` : undefined,
        }

        return (
          <ContactField key={key} id={key} label={copy.fields[key]} error={error}>
            {key === 'message' ? (
              <Textarea
                {...shared}
                rows={6}
                className={cn(INPUT_CLASS, 'min-h-44 py-4 lg:h-[calc(210*var(--u))] lg:py-[calc(22*var(--u))]')}
                onChange={(event) => updateField(key, event.target.value)}
              />
            ) : (
              <Input
                {...shared}
                type={key === 'email' ? 'email' : 'text'}
                autoComplete={key === 'email' ? 'email' : key === 'name' ? 'name' : 'off'}
                className={INPUT_CLASS}
                onChange={(event) => updateField(key, event.target.value)}
              />
            )}
          </ContactField>
        )
      })}

      <div className="flex justify-end lg:mt-[calc(20*var(--u))] lg:pr-[calc(0*var(--u))]">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="inline-flex min-h-11 min-w-[11rem] items-center justify-center rounded-full bg-teal px-8 text-btn font-medium text-sand uppercase transition-colors hover:bg-teal/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-60 lg:h-[calc(46*var(--u))] lg:w-[calc(255*var(--u))] lg:min-w-0 lg:px-0"
        >
          {status === 'submitting' ? copy.submitting : copy.submit}
        </button>
      </div>
    </form>
  )
}

export default ContactForm
