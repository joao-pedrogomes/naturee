import { renderRichText } from '@/lib/richText'
import { cn } from '@/lib/utils'

type JustifiedLinesProps = {
  text: string
  className?: string
  lastLine?: 'start' | 'center'
}

/**
 * A justified paragraph on desktop. Hand-written line breaks in the copy are treated as spaces:
 * forcing them stretched short lines to the full width and left wide gaps between words, so the
 * text now flows and the caller tunes the font size until the lines fill the box evenly.
 */
function JustifiedLines({ text, className, lastLine = 'start' }: JustifiedLinesProps) {
  return (
    <p className={cn('lg:text-justify', lastLine === 'center' && 'lg:[text-align-last:center]', className)}>
      {renderRichText(text.replace(/\n/g, ' '))}
    </p>
  )
}

export default JustifiedLines
