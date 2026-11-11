import { copy } from '@/admin/copy'

type AdminTitleProps = { page: string }

function AdminTitle({ page }: AdminTitleProps) {
  return (
    <>
      <title>{`${page} · ${copy.title}`}</title>
      <meta name="robots" content="noindex, nofollow" />
    </>
  )
}

export default AdminTitle
