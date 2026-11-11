import type { ContentChange, ContentField } from '@/admin/api/types'
import { copy } from '@/admin/copy'
import { displayedValue } from '@/admin/content/fieldValue'
import ImagePicker from '@/admin/content/ImagePicker'
import Button from '@/admin/ui/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Image } from '@/content/types'
import { cn } from '@/lib/utils'

type FieldEditorProps = {
  field: ContentField
  draft: ContentChange | undefined
  label: string
  error?: string
  onChange: (change: ContentChange) => void
}

const LONG_TEXT = 60

function isRestoring(draft: ContentChange | undefined): boolean {
  return draft === null
}

function hintFor(path: string): string | undefined {
  if (path.endsWith('.title')) return copy.content.markupHint
  if (path.endsWith('.href') || path.endsWith('Url')) return copy.content.linkHint
  return undefined
}

function FieldEditor({ field, draft, label, error, onChange }: FieldEditorProps) {
  const id = `field-${field.path}`
  const value = displayedValue(field, draft)
  const changed = draft !== undefined && draft !== null
  const canReset = isRestoring(draft) ? false : changed || field.overridden
  const hint = hintFor(field.path)

  const status = isRestoring(draft) ? (
    <span className="text-xs font-semibold text-teal/70">{copy.content.reset}…</span>
  ) : canReset ? (
    <Button variant="ghost" className="min-h-9 px-3 text-xs" onClick={() => onChange(null)}>
      {copy.content.reset}
    </Button>
  ) : null

  if (field.kind === 'image') {
    return (
      <div className={cn('space-y-2 rounded-2xl bg-white/60 p-4', changed && 'ring-2 ring-olive')}>
        <ImagePicker id={id} label={label} image={value as Image} onChange={onChange} />
        {error ? <p role="alert" className="text-sm font-semibold text-red-800">{error}</p> : null}
        <div>{status}</div>
      </div>
    )
  }

  if (field.kind === 'boolean') {
    return (
      <div className={cn('flex items-center justify-between gap-4 rounded-2xl bg-white/60 p-4', changed && 'ring-2 ring-olive')}>
        <label htmlFor={id} className="flex items-center gap-3 text-sm font-semibold">
          <input id={id} type="checkbox" role="switch" checked={value as boolean} onChange={(event) => onChange(event.target.checked)} className="size-5 accent-teal" />
          {label}
        </label>
        {status}
      </div>
    )
  }

  const text = value as string
  const multiline = text.length > LONG_TEXT || text.includes('\n')
  const shared = {
    id,
    value: text,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined,
    onChange: (event: { target: { value: string } }) => onChange(event.target.value),
    className: cn('bg-white', changed && 'ring-2 ring-olive', error && 'ring-2 ring-red-600'),
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {status}
      </div>
      {multiline ? <Textarea rows={Math.min(10, Math.max(3, Math.ceil(text.length / 70)))} {...shared} /> : <Input {...shared} className={cn('h-12', shared.className)} />}
      {hint ? <p id={`${id}-hint`} className="text-xs text-teal/70">{hint}</p> : null}
      {error ? <p id={`${id}-error`} role="alert" className="text-sm font-semibold text-red-800">{error}</p> : null}
    </div>
  )
}

export default FieldEditor
