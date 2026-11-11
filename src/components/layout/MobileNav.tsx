import { Menu } from 'lucide-react'
import { useState } from 'react'
import NavLinks from '@/components/layout/NavLinks'
import WhatsAppPill from '@/components/layout/WhatsAppPill'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useSiteContent } from '@/content/siteContent'

function MobileNav() {
  const { nav, footer, site } = useSiteContent()
  const [open, setOpen] = useState(false)

  function closeMenu() {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={footer.menuOpen}
        className="inline-flex size-11 items-center justify-center rounded-full text-sand transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand"
      >
        <Menu aria-hidden="true" className="size-7" />
      </SheetTrigger>
      <SheetContent side="right" closeLabel={footer.menuClose} className="w-[min(100vw,22rem)] border-l-0 bg-teal text-sand">
        <SheetHeader>
          <SheetTitle className="text-sand">{footer.menuTitle}</SheetTitle>
          <SheetDescription className="text-sand/70">{site.name}</SheetDescription>
        </SheetHeader>
        <nav aria-label={footer.menuTitle} className="px-4">
          <NavLinks links={nav} className="flex-col items-start gap-2" linkClassName="text-lg font-medium tracking-wide" onNavigate={closeMenu} />
        </nav>
        <div className="mt-auto px-4 pb-6">
          <WhatsAppPill className="w-full" />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MobileNav
