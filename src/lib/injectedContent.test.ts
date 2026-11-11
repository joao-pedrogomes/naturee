import { describe, expect, it } from 'vitest'
import { defaultContent } from '@/content/defaultContent'
import { INJECTED_CONTENT_ID, readInjectedContent, serializeContent } from '@/lib/injectedContent'

describe('injected content', () => {
  it('round-trips content through a script tag', () => {
    document.body.innerHTML = `<script id="${INJECTED_CONTENT_ID}" type="application/json">${serializeContent(defaultContent)}</script>`
    expect(readInjectedContent(document)).toEqual(defaultContent)
  })

  it('never emits a closing script tag or raw angle bracket', () => {
    const hostile = { ...defaultContent, site: { ...defaultContent.site, tagline: '</script><img src=x onerror=1>' } }
    const json = serializeContent(hostile)
    expect(json).not.toContain('<')
    expect(JSON.parse(json).site.tagline).toBe(hostile.site.tagline)
  })

  it('returns undefined when absent or malformed', () => {
    document.body.innerHTML = ''
    expect(readInjectedContent(document)).toBeUndefined()
    document.body.innerHTML = `<script id="${INJECTED_CONTENT_ID}" type="application/json">{nope</script>`
    expect(readInjectedContent(document)).toBeUndefined()
  })
})
