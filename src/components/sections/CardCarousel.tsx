import { useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import arrowLeft from '@/assets/icons/arrowLeftGreen.svg'
import arrowRight from '@/assets/icons/arrowRightGreen.svg'

type CardCarouselProps = {
  children: ReactNode
  /** Classes for the phone (stacked) and desktop (grid) layouts of the list; the tablet carousel classes are added here. */
  trackClassName?: string
  /** Classes for the wrapper, e.g. its margin. */
  className?: string
  label?: string
  previousLabel?: string
  nextLabel?: string
  /** Vertical position of the arrows; the default sits 15px above the middle of the card. */
  arrowTop?: string
}

/** Width of one card in the tablet carousel: two fit side by side, the gap being 1rem. */
export const CAROUSEL_CARD = 'sm:w-[calc(50%-0.5rem)] sm:shrink-0 sm:snap-start lg:w-auto lg:shrink'

/* The arrows float over the photos' edges, so the cards span the full content width and line up with the text above and below. */
const ARROW =
  'absolute z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive sm:inline-flex lg:hidden'

/**
 * A list of cards that stacks on phones (under 640px), becomes a two-card carousel with arrow
 * buttons on tablets (640-1365px), and hands over to the caller's grid classes on desktop.
 */
function CardCarousel({ children, trackClassName, className, label, previousLabel = 'Anterior', nextLabel = 'Próximo', arrowTop = 'top-[calc(50%-15px)]' }: CardCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null)

  function scrollByPage(direction: 1 | -1) {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * track.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className={cn('relative', className)}>
      <button type="button" aria-label={previousLabel} className={cn(ARROW, arrowTop, 'left-2')} onClick={() => scrollByPage(-1)}>
        <img src={arrowLeft} alt="" aria-hidden="true" className="w-6" />
      </button>
      <ul
        ref={trackRef}
        aria-label={label}
        className={cn(
          'scrollbar-none sm:flex sm:snap-x sm:snap-mandatory sm:gap-4 sm:overflow-x-auto sm:scroll-smooth lg:grid lg:snap-none lg:overflow-visible',
          trackClassName,
        )}
      >
        {children}
      </ul>
      <button type="button" aria-label={nextLabel} className={cn(ARROW, arrowTop, 'right-2')} onClick={() => scrollByPage(1)}>
        <img src={arrowRight} alt="" aria-hidden="true" className="w-6" />
      </button>
    </div>
  )
}

export default CardCarousel
