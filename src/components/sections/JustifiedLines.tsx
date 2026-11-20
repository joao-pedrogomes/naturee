import { renderRichText } from '@/lib/richText'
import { cn } from '@/lib/utils'

type JustifiedLinesProps = {
  text: string
  className?: string
  lastLine?: 'start' | 'center'
  /** Keep the line breaks written in the copy (one line per newline) instead of letting the text flow. */
  handBroken?: boolean
}

/**
 * A justified paragraph on desktop. By default hand-written line breaks are treated as spaces and the
 * text flows, so the caller tunes font size and width until the lines fill the box evenly. With
 * `handBroken`, every newline starts a line that is stretched to the full width and the last line keeps
 * its natural width; below the desktop breakpoint the lines flow as ordinary text.
 */
function JustifiedLines({ text, className, lastLine = 'start', handBroken = false }: JustifiedLinesProps) {
  if (!handBroken || !text.includes('\n')) {
    return (
      <p className={cn('lg:text-justify', lastLine === 'center' && 'lg:[text-align-last:center]', className)}>
        {renderRichText(text.replace(/\n/g, ' '))}
      </p>
    )
  }

  const lines = text.split('\n')

  return (
    <p className={className}>
      {lines.map((line, index) => {
        const isLast = index === lines.length - 1
        return (
          <span
            key={`${index}-${line}`}
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
