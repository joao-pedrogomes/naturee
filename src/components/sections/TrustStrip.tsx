import Icon from '@/components/icons/Icon'
import type { TrustItem } from '@/content/types'

type TrustStripProps = {
  items: TrustItem[]
}

function TrustStrip({ items }: TrustStripProps) {
  return (
    <ul className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <li key={item.title} className="flex flex-col items-center border-b border-olive-light pb-7 text-center">
          <Icon name={item.icon} className="size-6 text-sand" />
          <h3 className="mt-3 font-sans text-body font-bold text-sand">{item.title}</h3>
          <p className="mt-1 max-w-[16rem] text-small text-sand/85">{item.text}</p>
        </li>
      ))}
    </ul>
  )
}

export default TrustStrip
