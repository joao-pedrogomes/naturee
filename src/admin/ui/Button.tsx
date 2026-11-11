import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-teal text-sand hover:bg-teal/90',
  secondary: 'border border-teal/30 bg-white text-teal hover:bg-sand/60',
  danger: 'bg-red-700 text-white hover:bg-red-800',
  ghost: 'text-teal hover:bg-teal/10',
}

function Button({ variant = 'primary', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  )
}

export default Button
