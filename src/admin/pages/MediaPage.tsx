import { copy } from '@/admin/copy'
import MediaLibrary from '@/admin/content/MediaLibrary'
import AdminTitle from '@/admin/ui/AdminTitle'

function MediaPage() {
  return (
    <section className="space-y-5">
      <AdminTitle page={copy.media.title} />
      <h1 className="font-heading text-4xl">{copy.media.title}</h1>
      <MediaLibrary />
    </section>
  )
}

export default MediaPage
