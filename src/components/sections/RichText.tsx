import { renderRichText } from '@/lib/richText'
import { cn } from '@/lib/utils'

type RichTextProps = {
  text: string
  className?: string
}

function RichText({ text, className }: RichTextProps) {
  return <p className={cn('[&_strong]:font-bold', className)}>{renderRichText(text)}</p>
}

export default RichText
