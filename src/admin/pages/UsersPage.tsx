import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ApiError, adminApi } from '@/admin/api/adminApi'
import type { AdminUser, TemporaryAccess } from '@/admin/api/types'
import { copy } from '@/admin/copy'
import { formatDate } from '@/admin/format'
import Button from '@/admin/ui/Button'
import AdminTitle from '@/admin/ui/AdminTitle'
import Notice from '@/admin/ui/Notice'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Outcome = { tone: 'success' | 'error'; text: string; access?: TemporaryAccess }

function failureText(error: unknown): string {
  if (!(error instanceof ApiError)) return copy.users.failed
  if (error.code === 'invalid_email') return copy.users.invalidEmail
  if (error.code === 'email_taken') return copy.users.taken
  if (error.code === 'last_user') return copy.users.lastUser
  return copy.users.failed
}

function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>()
  const [email, setEmail] = useState('')
  const [outcome, setOutcome] = useState<Outcome>()
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      setUsers((await adminApi.listUsers()).users)
    } catch (failure) {
      setOutcome({ tone: 'error', text: failureText(failure) })
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function run(action: () => Promise<Outcome>) {
    setBusy(true)
    setCopied(false)
    try {
      setOutcome(await action())
      await load()
    } catch (failure) {
      setOutcome({ tone: 'error', text: failureText(failure) })
    } finally {
      setBusy(false)
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await run(async () => {
      const access = await adminApi.createUser(email)
      setEmail('')
      return { tone: 'success', text: copy.users.created, access }
    })
  }

  async function handleReset(user: AdminUser) {
    if (!window.confirm(copy.users.confirmReset)) return
    await run(async () => ({ tone: 'success', text: copy.users.resetDone, access: await adminApi.resetUser(user.id) }))
  }

  async function handleRemove(user: AdminUser) {
    if (!window.confirm(copy.users.confirmRemove)) return
    await run(async () => {
      await adminApi.deleteUser(user.id)
      return { tone: 'success', text: copy.users.remove }
    })
  }

  async function copyPassword(password: string) {
    await navigator.clipboard.writeText(password).catch(() => undefined)
    setCopied(true)
  }

  return (
    <section className="space-y-6">
      <AdminTitle page={copy.users.title} />
      <div>
        <h1 className="font-heading text-4xl">{copy.users.title}</h1>
        <p className="mt-1 text-teal/70">{copy.users.intro}</p>
      </div>

      {outcome ? (
        <div className="space-y-3">
          <Notice tone={outcome.tone}>{outcome.text}</Notice>
          {outcome.access ? (
            <div className="space-y-2 rounded-2xl bg-white p-4">
              <p className="text-sm font-semibold">{outcome.access.email}</p>
              <p className="text-sm text-teal/70">{copy.users.password}: {copy.users.showOnce}</p>
              <div className="flex flex-wrap items-center gap-3">
                <code className="rounded-lg bg-sand px-3 py-2 text-lg font-bold tracking-wider select-all">{outcome.access.temporaryPassword}</code>
                <Button variant="secondary" onClick={() => void copyPassword(outcome.access!.temporaryPassword)}>
                  {copied ? copy.users.copied : copy.users.copy}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
        <div className="min-w-64 flex-1 space-y-2">
          <Label htmlFor="newUserEmail">{copy.users.email}</Label>
          <Input id="newUserEmail" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 bg-white" />
        </div>
        <Button type="submit" disabled={busy}>{copy.users.add}</Button>
      </form>

      {users ? (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">{copy.users.title}</caption>
            <thead className="border-b border-teal/10 text-teal/70">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">{copy.users.columns.email}</th>
                <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">{copy.users.columns.since}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{copy.users.columns.status}</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">{copy.users.remove}</span></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-teal/5 last:border-0">
                  <th scope="row" className="px-4 py-3 font-normal break-all">
                    {user.email}
                    {user.isSelf ? <span className="ml-2 rounded-full bg-sand px-2 py-0.5 text-xs font-semibold">{copy.users.you}</span> : null}
                  </th>
                  <td className="hidden px-4 py-3 whitespace-nowrap sm:table-cell">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">{user.mustChange ? copy.users.pending : copy.users.active}</td>
                  <td className="px-4 py-3">
                    {user.isSelf ? null : (
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="secondary" disabled={busy} onClick={() => void handleReset(user)}>{copy.users.reset}</Button>
                        <Button variant="danger" disabled={busy} onClick={() => void handleRemove(user)}>{copy.users.remove}</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}

export default UsersPage
