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
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="font-sans text-lead font-semibold text-white">
        {label}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-small font-semibold text-white">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default ContactField
