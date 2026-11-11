import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { adminApi } from '@/admin/api/adminApi'
import type { SessionUser } from '@/admin/api/types'
import { AdminSessionContext, type SessionState } from '@/admin/auth/adminSession'

type AdminSessionProviderProps = { children: ReactNode }

function AdminSessionProvider({ children }: AdminSessionProviderProps) {
  const [state, setState] = useState<SessionState>({ status: 'loading' })

  useEffect(() => {
    let active = true
    adminApi
      .me()
      .then((user) => active && setState({ status: 'authenticated', user }))
      .catch(() => active && setState({ status: 'anonymous' }))
    return () => {
      active = false
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<SessionUser> => {
    const user = await adminApi.login(email, password)
    setState({ status: 'authenticated', user })
    return user
  }, [])

  const signOut = useCallback(async () => {
    await adminApi.logout().catch(() => undefined)
    setState({ status: 'anonymous' })
  }, [])

  const passwordChanged = useCallback(() => {
    setState((current) =>
      current.status === 'authenticated' ? { status: 'authenticated', user: { ...current.user, mustChange: false } } : current,
    )
  }, [])

  const value = useMemo(() => ({ state, signIn, signOut, passwordChanged }), [state, signIn, signOut, passwordChanged])
  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>
}

export default AdminSessionProvider
