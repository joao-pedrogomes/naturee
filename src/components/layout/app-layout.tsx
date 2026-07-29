import { Link, NavLink, Outlet } from 'react-router-dom'
import { FileText, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useQuotation } from '@/context/quotation'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/produtos', label: 'Marcas & Produtos' },
  { to: '/processos', label: 'Curadoria' },
]

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Alternar tema"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </Button>
  )
}

function QuotationButton() {
  const { count } = useQuotation()

  return (
    <Button asChild variant="outline" size="sm" className="relative">
      <Link to="/orcamento" aria-label={`Orçamento com ${count} itens`}>
        <FileText className="size-4" />
        <span className="hidden sm:inline">Orçamento</span>
        {count > 0 ? (
          <Badge className="ml-1 h-5 min-w-5 justify-center px-1.5 tabular-nums">
            {count}
          </Badge>
        ) : null}
      </Link>
    </Button>
  )
}

export default function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link to="/" className="font-heading text-lg font-semibold tracking-tight">
            naturee
          </Link>
          <nav className="hidden items-center gap-4 text-sm md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'text-muted-foreground transition-colors hover:text-foreground',
                    isActive && 'text-foreground font-medium',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <QuotationButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto w-full max-w-6xl px-4 text-sm text-muted-foreground sm:px-6">
          Naturee Food Hub — curadoria de marcas e produtos para o seu negócio.
        </div>
      </footer>
    </div>
  )
}
