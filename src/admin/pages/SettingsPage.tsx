import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ApiError, adminApi } from '@/admin/api/adminApi'
import type { AdminSettings, ContentChange, ContentField } from '@/admin/api/types'
import { copy } from '@/admin/copy'
import FieldEditor from '@/admin/content/FieldEditor'
import { fieldLabel } from '@/admin/content/labels'
import Button from '@/admin/ui/Button'
import AdminTitle from '@/admin/ui/AdminTitle'
import Notice from '@/admin/ui/Notice'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Outcome = { tone: 'success' | 'error'; text: string }

function SettingsPage() {
  const [fields, setFields] = useState<ContentField[]>()
  const [settings, setSettings] = useState<AdminSettings>()
  const [drafts, setDrafts] = useState<Record<string, ContentChange>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [outcome, setOutcome] = useState<Outcome>()
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const [content, mail] = await Promise.all([adminApi.readContent(), adminApi.readSettings()])
    setFields(content.fields.filter((field) => field.path.startsWith('site.') && field.kind === 'text'))
    setSettings(mail)
  }, [])

  useEffect(() => {
    load().catch(() => setOutcome({ tone: 'error', text: copy.errors.generic }))
  }, [load])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!settings) return
    setSaving(true)
    setOutcome(undefined)
    try {
      await adminApi.saveSettings({ leadNotifyEmail: settings.leadNotifyEmail, emailEnabled: settings.emailEnabled })
      if (Object.keys(drafts).length > 0) await adminApi.saveContent(drafts)
      setDrafts({})
      setErrors({})
      await load()
      setOutcome({ tone: 'success', text: copy.settings.saved })
    } catch (failure) {
      const details = failure instanceof ApiError ? (failure.details as { fields?: Record<string, string> }) : undefined
      setErrors(details?.fields ?? {})
      setOutcome({ tone: 'error', text: copy.settings.failed })
    } finally {
      setSaving(false)
    }
  }

  if (!fields || !settings) return <p>{outcome?.text ?? copy.loading}</p>

  return (
    <section className="max-w-2xl space-y-6">
      <AdminTitle page={copy.settings.title} />
      <h1 className="font-heading text-4xl">{copy.settings.title}</h1>
      {outcome ? <Notice tone={outcome.tone}>{outcome.text}</Notice> : null}

      <form onSubmit={handleSubmit} className="space-y-8">
        <fieldset className="space-y-5">
          <legend className="mb-3 font-heading text-2xl">{copy.settings.contactTitle}</legend>
          {fields.map((field) => (
            <FieldEditor
              key={field.path}
              field={field}
              draft={drafts[field.path]}
              label={fieldLabel(field.path)}
              error={errors[field.path]}
              onChange={(change) => setDrafts((current) => ({ ...current, [field.path]: change }))}
            />
          ))}
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="mb-3 font-heading text-2xl">{copy.settings.mailTitle}</legend>
          {settings.mailConfigured ? null : <Notice tone="info">{copy.settings.mailMissing}</Notice>}
          <div className="space-y-2">
            <Label htmlFor="notifyEmail">{copy.settings.mailEmail}</Label>
            <Input id="notifyEmail" type="email" value={settings.leadNotifyEmail} onChange={(event) => setSettings({ ...settings, leadNotifyEmail: event.target.value })} className="h-12 bg-white" />
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold">
            <input type="checkbox" role="switch" checked={settings.emailEnabled} onChange={(event) => setSettings({ ...settings, emailEnabled: event.target.checked })} className="size-5 accent-teal" />
            {copy.settings.mailEnabled}
          </label>
        </fieldset>

        <Button type="submit" disabled={saving}>{copy.settings.save}</Button>
      </form>
    </section>
  )
}

export default SettingsPage
