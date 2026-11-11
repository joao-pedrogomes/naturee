import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { copy } from '@/admin/copy'
import { useAdminSession } from '@/admin/auth/adminSession'
import Button from '@/admin/ui/Button'
import Notice from '@/admin/ui/Notice'
import { cn } from '@/lib/utils'
import logo from '@/assets/logos/naturee.svg'

const NAV = [
  { to: '/admin/contatos', label: copy.nav.leads },
  { to: '/admin/conteudo', label: copy.nav.content },
  { to: '/admin/configuracoes', label: copy.nav.settings },
  { to: '/admin/imagens', label: copy.nav.media },
  { to: '/admin/catalogo', label: copy.nav.catalog },
  { to: '/admin/usuarios', label: copy.nav.users },
  { to: '/admin/conta', label: copy.nav.account },
]

function AdminLayout() {
  const { state, signOut, retry } = useAdminSession()
  const { pathname } = useLocation()

  if (state.status === 'loading') return <p className="p-8 text-teal">{copy.loading}</p>
  if (state.status === 'unavailable') {
    return (
      <div className="mx-auto max-w-md space-y-4 p-8">
        <Notice tone="error">{copy.errors.unavailable}</Notice>
        <Button onClick={retry}>{copy.retry}</Button>
      </div>
    )
  }
  if (state.status === 'anonymous') return <Navigate to="/admin/entrar" replace />
  if (state.user.mustChange && pathname !== '/admin/conta') return <Navigate to="/admin/conta" replace />

  return (
    <div className="min-h-svh bg-[#f7f4e6] text-teal">
      <header className="bg-teal text-sand">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
          <img src={logo} alt={copy.logoAlt} width={161} height={147} className="h-12 w-auto" />
          <nav aria-label={copy.navLabel} className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto sm:order-none sm:mx-0 sm:w-auto sm:flex-1 sm:flex-wrap">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand',
                    isActive && 'bg-sand text-teal hover:bg-sand',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden sm:inline">{state.user.email}</span>
            <Button variant="secondary" onClick={() => void signOut()}>
              {copy.signOut}
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
