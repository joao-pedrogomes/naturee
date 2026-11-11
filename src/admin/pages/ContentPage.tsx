import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError, adminApi } from '@/admin/api/adminApi'
import type { ContentChange, ContentField, HistoryEntry } from '@/admin/api/types'
import { copy } from '@/admin/copy'
import { formatDate } from '@/admin/format'
import { groupFields } from '@/admin/content/contentGroups'
import FieldEditor from '@/admin/content/FieldEditor'
import { shortFieldLabel } from '@/admin/content/labels'
import Button from '@/admin/ui/Button'
import AdminTitle from '@/admin/ui/AdminTitle'
import Notice from '@/admin/ui/Notice'
import { cn } from '@/lib/utils'

type Outcome = { tone: 'success' | 'error'; text: string }

function ContentPage() {
  const [fields, setFields] = useState<ContentField[]>()
  const [drafts, setDrafts] = useState<Record<string, ContentChange>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState('home.hero')
  const [outcome, setOutcome] = useState<Outcome>()
  const [saving, setSaving] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>()

  const load = useCallback(async () => {
    try {
      setFields((await adminApi.readContent()).fields)
    } catch {
      setOutcome({ tone: 'error', text: copy.errors.generic })
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const pending = Object.keys(drafts).length

  useEffect(() => {
    if (pending === 0) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [pending])

  const pages = useMemo(() => groupFields(fields ?? []), [fields])
  const page = pages.find((candidate) => selected.startsWith(`${candidate.id}.`))
  const group = page?.groups.find((candidate) => candidate.id === selected)

  function setDraft(path: string, change: ContentChange) {
    setDrafts((current) => ({ ...current, [path]: change }))
    setErrors(({ [path]: _removed, ...rest }) => rest)
    setOutcome(undefined)
  }

  async function save() {
    setSaving(true)
    setOutcome(undefined)
    try {
      await adminApi.saveContent(drafts)
      setDrafts({})
      setErrors({})
      await load()
      setOutcome({ tone: 'success', text: copy.content.saved })
    } catch (failure) {
      const details = failure instanceof ApiError ? (failure.details as { fields?: Record<string, string> }) : undefined
      setErrors(details?.fields ?? {})
      setOutcome({ tone: 'error', text: copy.content.failed })
    } finally {
      setSaving(false)
    }
  }

  async function showHistory() {
    setHistory((await adminApi.contentHistory()).history)
  }

  async function restore(entry: HistoryEntry) {
    if (!window.confirm(copy.content.confirmRestore)) return
    await adminApi.restoreContent(entry.version)
    setDrafts({})
    setHistory(undefined)
    await load()
    setOutcome({ tone: 'success', text: copy.content.saved })
  }

  return (
    <section className="space-y-5">
      <AdminTitle page={copy.content.title} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-4xl">{copy.content.title}</h1>
          <p className="mt-1 text-teal/70">{copy.content.intro}</p>
        </div>
        <Button variant="secondary" onClick={() => void showHistory()}>{copy.content.history}</Button>
      </div>

      {outcome ? <Notice tone={outcome.tone}>{outcome.text}</Notice> : null}

      {history ? (
        <div className="space-y-2 rounded-2xl bg-white p-4">
          <h2 className="font-semibold">{copy.content.history}</h2>
          {history.length === 0 ? <p className="text-sm">{copy.content.historyEmpty}</p> : null}
          <ul className="divide-y divide-teal/10">
            {history.map((entry) => (
              <li key={entry.version} className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm">
                <span>{formatDate(entry.createdAt)} · {entry.createdBy} · {entry.edits} {copy.content.edits}</span>
                <Button variant="secondary" onClick={() => void restore(entry)}>{copy.content.restore}</Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <div className="space-y-2 lg:hidden">
          <label htmlFor="sectionPicker" className="text-sm font-semibold">{copy.content.section}</label>
          <select
            id="sectionPicker"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            className="h-12 w-full rounded-lg border border-input bg-white px-3 text-base"
          >
            {pages.map((item) => (
              <optgroup key={item.id} label={item.title}>
                {item.groups.map((entry) => (
                  <option key={entry.id} value={entry.id}>{entry.title}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <nav aria-label={copy.content.title} className="hidden space-y-3 lg:block">
          {pages.map((item) => (
            <details key={item.id} open={selected.startsWith(`${item.id}.`)} className="rounded-2xl bg-white p-2">
              <summary className="min-h-11 cursor-pointer rounded-xl px-3 py-2.5 font-semibold">{item.title}</summary>
              <ul>
                {item.groups.map((entry) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      aria-current={selected === entry.id ? 'true' : undefined}
                      onClick={() => setSelected(entry.id)}
                      className={cn(
                        'flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left text-sm hover:bg-sand/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal',
                        selected === entry.id && 'bg-sand font-semibold',
                      )}
                    >
                      {entry.title}
                      {entry.fields.some((field) => drafts[field.path] !== undefined) ? <span className="ml-2 size-2 rounded-full bg-olive" aria-label={copy.content.changed} /> : null}
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </nav>

        <div className="space-y-5">
          {group && page ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-heading text-3xl">{page.title} › {group.title}</h2>
                {page.path ? (
                  <a href={page.path} target="_blank" rel="noopener" className="text-sm font-semibold underline underline-offset-4">
                    {copy.content.viewPage}
                  </a>
                ) : null}
              </div>
              <div className="space-y-5">
                {group.fields.map((field) => (
                  <FieldEditor
                    key={field.path}
                    field={field}
                    draft={drafts[field.path]}
                    label={shortFieldLabel(field.path)}
                    error={errors[field.path]}
                    onChange={(change) => setDraft(field.path, change)}
                  />
                ))}
              </div>
            </>
          ) : (
            <p>{copy.loading}</p>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-teal/10 bg-[#f7f4e6]/95 px-4 py-3 backdrop-blur">
        <Button disabled={pending === 0 || saving} onClick={() => void save()}>
          {saving ? copy.content.saving : copy.content.save}
        </Button>
        {pending > 0 ? (
          <>
            <span className="text-sm">{pending} {copy.content.pending}</span>
            <Button variant="ghost" onClick={() => setDrafts({})}>{copy.content.discard}</Button>
          </>
        ) : null}
      </div>
    </section>
  )
}

export default ContentPage
