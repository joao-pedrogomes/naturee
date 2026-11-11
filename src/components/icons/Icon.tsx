import type { IconName } from '@/content/types'
import audienceEmporiums from '@/assets/icons/audienceEmporiums.svg'
import audienceHotels from '@/assets/icons/audienceHotels.svg'
import audienceRestaurants from '@/assets/icons/audienceRestaurants.svg'
import audienceSupermarkets from '@/assets/icons/audienceSupermarkets.svg'
import checkGreen from '@/assets/icons/checkGreen.svg'
import footerPin from '@/assets/icons/footerPin.svg'
import planningCalendar from '@/assets/icons/planningCalendar.svg'
import planningClock from '@/assets/icons/planningClock.svg'
import tickerCold from '@/assets/icons/tickerCold.svg'
import tickerGuarantee from '@/assets/icons/tickerGuarantee.svg'
import tickerRoute from '@/assets/icons/tickerRoute.svg'
import tickerSupply from '@/assets/icons/tickerSupply.svg'
import trustBox from '@/assets/icons/trustBox.svg'
import trustCheck from '@/assets/icons/trustCheck.svg'
import trustRoute from '@/assets/icons/trustRoute.svg'
import trustStar from '@/assets/icons/trustStar.svg'

const ICONS: Record<IconName, string> = {
  snowflake: tickerCold,
  truck: tickerRoute,
  zap: tickerSupply,
  shieldCheck: tickerGuarantee,
  package: trustBox,
  trustRoute,
  trustCheck,
  star: trustStar,
  circleCheck: checkGreen,
  mapPin: footerPin,
  calendar: planningCalendar,
  clock: planningClock,
  utensils: audienceRestaurants,
  building: audienceHotels,
  store: audienceEmporiums,
  basket: audienceSupermarkets,
}

type IconProps = {
  name: IconName
  className?: string
}

function Icon({ name, className }: IconProps) {
  return <img src={ICONS[name]} alt="" aria-hidden="true" className={className} />
}

export default Icon
