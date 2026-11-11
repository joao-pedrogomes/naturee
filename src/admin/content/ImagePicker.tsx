import { useState } from 'react'
import type { ContentChange } from '@/admin/api/types'
import { copy } from '@/admin/copy'
import MediaLibrary from '@/admin/content/MediaLibrary'
import Button from '@/admin/ui/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { Image } from '@/content/types'

type ImagePickerProps = {
  id: string
  label: string
  image: Image
  onChange: (change: ContentChange) => void
}

const MEDIA_SOURCE = /^\/media\/([a-f0-9]{16})/

function ImagePicker({ id, label, image, onChange }: ImagePickerProps) {
  const [open, setOpen] = useState(false)
  const mediaId = MEDIA_SOURCE.exec(image.src)?.[1]

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold">{label}</p>
      <div className="flex flex-wrap items-start gap-4">
        <img src={image.src} srcSet={image.srcSet} sizes="240px" alt={image.alt} width={image.width} height={image.height} className="aspect-[3/2] w-60 rounded-xl bg-white object-cover" />
        <div className="min-w-56 flex-1 space-y-3">
          <Button variant="secondary" onClick={() => setOpen(true)}>{copy.media.choose}</Button>
          <p className="text-xs text-teal/70">{copy.media.cropHint}</p>
          {mediaId ? (
            <div className="space-y-2">
              <Label htmlFor={`${id}-alt`}>{copy.media.altLabel}</Label>
              <Input id={`${id}-alt`} value={image.alt} maxLength={300} className="h-12 bg-white" onChange={(event) => onChange({ mediaId, alt: event.target.value })} />
            </div>
          ) : (
            <p className="text-sm text-teal/70">{image.alt}</p>
          )}
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" closeLabel={copy.close} className="w-[min(100vw,44rem)] bg-[#f7f4e6] text-teal sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle className="font-heading text-2xl text-teal">{copy.media.pick}</SheetTitle>
            <SheetDescription className="text-teal/70">{label}</SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <MediaLibrary
              onPick={(item) => {
                onChange({ mediaId: item.id, alt: item.alt || image.alt })
                setOpen(false)
              }}
              onPickBuiltin={(item) => {
                onChange({ ref: item.ref, alt: item.alt, src: item.src, srcSet: item.srcSet })
                setOpen(false)
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default ImagePicker
