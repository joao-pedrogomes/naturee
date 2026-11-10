import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Custom fluid text utilities must be registered as font sizes, otherwise
// tailwind-merge treats them as colors and drops them next to `text-teal`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display', 'title', 'subtitle', 'card-title', 'lead', 'body', 'label', 'small'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
