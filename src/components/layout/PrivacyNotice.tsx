import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSiteContent } from '@/content/siteContent'
import { pathFor } from '@/routes'

const STORAGE_KEY = 'naturee-cookie-notice'

function alreadyDismissed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * A small, non-blocking notice pinned to the bottom of the screen. The site only keeps what it needs to
 * run, so there is a single acknowledgement button; the choice is remembered in localStorage. It renders
 * nothing on the server and until the first client check, so prerendered pages carry no notice.
 */
function PrivacyNotice() {
  const { footer, pages } = useSiteContent()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!alreadyDismissed()) setVisible(true)
  }, [])

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* private mode: the notice simply returns on the next visit */
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label={footer.cookieLabel}
      className="animate-in fade-in slide-in-from-bottom-2 fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-[46rem] flex-col items-center gap-3 rounded-2xl border border-sand/15 bg-teal px-5 py-4 text-center text-[0.8125rem] leading-snug text-sand shadow-[0_8px_30px_rgb(0_0_0/0.35)] duration-500 sm:inset-x-6 sm:bottom-5 sm:flex-row sm:gap-5 sm:px-6 sm:text-left sm:text-sm"
    >
      <p className="flex-1">
        {footer.cookieText}
        {pages.privacy.enabled ? (
          <>
            {' '}
            <Link to={pathFor('privacy')} className="font-semibold text-sand underline underline-offset-4 hover:text-white">
              {footer.cookieMore}
            </Link>
          </>
        ) : null}
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-olive px-7 text-sm font-medium text-sand transition-colors hover:bg-olive-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand max-sm:w-full"
      >
        {footer.cookieAccept}
      </button>
    </div>
  )
}

export default PrivacyNotice
