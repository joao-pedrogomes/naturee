import { renderRichText } from '@/lib/richText'
import { cn } from '@/lib/utils'

type JustifiedLinesProps = {
  text: string
  className?: string
  lastLine?: 'start' | 'center'
}

/**
 * Reproduces a justified paragraph whose lines were broken by hand: every newline starts a
 * line that is stretched to the full width, and the last line keeps its natural width.
 * Below the desktop breakpoint the lines flow as ordinary text.
 */
function JustifiedLines({ text, className, lastLine = 'start' }: JustifiedLinesProps) {
  const lines = text.split('\n')

  return (
    <p className={className}>
      {lines.map((line, index) => {
        const isLast = index === lines.length - 1
        return (
          <span
            key={line}
            className={cn(
              'lg:block lg:whitespace-nowrap',
              !isLast && 'lg:[text-align-last:justify]',
              isLast && lastLine === 'center' && 'lg:text-center',
            )}
          >
            {renderRichText(line)}
            {isLast ? null : ' '}
          </span>
        )
      })}
    </p>
  )
}

export default JustifiedLines
