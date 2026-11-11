import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'

type ContactFieldProps = {
  id: string
  label: string
  error?: string
  children: ReactNode
}

function ContactField({ id, label, error, children }: ContactFieldProps) {
  return (
    <div className="flex flex-col gap-2 lg:gap-[calc(24*var(--u))]">
      <Label htmlFor={id} className="font-sans text-[1.125rem] font-bold leading-none text-sand lg:ml-[calc(24*var(--u))] lg:text-[length:clamp(1.125rem,calc(43*var(--u)),4rem)]">
        {label}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-small font-semibold text-white lg:-mt-[calc(10*var(--u))]">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default ContactField
