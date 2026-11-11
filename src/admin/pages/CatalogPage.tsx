import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { ApiError, adminApi } from '@/admin/api/adminApi'
import type { FileItem } from '@/admin/api/types'
import { copy } from '@/admin/copy'
import { formatBytes } from '@/admin/format'
import Button from '@/admin/ui/Button'
import AdminTitle from '@/admin/ui/AdminTitle'
import Notice from '@/admin/ui/Notice'

const CATALOG_PATH = 'site.catalogPdfUrl'
const ORIGINAL_URL = '/catalogoNaturee.pdf'

function uploadProblem(failure: unknown): string {
  if (failure instanceof ApiError && failure.status === 413) return copy.catalog.tooLarge
  if (failure instanceof ApiError && failure.code === 'pdf_only') return copy.catalog.notPdf
  return copy.catalog.failed
}

function CatalogPage() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<FileItem[]>()
  const [maxBytes, setMaxBytes] = useState(0)
  const [activeUrl, setActiveUrl] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState<string>()
  const [message, setMessage] = useState<string>()

  const load = useCallback(async () => {
    try {
      const [listed, content] = await Promise.all([adminApi.listFiles(), adminApi.readContent()])
      setFiles(listed.files)
      setMaxBytes(listed.maxBytes)
      const field = content.fields.find((candidate) => candidate.path === CATALOG_PATH)
      setActiveUrl(typeof field?.value === 'string' ? field.value : undefined)
    } catch (failure) {
      console.error('could not load catalogs', failure)
      setProblem(copy.catalog.loadFailed)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setProblem(copy.catalog.notPdf)
      return
    }
    if (maxBytes && file.size > maxBytes) {
      setProblem(copy.catalog.tooLarge)
      return
    }
    setBusy(true)
    setProblem(undefined)
    setMessage(undefined)
    try {
      await adminApi.uploadFile(file.type === 'application/pdf' ? file : new File([file], file.name, { type: 'application/pdf' }))
      await load()
    } catch (failure) {
      console.error('catalog upload failed', failure)
      setProblem(uploadProblem(failure))
    } finally {
      setBusy(false)
    }
  }

  async function switchCatalog(url: string | null) {
    setProblem(undefined)
    setMessage(undefined)
    try {
      await adminApi.saveContent({ [CATALOG_PATH]: url })
      setMessage(copy.catalog.switched)
      await load()
    } catch (failure) {
      console.error('could not switch catalog', failure)
      setProblem(copy.catalog.switchFailed)
    }
  }

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(new URL(url, window.location.origin).toString())
      setMessage(copy.catalog.copied)
    } catch (failure) {
      console.error('clipboard unavailable', failure)
      setProblem(new URL(url, window.location.origin).toString())
    }
  }

  async function remove(item: FileItem) {
    if (!window.confirm(copy.catalog.confirmRemove)) return
    try {
      await adminApi.deleteFile(item.id)
      await load()
    } catch (failure) {
      setProblem(failure instanceof ApiError && failure.status === 409 ? copy.catalog.removeBlocked : copy.catalog.failed)
    }
  }

  const originalActive = activeUrl === ORIGINAL_URL

  return (
    <section className="space-y-5">
      <AdminTitle page={copy.catalog.title} />
      <h1 className="font-heading text-4xl">{copy.catalog.title}</h1>
      <p className="max-w-3xl text-sm text-teal/80">{copy.catalog.intro}</p>

      <div className="flex flex-wrap items-center gap-3">
        <input ref={fileInput} type="file" accept="application/pdf,.pdf" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={handleFile} />
        <Button disabled={busy} onClick={() => fileInput.current?.click()}>
          {busy ? copy.catalog.uploading : copy.catalog.upload}
        </Button>
        {maxBytes ? <p className="text-sm text-teal/70">{copy.catalog.limit(formatBytes(maxBytes))}</p> : null}
      </div>

      {problem ? <Notice tone="error">{problem}</Notice> : null}
      {message ? <Notice tone="success">{message}</Notice> : null}
      <p className="text-sm text-teal/70">{copy.catalog.linkHint}</p>

      <ul className="space-y-3">
        {files?.map((item) => {
          const active = activeUrl === item.url
          return (
            <li key={item.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <div className="min-w-48 flex-1">
                <p className="break-all font-semibold">{item.name}</p>
                <p className="text-sm text-teal/70">{formatBytes(item.size)}</p>
                {active ? <p className="text-xs font-semibold text-olive">{copy.catalog.current}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {!active ? <Button onClick={() => void switchCatalog(item.url)}>{copy.catalog.useAll}</Button> : null}
                <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-teal/30 px-5 text-sm font-semibold hover:bg-sand/60">
                  {copy.catalog.open}
                </a>
                <Button variant="secondary" onClick={() => void copyLink(item.url)}>{copy.catalog.copyLink}</Button>
                <Button variant="danger" disabled={item.inUse} onClick={() => void remove(item)}>{copy.catalog.remove}</Button>
              </div>
            </li>
          )
        })}
        {files && files.length === 0 ? <Notice tone="info">{copy.catalog.empty}</Notice> : null}

        <li className="flex flex-wrap items-center gap-3 rounded-2xl bg-white/70 p-4">
          <div className="min-w-48 flex-1">
            <p className="font-semibold">{copy.catalog.original}</p>
            <p className="text-sm text-teal/70">{copy.catalog.originalName}</p>
            {originalActive ? <p className="text-xs font-semibold text-olive">{copy.catalog.current}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {!originalActive ? <Button onClick={() => void switchCatalog(null)}>{copy.catalog.useAll}</Button> : null}
            <a href={ORIGINAL_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-teal/30 px-5 text-sm font-semibold hover:bg-sand/60">
              {copy.catalog.open}
            </a>
            <Button variant="secondary" onClick={() => void copyLink(ORIGINAL_URL)}>{copy.catalog.copyLink}</Button>
          </div>
        </li>
      </ul>
    </section>
  )
}

export default CatalogPage
