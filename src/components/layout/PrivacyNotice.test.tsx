import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import PrivacyNotice from '@/components/layout/PrivacyNotice'
import SiteContentProvider from '@/content/SiteContentProvider'
import { defaultContent } from '@/content/defaultContent'

function renderNotice() {
  return render(
    <MemoryRouter>
      <SiteContentProvider content={defaultContent}>
        <PrivacyNotice />
      </SiteContentProvider>
    </MemoryRouter>,
  )
}

describe('PrivacyNotice', () => {
  beforeEach(() => window.localStorage.clear())

  it('shows the notice on the first visit', () => {
    renderNotice()
    expect(screen.getByRole('region', { name: defaultContent.footer.cookieLabel })).toHaveTextContent(defaultContent.footer.cookieText)
  })

  it('hides after the acknowledgement and stays hidden on the next visit', async () => {
    const user = userEvent.setup()
    const first = renderNotice()
    await user.click(screen.getByRole('button', { name: defaultContent.footer.cookieAccept }))
    expect(screen.queryByRole('region', { name: defaultContent.footer.cookieLabel })).not.toBeInTheDocument()
    first.unmount()

    renderNotice()
    expect(screen.queryByRole('region', { name: defaultContent.footer.cookieLabel })).not.toBeInTheDocument()
  })
})
