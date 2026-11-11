import { NavLink } from 'react-router-dom'
import type { Link } from '@/content/types'
import { cn } from '@/lib/utils'

type NavLinksProps = {
  links: Link[]
  className?: string
  linkClassName?: string
  onNavigate?: () => void
}

const LINK_BASE =
  'inline-flex min-h-11 items-center border-b-2 border-transparent py-1 text-sand uppercase transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sand'

function NavLinks({ links, className, linkClassName, onNavigate }: NavLinksProps) {
  const enabled = links.filter((link) => link.enabled)

  return (
    <ul className={cn('flex items-center', className)}>
      {enabled.map((link) => (
        <li key={link.id}>
          <NavLink
            to={link.href}
            end={link.href === '/'}
            onClick={onNavigate}
            className={({ isActive }) => cn(LINK_BASE, linkClassName, isActive && 'border-sand')}
          >
            {link.label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

export default NavLinks
