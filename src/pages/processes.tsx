import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

/** Stub: the curation/process content is out of scope for the catalog page. */
export default function ProcessesPage() {
  return (
    <div className="mx-auto max-w-xl space-y-4 py-10 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Nosso processo de curadoria</h1>
      <p className="text-muted-foreground">
        Esta página apresentará como selecionamos produtores, avaliamos qualidade e
        distribuímos para o seu negócio.
      </p>
      <Button asChild variant="outline">
        <Link to="/produtos">Ver produtos</Link>
      </Button>
    </div>
  )
}
