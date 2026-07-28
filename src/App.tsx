import { Route, Routes } from 'react-router-dom'
import AppLayout from '@/components/layout/app-layout'
import Home from '@/pages/home'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
      </Route>
    </Routes>
  )
}

export default App
