import { useState, type FormEvent } from 'react'
import { ApiError, adminApi } from '@/admin/api/adminApi'
import { copy } from '@/admin/copy'
import { useAdminSession } from '@/admin/auth/adminSession'
import Button from '@/admin/ui/Button'
import AdminTitle from '@/admin/ui/AdminTitle'
import Notice from '@/admin/ui/Notice'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Outcome = { tone: 'error' | 'success'; text: string }

function failureText(error: unknown): string {
  if (!(error instanceof ApiError)) return copy.errors.generic
  if (error.status === 401) return copy.account.wrong
  if (error.status === 422) return copy.account.weak
  return copy.errors.generic
}

function AccountPage() {
  const { state, passwordChanged } = useAdminSession()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [outcome, setOutcome] = useState<Outcome>()
  const [busy, setBusy] = useState(false)
  const mustChange = state.status === 'authenticated' && state.user.mustChange

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (next !== confirm) {
      setOutcome({ tone: 'error', text: copy.account.mismatch })
      return
    }
    setBusy(true)
    try {
      await adminApi.changePassword(current, next)
      setOutcome({ tone: 'success', text: copy.account.done })
      setCurrent('')
      setNext('')
      setConfirm('')
      passwordChanged()
    } catch (failure) {
      setOutcome({ tone: 'error', text: failureText(failure) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="max-w-md space-y-5">
      <AdminTitle page={copy.account.title} />
      <h1 className="font-heading text-4xl">{copy.account.title}</h1>
      {mustChange ? <Notice tone="info">{copy.account.mustChange}</Notice> : null}
      {outcome ? <Notice tone={outcome.tone}>{outcome.text}</Notice> : null}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current">{copy.account.current}</Label>
          <Input id="current" type="password" autoComplete="current-password" required value={current} onChange={(event) => setCurrent(event.target.value)} className="h-12 bg-white" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="next">{copy.account.next}</Label>
          <Input id="next" type="password" autoComplete="new-password" required minLength={12} value={next} onChange={(event) => setNext(event.target.value)} className="h-12 bg-white" aria-describedby="next-hint" />
          <p id="next-hint" className="text-sm text-teal/70">{copy.account.hint}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">{copy.account.confirm}</Label>
          <Input id="confirm" type="password" autoComplete="new-password" required value={confirm} onChange={(event) => setConfirm(event.target.value)} className="h-12 bg-white" />
        </div>
        <Button type="submit" disabled={busy}>
          {copy.account.submit}
        </Button>
      </form>
    </section>
  )
}

export default AccountPage
