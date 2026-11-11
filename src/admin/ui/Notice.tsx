import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type NoticeProps = {
  tone: 'error' | 'success' | 'info'
  children: ReactNode
  className?: string
}

const TONES = {
  error: 'border-red-300 bg-red-50 text-red-900',
  success: 'border-olive/40 bg-olive/10 text-teal',
  info: 'border-teal/20 bg-sand/60 text-teal',
}

function Notice({ tone, children, className }: NoticeProps) {
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={cn('rounded-xl border px-4 py-3 text-sm font-medium', TONES[tone], className)}>
      {children}
    </p>
  )
}

export default Notice
