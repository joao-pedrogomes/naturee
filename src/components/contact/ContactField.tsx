import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type ContactFieldProps = {
  id: string
  label: string
  error?: string
  className?: string
  children: ReactNode
}

function ContactField({ id, label, error, className, children }: ContactFieldProps) {
  return (
    <div className={cn('flex flex-col gap-2 lg:gap-[calc(12*var(--u))]', className)}>
      <Label htmlFor={id} className="font-sans text-[1.125rem] font-bold leading-none text-sand lg:ml-[calc(22*var(--u))] lg:text-[length:clamp(1.125rem,calc(29*var(--u)),3rem)]">
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
