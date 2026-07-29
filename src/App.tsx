import { Route, Routes } from 'react-router-dom'
import AppLayout from '@/components/layout/app-layout'
import Home from '@/pages/home'
import ProductsPage from '@/pages/products'
import QuotationPage from '@/pages/quotation'
import ProcessesPage from '@/pages/processes'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="produtos" element={<ProductsPage />} />
        <Route path="produtos/:slug" element={<ProductsPage />} />
        <Route path="orcamento" element={<QuotationPage />} />
        <Route path="processos" element={<ProcessesPage />} />
      </Route>
    </Routes>
  )
}

export default App
