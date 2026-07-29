import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="space-y-6 py-10">
      <Badge variant="secondary">Naturee Food Hub</Badge>
      <h1 className="font-heading max-w-2xl text-4xl font-semibold tracking-tight">
        Marcas artesanais selecionadas para o seu negócio
      </h1>
      <p className="text-muted-foreground max-w-xl">
        Distribuímos produtos de pequenos produtores para restaurantes, mercados e
        empórios. Monte sua lista e receba um orçamento da nossa equipe.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/produtos">Ver marcas e produtos</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/processos">Como funciona a curadoria</Link>
        </Button>
      </div>
    </div>
  )
}
