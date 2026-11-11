import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '@/admin/api/adminApi'
import { copy } from '@/admin/copy'
import { useAdminSession } from '@/admin/auth/adminSession'
import Button from '@/admin/ui/Button'
import AdminTitle from '@/admin/ui/AdminTitle'
import Notice from '@/admin/ui/Notice'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import logo from '@/assets/logos/naturee.svg'

function messageFor(error: unknown): string {
  if (!(error instanceof ApiError)) return copy.login.failed
  if (error.status === 429) return copy.login.throttled
  if (error.status === 401) return copy.login.invalid
  return copy.login.failed
}

function LoginPage() {
  const { state, signIn } = useAdminSession()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)

  if (state.status === 'authenticated') return <Navigate to="/admin" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(undefined)
    try {
      await signIn(email, password)
      navigate('/admin', { replace: true })
    } catch (failure) {
      setError(messageFor(failure))
      setPassword('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-teal px-4 py-10">
      <AdminTitle page={copy.login.title} />
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5 rounded-3xl bg-[#f7f4e6] p-8 shadow-xl">
        <img src={logo} alt="Naturee Food Hub" width={161} height={147} className="mx-auto h-20 w-auto" />
        <h1 className="text-center font-heading text-3xl text-teal">{copy.login.title}</h1>
        {error ? <Notice tone="error">{error}</Notice> : null}
        <div className="space-y-2">
          <Label htmlFor="email">{copy.login.email}</Label>
          <Input id="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 bg-white" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{copy.login.password}</Label>
          <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 bg-white" />
        </div>
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? copy.login.submitting : copy.login.submit}
        </Button>
      </form>
    </main>
  )
}

export default LoginPage
