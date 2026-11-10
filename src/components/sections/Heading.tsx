import { renderRichText } from '@/lib/richText'
import { cn } from '@/lib/utils'

type HeadingProps = {
  as?: 'h1' | 'h2' | 'h3'
  text: string
  className?: string
  id?: string
}

function Heading({ as: Tag = 'h2', text, className, id }: HeadingProps) {
  return (
    <Tag id={id} className={cn('font-heading [&_em]:font-semibold', className)}>
      {renderRichText(text)}
    </Tag>
  )
}

export default Heading
