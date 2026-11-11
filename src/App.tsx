import { Route, Routes } from 'react-router-dom'
import SiteLayout from '@/components/layout/SiteLayout'
import PageGate from '@/components/pages/PageGate'
import type { PageKey } from '@/content/types'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import Home from '@/pages/Home'
import Logistics from '@/pages/Logistics'
import NotFound from '@/pages/NotFound'
import Products from '@/pages/Products'
import { ROUTES } from '@/routes'

const PAGES: Record<PageKey, () => React.JSX.Element> = {
  home: Home,
  about: About,
  products: Products,
  logistics: Logistics,
  contact: Contact,
}

function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        {ROUTES.map((route) => {
          const Page = PAGES[route.key]
          return (
            <Route
              key={route.key}
              path={route.path}
              element={
                <PageGate pageKey={route.key}>
                  <Page />
                </PageGate>
              }
            />
          )
        })}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
