import { cn } from '@/lib/utils'

type SectionLabelProps = {
  children: string
  tone?: 'olive' | 'cream' | 'teal'
  className?: string
}

const TONES = {
  olive: 'text-olive-deep',
  cream: 'text-white',
  teal: 'text-teal',
}

function SectionLabel({ children, tone = 'olive', className }: SectionLabelProps) {
  return <p className={cn('text-label', TONES[tone], className)}>{children}</p>
}

export default SectionLabel
