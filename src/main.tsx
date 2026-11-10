import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '@/App'
import { Toaster } from '@/components/ui/sonner'
import SiteContentProvider from '@/content/SiteContentProvider'
import './index.css'

const root = document.getElementById('root')!

const app = (
  <StrictMode>
    <SiteContentProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
      <Toaster position="top-center" />
    </SiteContentProvider>
  </StrictMode>
)

if (root.hasChildNodes()) {
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}
