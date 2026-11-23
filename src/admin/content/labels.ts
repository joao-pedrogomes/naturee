const PAGES: Record<string, string> = {
  home: 'Início',
  about: 'Sobre',
  products: 'Marcas & Produtos',
  logistics: 'Logística',
  contact: 'Contato',
  privacy: 'Política de Privacidade',
}

const SECTIONS: Record<string, string> = {
  enabled: 'Página',
  seo: 'Google e redes sociais (SEO)',
  hero: 'Topo',
  ticker: 'Faixa de destaques',
  about: 'Sobre nós',
  features: 'Diferenciais',
  brands: 'Marcas parceiras',
  categories: 'Categorias',
  logistics: 'Logística',
  closing: 'Fechamento',
  history: 'Nossa história',
  purpose: 'Nosso propósito',
  banner: 'Banner final',
  how: 'Como funciona',
  regions: 'Regiões atendidas',
  audience: 'Para quem distribuímos',
  planning: 'Entregas e planejamento',
  catalog: 'Catálogo',
  partner: 'Sua marca pode estar aqui',
  form: 'Formulário',
  location: 'Localização e mapa',
  hours: 'Horário de funcionamento',
  social: 'Redes sociais',
}

const SEGMENTS: Record<string, string> = {
  rights: 'Direitos reservados (rodapé)',
  cookieMore: 'Aviso de cookies: link da política',
  privacyLink: 'Link da política de privacidade (rodapé)',
  updated: 'Data da última atualização',
  intro: 'Introdução',
  sections: 'Seções',
  cookieText: 'Aviso de cookies: texto',
  cookieAccept: 'Aviso de cookies: botão',
  cookieLabel: 'Aviso de cookies: nome para leitores de tela',
  title: 'Título',
  text: 'Texto',
  label: 'Rótulo',
  description: 'Descrição',
  image: 'Imagem',
  primary: 'Botão principal',
  secondary: 'Botão secundário',
  cta: 'Botão',
  href: 'Link',
  message: 'Mensagem do WhatsApp',
  note: 'Nota',
  paragraphs: 'Parágrafo',
  bullets: 'Item',
  cards: 'Cartão',
  steps: 'Passo',
  items: 'Item',
  boxes: 'Caixa',
  card: 'Cartão',
  fields: 'Campo',
  placeholders: 'Exemplo',
  errors: 'Mensagem de erro',
  success: 'Mensagem de sucesso',
  submit: 'Botão enviar',
  submitting: 'Botão enviando',
  enabled: 'Página ativa',
  logo: 'Logo',
  name: 'Nome',
  blurb: 'Resumo',
  seo: 'SEO',
  address: 'Endereço',
  cityLabel: 'Rótulo da cidade',
  city: 'Cidade',
  mapQuery: 'Endereço usado no mapa do Google',
  mapTitle: 'Descrição do mapa (acessibilidade)',
  daysLabel: 'Rótulo dos dias',
  days: 'Dias',
  timeLabel: 'Rótulo do horário',
  time: 'Horário',
}

const SITE: Record<string, string> = {
  name: 'Nome da empresa',
  tagline: 'Frase de apresentação (rodapé)',
  whatsapp: 'WhatsApp dos botões do site (com DDD)',
  whatsappLabel: 'WhatsApp como aparece escrito no site',
  whatsappCta: 'Texto do botão de WhatsApp',
  formWhatsapp: 'WhatsApp que recebe a mensagem do formulário',
  email: 'E-mail exibido no site',
  instagram: 'Instagram (nome exibido)',
  instagramUrl: 'Link do Instagram',
  regionLine: 'Região atendida (rodapé)',
  legalName: 'Razão social (nota legal do rodapé)',
  cnpj: 'CNPJ (nota legal do rodapé)',
  legalAddress: 'Endereço completo (nota legal do rodapé)',
  creditName: 'Crédito do site (rodapé): nome',
  creditWhatsapp: 'Crédito do site (rodapé): WhatsApp (com DDD)',
  catalogPdfUrl: 'Link do catálogo em PDF',
}

const GROUPS: Record<string, string> = {
  nav: 'Menu principal',
  footerLinks: 'Links do rodapé',
  footer: 'Textos do rodapé',
  trust: 'Faixa de confiança (rodapé)',
  brands: 'Marcas parceiras (logos)',
  categories: 'Categorias de produtos',
  notFound: 'Página não encontrada (404)',
}

function segmentLabel(segment: string): string {
  if (/^\d+$/.test(segment)) return String(Number(segment) + 1)
  return SEGMENTS[segment] ?? segment
}

export function pageLabel(key: string): string {
  return PAGES[key] ?? GROUPS[key] ?? key
}

export function sectionLabel(key: string): string {
  return SECTIONS[key] ?? GROUPS[key] ?? key
}

/** Readable name for a content path, e.g. `pages.home.hero.title` → "Início › Topo › Título". */
export function fieldLabel(path: string): string {
  const [first, second, third, ...rest] = path.split('.')
  if (first === 'site') return SITE[second] ?? second
  if (first === 'pages') {
    const section = third === undefined ? '' : sectionLabel(third)
    const tail = rest.map(segmentLabel).join(' › ')
    return [pageLabel(second), section, tail].filter(Boolean).join(' › ')
  }
  return [GROUPS[first] ?? first, ...[second, third, ...rest].filter(Boolean).map((part) => segmentLabel(part as string))].join(' › ')
}

/** Label shown inside a section form, without the page and section prefix. */
export function shortFieldLabel(path: string): string {
  const parts = path.split('.')
  if (parts[0] === 'site') return SITE[parts[1]] ?? parts[1]
  const tail = parts[0] === 'pages' ? parts.slice(3) : parts.slice(1)
  if (tail.length === 0) return segmentLabel(parts[parts.length - 1])
  return tail.map(segmentLabel).join(' › ')
}
