import Icon from '@/components/icons/Icon'
import { renderRichText } from '@/lib/richText'
import type { TrustItem } from '@/content/types'

type TrustStripProps = {
  items: TrustItem[]
}

function TrustStrip({ items }: TrustStripProps) {
  return (
    <ul className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:mx-auto lg:w-[calc(1431*var(--u))] lg:grid-cols-4 lg:gap-x-[calc(127*var(--u))]">
      {items.map((item) => (
        <li
          key={item.title}
          className="flex flex-col items-center border-b border-olive pb-7 text-center lg:pb-[calc(42*var(--u))]"
        >
          <Icon name={item.icon} className="size-7 text-sand lg:size-[calc(36*var(--u))]" />
          <h3 className="mt-3 font-sans text-[1.0625rem] font-extrabold text-sand lg:mt-[calc(22*var(--u))] lg:text-[length:clamp(1.0625rem,calc(25*var(--u)),2.75rem)]">
            {item.title}
          </h3>
          <p className="mt-1 max-w-[16rem] text-foot text-sand lg:mt-[calc(8*var(--u))] lg:max-w-none lg:whitespace-nowrap">{renderRichText(item.text)}</p>
        </li>
      ))}
    </ul>
  )
}

export default TrustStrip
