export type RouteCase = { path: string; title: string; h1: RegExp }

export const ROUTE_CASES: RouteCase[] = [
  { path: '/', title: 'Naturee Food Hub', h1: /Curadoria & distribuição/ },
  { path: '/sobre', title: 'Sobre · Naturee Food Hub', h1: /Conectando produtores/ },
  { path: '/marcas-e-produtos', title: 'Marcas & Produtos · Naturee Food Hub', h1: /Uma seleção de boas origens/ },
  { path: '/logistica', title: 'Logística · Naturee Food Hub', h1: /Cuidado em cada rota/ },
  { path: '/contato', title: 'Contato · Naturee Food Hub', h1: /Boas conexões começam/ },
]

export const WHATSAPP_URL = 'https://wa.me/5548991963383'
