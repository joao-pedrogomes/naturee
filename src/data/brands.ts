/**
 * MOCK DATA — catálogo local de marcas.
 *
 * Substituído pela API quando o backend existir. Nenhum componente deve importar
 * este arquivo diretamente; o acesso passa por `src/lib/catalog.ts`.
 * As imagens são placeholders SVG gerados localmente, trocados por fotografia real
 * sem mudança de código.
 */
import type { Brand } from '@/types/catalog'

import castanhasBoaTerraCover from '@/assets/catalog/brand-castanhas-boa-terra-cover.svg'
import castanhasBoaTerraLogo from '@/assets/catalog/brand-castanhas-boa-terra-logo.svg'
import conservasDaSerraCover from '@/assets/catalog/brand-conservas-da-serra-cover.svg'
import conservasDaSerraLogo from '@/assets/catalog/brand-conservas-da-serra-logo.svg'
import laticiniosVilaNovaCover from '@/assets/catalog/brand-laticinios-vila-nova-cover.svg'
import laticiniosVilaNovaLogo from '@/assets/catalog/brand-laticinios-vila-nova-logo.svg'
import melDoValeCover from '@/assets/catalog/brand-mel-do-vale-cover.svg'
import melDoValeLogo from '@/assets/catalog/brand-mel-do-vale-logo.svg'
import sitioPuraVidaCover from '@/assets/catalog/brand-sitio-pura-vida-cover.svg'
import sitioPuraVidaLogo from '@/assets/catalog/brand-sitio-pura-vida-logo.svg'

export const brands: Brand[] = [
  {
    id: 'sitio-pura-vida',
    slug: 'sitio-pura-vida',
    name: 'Sítio Pura Vida',
    tagline: 'Cogumelos frescos cultivados em pequena escala na Grande Florianópolis.',
    description:
      'Produção familiar de cogumelos em substrato próprio, com colheita diária e entrega em 24 horas para a Grande Florianópolis. Além do in natura, o sítio transforma o excedente em patês e marinados feitos em pequenos lotes. É a marca-casa do naturee Food Hub e a base do nosso calendário de colheita.',
    origin: 'Antônio Carlos, SC',
    logo: sitioPuraVidaLogo,
    cover: sitioPuraVidaCover,
    categoryIds: ['cogumelos-in-natura', 'pates', 'marinados'],
  },
  {
    id: 'mel-do-vale',
    slug: 'mel-do-vale',
    name: 'Mel do Vale',
    tagline: 'Mel de florada rastreada e doces de tacho da serra catarinense.',
    description:
      'Apiário familiar com pouco mais de duzentas colmeias distribuídas entre araucárias e pastagens de altitude. O mel é extraído a frio, sem pasteurização, e cada lote informa a florada e o apiário de origem. Os doces saem do mesmo tacho de cobre usado pela família há três gerações.',
    origin: 'Bom Retiro, SC',
    logo: melDoValeLogo,
    cover: melDoValeCover,
    categoryIds: ['mel-e-doces'],
  },
  {
    id: 'conservas-da-serra',
    slug: 'conservas-da-serra',
    name: 'Conservas da Serra',
    tagline: 'Conservas e antepastos em lotes pequenos, com hortaliças de agricultores vizinhos.',
    description:
      'Cozinha artesanal que trabalha só com hortaliças compradas de produtores num raio de trinta quilômetros, envasadas no mesmo dia da colheita. As receitas usam vinagre de maçã e nada de conservantes artificiais. A produção segue a safra, então o portfólio muda ao longo do ano.',
    origin: 'Urubici, SC',
    logo: conservasDaSerraLogo,
    cover: conservasDaSerraCover,
    categoryIds: ['conservas'],
  },
  {
    id: 'castanhas-boa-terra',
    slug: 'castanhas-boa-terra',
    name: 'Castanhas Boa Terra',
    tagline: 'Castanhas e nozes selecionadas à mão, sem sal e sem óleo.',
    description:
      'Beneficiadora da Serra Gaúcha que compra direto de cooperativas extrativistas e de nogueiras familiares do Vale do Caí. A seleção é manual, grão a grão, e a embalagem a vácuo preserva o frescor por seis meses. Fornece calibres padronizados para confeitaria e cozinha profissional.',
    origin: 'Caxias do Sul, RS',
    logo: castanhasBoaTerraLogo,
    cover: castanhasBoaTerraCover,
    categoryIds: ['castanhas'],
  },
  {
    id: 'laticinios-vila-nova',
    slug: 'laticinios-vila-nova',
    name: 'Laticínios Vila Nova',
    tagline: 'Queijo colonial de leite cru, maturado em câmara de madeira.',
    description:
      'Queijaria de propriedade única, com rebanho próprio de cinquenta vacas em pastejo rotacionado. Trabalha apenas com leite da ordenha da manhã e maturação lenta em prateleiras de madeira. O volume é limitado pela estação, por isso o portfólio é curto e propositalmente assim.',
    origin: 'Bento Gonçalves, RS',
    logo: laticiniosVilaNovaLogo,
    cover: laticiniosVilaNovaCover,
    categoryIds: ['laticinios-artesanais'],
  },
]
