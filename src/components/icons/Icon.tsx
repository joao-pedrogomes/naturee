import {
  Building2,
  Calendar,
  CircleCheck,
  Clock,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBasket,
  Snowflake,
  Star,
  Store,
  Truck,
  Utensils,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { IconName } from '@/content/types'

const ICONS: Record<IconName, LucideIcon> = {
  snowflake: Snowflake,
  truck: Truck,
  zap: Zap,
  shieldCheck: ShieldCheck,
  package: Package,
  star: Star,
  circleCheck: CircleCheck,
  mapPin: MapPin,
  calendar: Calendar,
  clock: Clock,
  utensils: Utensils,
  building: Building2,
  store: Store,
  basket: ShoppingBasket,
}

type IconProps = {
  name: IconName
  className?: string
}

function Icon({ name, className }: IconProps) {
  const Component = ICONS[name]
  return <Component aria-hidden="true" className={className} strokeWidth={1.5} />
}

export default Icon
