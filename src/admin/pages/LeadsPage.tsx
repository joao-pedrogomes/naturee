import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '@/admin/api/adminApi'
import type { Lead, LeadList, LeadStatus } from '@/admin/api/types'
import { copy } from '@/admin/copy'
import { formatDate } from '@/admin/format'
import Button from '@/admin/ui/Button'
import AdminTitle from '@/admin/ui/AdminTitle'
import Notice from '@/admin/ui/Notice'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

type Filter = LeadStatus | 'all'

const FILTERS: Filter[] = ['all', 'new', 'read', 'archived']
const SEARCH_DELAY_MS = 300

function countFor(filter: Filter, list: LeadList | undefined): number | undefined {
  if (!list) return undefined
  if (filter === 'all') return list.counts.new + list.counts.read + list.counts.archived
  return list.counts[filter]
}

function LeadsPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [term, setTerm] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [list, setList] = useState<LeadList>()
  const [failed, setFailed] = useState(false)
  const [selected, setSelected] = useState<Lead>()
  const [actionFailed, setActionFailed] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(term)
      setPage(1)
    }, SEARCH_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [term])

  const load = useCallback(async () => {
    try {
      setList(await adminApi.listLeads({ status: filter === 'all' ? undefined : filter, q: query, page }))
      setFailed(false)
    } catch (failure) {
      console.error('could not load leads', failure)
      setFailed(true)
    }
  }, [filter, query, page])

  useEffect(() => {
    void load()
  }, [load])

  async function attempt(action: () => Promise<void>) {
    setActionFailed(false)
    try {
      await action()
    } catch (failure) {
      console.error('lead action failed', failure)
      setActionFailed(true)
      await load()
    }
  }

  async function changeStatus(lead: Lead, status: LeadStatus) {
    await attempt(async () => {
      await adminApi.updateLead(lead.id, status)
      setSelected((current) => (current?.id === lead.id ? { ...current, status } : current))
      await load()
    })
  }

  async function open(lead: Lead) {
    setSelected(lead)
    if (lead.status === 'new') await changeStatus(lead, 'read')
  }

  async function remove(lead: Lead) {
    if (!window.confirm(copy.leads.confirmRemove)) return
    await attempt(async () => {
      await adminApi.deleteLead(lead.id)
      setSelected(undefined)
      await load()
    })
  }

  function pickFilter(next: Filter) {
    setFilter(next)
    setPage(1)
  }

  const lastPage = list ? Math.max(1, Math.ceil(list.total / list.pageSize)) : 1

  return (
    <section className="space-y-5">
      <AdminTitle page={copy.leads.title} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-heading text-4xl">{copy.leads.title}</h1>
        <a
          href="/api/admin/leads.csv"
          className="inline-flex min-h-11 items-center rounded-full border border-teal/30 bg-white px-5 text-sm font-semibold hover:bg-sand/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        >
          {copy.leads.export}
        </a>
      </div>

      <div role="tablist" aria-label={copy.leads.title} className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item}
            role="tab"
            type="button"
            aria-selected={filter === item}
            onClick={() => pickFilter(item)}
            className={cn(
              'min-h-11 rounded-full border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal',
              filter === item ? 'border-teal bg-teal text-sand' : 'border-teal/30 bg-white hover:bg-sand/60',
            )}
          >
            {copy.leads.tabs[item]} {countFor(item, list) === undefined ? '' : `(${countFor(item, list)})`}
          </button>
        ))}
      </div>

      <Input
        type="search"
        aria-label={copy.leads.search}
        placeholder={copy.leads.search}
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        className="h-12 max-w-md bg-white"
      />

      {failed ? <Notice tone="error">{copy.leads.failed}</Notice> : null}
      {actionFailed ? <Notice tone="error">{copy.leads.actionFailed}</Notice> : null}

      {list && list.leads.length === 0 ? <Notice tone="info">{copy.leads.empty}</Notice> : null}

      {list && list.leads.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <caption className="sr-only">{copy.leads.title}</caption>
            <thead className="border-b border-teal/10 text-teal/70">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">{copy.leads.columns.date}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{copy.leads.columns.name}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{copy.leads.columns.subject}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{copy.leads.columns.status}</th>
              </tr>
            </thead>
            <tbody>
              {list.leads.map((lead) => (
                <tr key={lead.id} className="border-b border-teal/5 last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(lead.createdAt)}</td>
                  <th scope="row" className="px-4 py-3 font-normal">
                    <button
                      type="button"
                      onClick={() => void open(lead)}
                      className={cn('min-h-11 text-left underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal', lead.status === 'new' && 'font-bold')}
                    >
                      {lead.name}
                      <span className="block text-xs font-normal text-teal/70">{lead.email}</span>
                    </button>
                  </th>
                  <td className="px-4 py-3">{lead.subject}</td>
                  <td className="px-4 py-3">
                    <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', lead.status === 'new' ? 'bg-olive text-white' : 'bg-sand text-teal')}>
                      {copy.leads.status[lead.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {list && lastPage > 1 ? (
        <div className="flex items-center gap-3">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>{copy.leads.previous}</Button>
          <span className="text-sm">{page} / {lastPage}</span>
          <Button variant="secondary" disabled={page >= lastPage} onClick={() => setPage(page + 1)}>{copy.leads.next}</Button>
        </div>
      ) : null}

      <Sheet open={selected !== undefined} onOpenChange={(open) => !open && setSelected(undefined)}>
        <SheetContent side="right" closeLabel={copy.close} className="w-[min(100vw,32rem)] bg-[#f7f4e6] text-teal sm:max-w-lg">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle className="font-heading text-2xl text-teal">{selected.name}</SheetTitle>
                <SheetDescription className="text-teal/70">
                  {selected.email} · {formatDate(selected.createdAt)}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 overflow-y-auto px-4 pb-6">
                <p className="text-base font-semibold">{selected.subject}</p>
                <p className="text-sm font-semibold text-teal/70">{copy.leads.message}</p>
                <p className="rounded-2xl bg-white p-4 text-base whitespace-pre-wrap">{selected.message}</p>
                <p className="text-sm text-teal/70">{selected.emailedAt ? copy.leads.emailed : copy.leads.notEmailed}</p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}
                    className="inline-flex min-h-11 items-center rounded-full bg-teal px-5 text-sm font-semibold text-sand hover:bg-teal/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                  >
                    {copy.leads.reply}
                  </a>
                  {selected.status === 'read' ? (
                    <Button variant="secondary" onClick={() => void changeStatus(selected, 'new')}>{copy.leads.markNew}</Button>
                  ) : null}
                  {selected.status === 'archived' ? (
                    <Button variant="secondary" onClick={() => void changeStatus(selected, 'read')}>{copy.leads.markRead}</Button>
                  ) : (
                    <Button variant="secondary" onClick={() => void changeStatus(selected, 'archived')}>{copy.leads.archive}</Button>
                  )}
                  <Button variant="danger" onClick={() => void remove(selected)}>{copy.leads.remove}</Button>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </section>
  )
}

export default LeadsPage
