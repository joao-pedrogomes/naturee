/**
 * MOCK DATA — catálogo local de categorias.
 *
 * Substituído pela API quando o backend existir. Nenhum componente deve importar
 * este arquivo diretamente; o acesso passa por `src/lib/catalog.ts`.
 */
import type { Category } from '@/types/catalog'

export const categories: Category[] = [
  {
    id: 'cogumelos-in-natura',
    slug: 'cogumelos-in-natura',
    name: 'Cogumelos in natura',
  },
  {
    id: 'pates',
    slug: 'pates',
    name: 'Patês',
  },
  {
    id: 'marinados',
    slug: 'marinados',
    name: 'Marinados',
  },
  {
    id: 'conservas',
    slug: 'conservas',
    name: 'Conservas',
  },
  {
    id: 'mel-e-doces',
    slug: 'mel-e-doces',
    name: 'Mel e doces',
  },
  {
    id: 'castanhas',
    slug: 'castanhas',
    name: 'Castanhas',
  },
  {
    id: 'laticinios-artesanais',
    slug: 'laticinios-artesanais',
    name: 'Laticínios artesanais',
  },
]
