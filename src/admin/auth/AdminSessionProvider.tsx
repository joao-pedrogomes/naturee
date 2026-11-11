import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ApiError, adminApi, setUnauthorizedHandler } from '@/admin/api/adminApi'
import type { SessionUser } from '@/admin/api/types'
import { AdminSessionContext, type SessionState } from '@/admin/auth/adminSession'

type AdminSessionProviderProps = { children: ReactNode }

function AdminSessionProvider({ children }: AdminSessionProviderProps) {
  const [state, setState] = useState<SessionState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    adminApi
      .me()
      .then((user) => active && setState({ status: 'authenticated', user }))
      .catch((failure) => {
        if (!active) return
        const gone = failure instanceof ApiError && failure.status === 401
        setState({ status: gone ? 'anonymous' : 'unavailable' })
      })
    return () => {
      active = false
    }
  }, [attempt])

  useEffect(() => {
    setUnauthorizedHandler(() => setState({ status: 'anonymous' }))
    return () => setUnauthorizedHandler(undefined)
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<SessionUser> => {
    const user = await adminApi.login(email, password)
    setState({ status: 'authenticated', user })
    return user
  }, [])

  const signOut = useCallback(async () => {
    try {
      await adminApi.logout()
    } catch (failure) {
      console.error('sign out request failed; the cookie may still be valid', failure)
    }
    setState({ status: 'anonymous' })
  }, [])

  const passwordChanged = useCallback(() => {
    setState((current) =>
      current.status === 'authenticated' ? { status: 'authenticated', user: { ...current.user, mustChange: false } } : current,
    )
  }, [])

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((count) => count + 1)
  }, [])

  const value = useMemo(() => ({ state, signIn, signOut, passwordChanged, retry }), [state, signIn, signOut, passwordChanged, retry])
  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>
}

export default AdminSessionProvider
