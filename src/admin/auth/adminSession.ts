import { createContext, useContext } from 'react'
import type { SessionUser } from '@/admin/api/types'

export type SessionState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; user: SessionUser }

export type AdminSessionValue = {
  state: SessionState
  signIn: (email: string, password: string) => Promise<SessionUser>
  signOut: () => Promise<void>
  passwordChanged: () => void
}

export const AdminSessionContext = createContext<AdminSessionValue | null>(null)

export function useAdminSession(): AdminSessionValue {
  const value = useContext(AdminSessionContext)
  if (!value) throw new Error('useAdminSession must be used inside AdminSessionProvider')
  return value
}
