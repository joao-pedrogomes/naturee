import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from '@/admin/AdminLayout'
import AdminSessionProvider from '@/admin/auth/AdminSessionProvider'
import AccountPage from '@/admin/pages/AccountPage'
import ContentPage from '@/admin/pages/ContentPage'
import LeadsPage from '@/admin/pages/LeadsPage'
import LoginPage from '@/admin/pages/LoginPage'
import MediaPage from '@/admin/pages/MediaPage'
import SettingsPage from '@/admin/pages/SettingsPage'
import UsersPage from '@/admin/pages/UsersPage'

function AdminApp() {
  return (
    <AdminSessionProvider>
      <Routes>
        <Route path="entrar" element={<LoginPage />} />
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="contatos" replace />} />
          <Route path="contatos" element={<LeadsPage />} />
          <Route path="conteudo" element={<ContentPage />} />
          <Route path="configuracoes" element={<SettingsPage />} />
          <Route path="imagens" element={<MediaPage />} />
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="conta" element={<AccountPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </AdminSessionProvider>
  )
}

export default AdminApp
