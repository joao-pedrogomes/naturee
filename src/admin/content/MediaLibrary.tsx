import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { ApiError, adminApi } from '@/admin/api/adminApi'
import type { MediaItem } from '@/admin/api/types'
import { copy } from '@/admin/copy'
import { formatBytes } from '@/admin/format'
import { ImageProblem, prepareImage } from '@/admin/imageProcessing'
import { fieldLabel } from '@/admin/content/labels'
import Button from '@/admin/ui/Button'
import Notice from '@/admin/ui/Notice'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type MediaLibraryProps = {
  onPick?: (item: MediaItem) => void
}

function uploadProblem(error: unknown): string {
  if (error instanceof ImageProblem) return copy.media[error.kind]
  if (error instanceof ApiError && error.status === 413) return copy.media.tooHeavy
  return copy.media.failed
}

function MediaLibrary({ onPick }: MediaLibraryProps) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<MediaItem[]>()
  const [alt, setAlt] = useState('')
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState<string>()

  const load = useCallback(async () => {
    try {
      setItems((await adminApi.listMedia()).media)
    } catch {
      setProblem(copy.media.failed)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setBusy(true)
    setProblem(undefined)
    try {
      const created = await adminApi.uploadMedia(await prepareImage(file), alt.trim())
      setAlt('')
      await load()
      if (onPick) onPick({ ...created, createdAt: '', usedBy: [] })
    } catch (failure) {
      setProblem(uploadProblem(failure))
    } finally {
      setBusy(false)
    }
  }

  async function remove(item: MediaItem) {
    if (!window.confirm(copy.media.confirmRemove)) return
    try {
      await adminApi.deleteMedia(item.id)
      await load()
    } catch (failure) {
      setProblem(failure instanceof ApiError && failure.status === 409 ? copy.media.removeBlocked : copy.media.failed)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1 space-y-2">
          <Label htmlFor="mediaAlt">{copy.media.altLabel}</Label>
          <Input id="mediaAlt" value={alt} maxLength={300} onChange={(event) => setAlt(event.target.value)} className="h-12 bg-white" />
        </div>
        <input ref={fileInput} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-label={copy.media.upload} onChange={handleFile} />
        <Button disabled={busy} onClick={() => fileInput.current?.click()}>
          {busy ? copy.media.uploading : copy.media.upload}
        </Button>
      </div>

      {problem ? <Notice tone="error">{problem}</Notice> : null}
      {items && items.length === 0 ? <Notice tone="info">{copy.media.empty}</Notice> : null}

      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {items?.map((item) => (
          <li key={item.id} className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
            <img src={`/media/${item.id}?w=720`} alt={item.alt} width={item.width} height={item.height} loading="lazy" className="aspect-[3/2] w-full object-cover" />
            <div className="flex flex-1 flex-col gap-2 p-3 text-sm">
              <p className="text-teal/70">{item.width}×{item.height} · {formatBytes(item.size)}</p>
              {item.usedBy.length > 0 ? (
                <p className="text-xs font-semibold text-olive">{copy.media.inUse}: {item.usedBy.map(fieldLabel).join(', ')}</p>
              ) : null}
              <div className="mt-auto flex flex-wrap gap-2">
                {onPick ? <Button onClick={() => onPick(item)}>{copy.media.pick}</Button> : null}
                <Button variant="danger" disabled={item.usedBy.length > 0} onClick={() => void remove(item)}>
                  {copy.media.remove}
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MediaLibrary
