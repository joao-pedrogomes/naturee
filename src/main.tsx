import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '@/App'
import AppProviders from '@/AppProviders'
import { readInjectedContent } from '@/lib/injectedContent'
import './index.css'

const root = document.getElementById('root')!

const app = (
  <StrictMode>
    <AppProviders content={readInjectedContent(document)}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </AppProviders>
  </StrictMode>
)

if (root.hasChildNodes()) {
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}
