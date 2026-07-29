import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'

// Node 26 exposes a built-in `localStorage` global that is inert without
// --localstorage-file, and vitest's jsdom environment does not replace it.
// Bind the real jsdom Storage (reachable through globalThis.jsdom) instead.
function installStorage(key: 'localStorage' | 'sessionStorage') {
  const current = (globalThis as Record<string, unknown>)[key] as Storage | undefined
  if (current && typeof current.clear === 'function') return

  const jsdomWindow = (globalThis as { jsdom?: { window: Window } }).jsdom?.window
  const storage = jsdomWindow?.[key]
  if (!storage) throw new Error(`No usable ${key} in the test environment`)

  Object.defineProperty(globalThis, key, { value: storage, configurable: true })
  if (globalThis.window && globalThis.window !== (globalThis as unknown as Window)) {
    Object.defineProperty(globalThis.window, key, { value: storage, configurable: true })
  }
}

installStorage('localStorage')
installStorage('sessionStorage')

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
})

// Radix primitives rely on APIs jsdom does not implement.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}
