import { describe, expect, it } from 'vitest'
import worker from './index'
import { createTestEnv, testContext } from './testing/fakeD1'

function fetchFrom(url: string, method = 'GET'): Promise<Response> {
  return worker.fetch(new Request(url, { method }), createTestEnv(), testContext())
}

describe('www redirect', () => {
  it('sends www to the apex host permanently, keeping the path and query', async () => {
    const response = await fetchFrom('https://www.natureefoodhub.com.br/sobre?utm_source=ig')
    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('https://natureefoodhub.com.br/sobre?utm_source=ig')
  })

  it('keeps the method for non-GET requests', async () => {
    const response = await fetchFrom('https://www.natureefoodhub.com.br/api/contact', 'POST')
    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe('https://natureefoodhub.com.br/api/contact')
  })

  it('leaves the apex host alone', async () => {
    const response = await fetchFrom('https://natureefoodhub.com.br/sitemap.xml')
    expect(response.status).toBe(200)
  })
})
