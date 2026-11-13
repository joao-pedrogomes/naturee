import { buildImage } from '@/lib/images'
import type { SiteContent } from '@/content/types'

import homeHero1440 from '@/assets/images/homeHero-1440.webp'
import homeHero960 from '@/assets/images/homeHero-960.webp'
import homeHero640 from '@/assets/images/homeHero-640.webp'
import homeAbout800 from '@/assets/images/homeAbout-800.webp'
import homeAbout480 from '@/assets/images/homeAbout-480.webp'
import featureCuradoria800 from '@/assets/images/featureCuradoria-800.webp'
import featureCuradoria480 from '@/assets/images/featureCuradoria-480.webp'
import featureLogistica800 from '@/assets/images/featureLogistica-800.webp'
import featureLogistica480 from '@/assets/images/featureLogistica-480.webp'
import featureRede800 from '@/assets/images/featureRede-800.webp'
import featureRede480 from '@/assets/images/featureRede-480.webp'
import homeLogistics800 from '@/assets/images/homeLogistics-800.webp'
import homeLogistics480 from '@/assets/images/homeLogistics-480.webp'
import aboutHero1440 from '@/assets/images/aboutHero-1440.webp'
import aboutHero960 from '@/assets/images/aboutHero-960.webp'
import aboutHero640 from '@/assets/images/aboutHero-640.webp'
import aboutTeam800 from '@/assets/images/aboutTeam-800.webp'
import aboutTeam480 from '@/assets/images/aboutTeam-480.webp'
import aboutPurpose800 from '@/assets/images/aboutPurpose-800.webp'
import aboutPurpose480 from '@/assets/images/aboutPurpose-480.webp'
import featureEntrega800 from '@/assets/images/featureEntrega-800.webp'
import featureEntrega480 from '@/assets/images/featureEntrega-480.webp'
import featureRelacionamento800 from '@/assets/images/featureRelacionamento-800.webp'
import featureRelacionamento480 from '@/assets/images/featureRelacionamento-480.webp'
import productsHero1440 from '@/assets/images/productsHero-1440.webp'
import productsHero960 from '@/assets/images/productsHero-960.webp'
import productsHero640 from '@/assets/images/productsHero-640.webp'
import productsCatalog800 from '@/assets/images/productsCatalog-800.webp'
import productsCatalog480 from '@/assets/images/productsCatalog-480.webp'
import categoryFrescos800 from '@/assets/images/categoryFrescos-800.webp'
import categoryFrescos480 from '@/assets/images/categoryFrescos-480.webp'
import categoryAntepastos800 from '@/assets/images/categoryAntepastos-800.webp'
import categoryAntepastos480 from '@/assets/images/categoryAntepastos-480.webp'
import categoryLaticinios800 from '@/assets/images/categoryLaticinios-800.webp'
import categoryLaticinios480 from '@/assets/images/categoryLaticinios-480.webp'
import categoryMassas800 from '@/assets/images/categoryMassas-800.webp'
import categoryMassas480 from '@/assets/images/categoryMassas-480.webp'
import categoryCharcutaria800 from '@/assets/images/categoryCharcutaria-800.webp'
import categoryCharcutaria480 from '@/assets/images/categoryCharcutaria-480.webp'
import categoryGourmet800 from '@/assets/images/categoryGourmet-800.webp'
import categoryGourmet480 from '@/assets/images/categoryGourmet-480.webp'
import logisticsHero1440 from '@/assets/images/logisticsHero-1440.webp'
import logisticsHero960 from '@/assets/images/logisticsHero-960.webp'
import logisticsHero640 from '@/assets/images/logisticsHero-640.webp'
import logisticsMap1440 from '@/assets/images/logisticsMap-1440.webp'
import logisticsMap960 from '@/assets/images/logisticsMap-960.webp'
import logisticsMap640 from '@/assets/images/logisticsMap-640.webp'
import logisticsContact800 from '@/assets/images/logisticsContact-800.webp'
import logisticsContact480 from '@/assets/images/logisticsContact-480.webp'

import brandSitioPuraVida from '@/assets/logos/brandSitioPuraVida.svg'
import brandGranarolo from '@/assets/logos/brandGranarolo.svg'
import brandTartufoBrasil from '@/assets/logos/brandTartufoBrasil.svg'
import brandSalubi from '@/assets/logos/brandSalubi.svg'
import brandMassasDiNapoli from '@/assets/logos/brandMassasDiNapoli.svg'
import brandConfitHaus from '@/assets/logos/brandConfitHaus.svg'

const BANNER_HEIGHT = 596
const CARD_HEIGHT = 596
const BANNER_SIZES = '100vw'
const HALF_SIZES = '(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw'
const THIRD_SIZES = '(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw'

function banner(alt: string, variants: [string, string, string]) {
  return buildImage({
    alt,
    height: BANNER_HEIGHT,
    variants: [
      { src: variants[0], width: 1440 },
      { src: variants[1], width: 960 },
      { src: variants[2], width: 640 },
    ],
    sizes: BANNER_SIZES,
  })
}

function card(alt: string, variants: [string, string], sizes = THIRD_SIZES) {
  return buildImage({
    alt,
    height: CARD_HEIGHT,
    variants: [
      { src: variants[0], width: 800 },
      { src: variants[1], width: 480 },
    ],
    sizes,
  })
}

const WHATSAPP_NUMBER = '48 99196 3383'
const REGION_LINE = 'Atendemos o litoral catarinense, de Itajaí a Araranguá.'

export const defaultContent: SiteContent = {
  site: {
    name: 'Naturee Food Hub',
    tagline: 'Conectamos produtores, marcas e\ngastronomia com uma operação\norganizada, próxima e refrigerada.',
    whatsapp: WHATSAPP_NUMBER,
    whatsappLabel: '48 99196 3383',
    formWhatsapp: '48 99196 3383',
    whatsappCta: 'Fale com a Naturee',
    email: 'contato@natureefoodhub.com.br',
    instagram: 'natureealimentos',
    instagramUrl: 'https://www.instagram.com/natureealimentos',
    regionLine: 'Atendemos o litoral catarinense,\nde Itajaí a Araranguá.',
    catalogPdfUrl: '/catalogoNaturee.pdf',
    url: 'https://natureefoodhub.com.br',
    ogImage: '/ogDefault.jpg',
  },
  nav: [
    { id: 'home', label: 'Início', href: '/', enabled: true },
    { id: 'about', label: 'Sobre', href: '/sobre', enabled: true },
    { id: 'products', label: 'Marcas & Produtos', href: '/marcas-e-produtos', enabled: true },
    { id: 'logistics', label: 'Logística', href: '/logistica', enabled: true },
    { id: 'contact', label: 'Contato', href: '/contato', enabled: true },
  ],
  footerLinks: [
    { id: 'home', label: 'Início', href: '/', enabled: true },
    { id: 'about', label: 'Sobre a Naturee', href: '/sobre', enabled: true },
    { id: 'products', label: 'Marcas & Produtos', href: '/marcas-e-produtos', enabled: true },
    { id: 'logistics', label: 'Logística', href: '/logistica', enabled: true },
    { id: 'contact', label: 'Contato', href: '/contato', enabled: true },
  ],
  footer: {
    quickLinksTitle: 'Acesso rápido',
    contactTitle: 'Atendimento B2B',
    menuOpen: 'Abrir menu',
    menuClose: 'Fechar menu',
    menuTitle: 'Navegação',
    skipLink: 'Pular para o conteúdo',
  },
  trust: [
    { icon: 'package', title: '100% Seguro', text: 'Seus pedidos são processados\ncom total segurança' },
    { icon: 'trustRoute', title: 'Entrega em toda SC', text: 'Rápida, rastreável, no\nendereço cadastrado' },
    { icon: 'trustCheck', title: 'Produtos selecionados', text: 'Seleção exclusiva direto dos\nmelhores produtores de SC' },
    { icon: 'star', title: 'Garantia de qualidade', text: 'Garantia de originalidade e\nsegurança' },
  ],
  brands: [
    { id: 'sitio-pura-vida', name: 'Sítio Pura Vida', logo: { src: brandSitioPuraVida, alt: 'Logotipo Sítio Pura Vida', width: 280, height: 114 } },
    { id: 'granarolo', name: 'Granarolo Group', logo: { src: brandGranarolo, alt: 'Logotipo Granarolo Group', width: 268, height: 127 } },
    { id: 'tartufo-brasil', name: 'Tartufo Brasil', logo: { src: brandTartufoBrasil, alt: 'Logotipo Tartufo Brasil', width: 278, height: 111 } },
    { id: 'salubi', name: 'Salubi Iogurte', logo: { src: brandSalubi, alt: 'Logotipo Salubi Iogurte', width: 261, height: 112 } },
    { id: 'massas-di-napoli', name: 'Massas Di Napoli', logo: { src: brandMassasDiNapoli, alt: 'Logotipo Massas Di Napoli', width: 147, height: 166 } },
    { id: 'confit-haus', name: 'Confit Haus', logo: { src: brandConfitHaus, alt: 'Logotipo Confit Haus — Arte em Pote', width: 343, height: 78 } },
  ],
  categories: [
    { id: 'frescos', name: 'Frescos & Naturais', blurb: 'Ingredientes frescos e selecionados.', image: card('Cogumelos, tomates e hortaliças frescas sobre uma mesa de madeira', [categoryFrescos800, categoryFrescos480]) },
    { id: 'antepastos', name: 'Antepastos\n& Conservas', blurb: 'Sabores especiais para diferentes preparos.', image: card('Potes de patês e conservas Sítio Pura Vida sobre fundo verde', [categoryAntepastos800, categoryAntepastos480]) },
    { id: 'laticinios', name: 'Laticínios', blurb: 'Variedade para compor seu cardápio.', image: card('Queijo, iogurtes e leite Salubi sobre uma tábua de madeira', [categoryLaticinios800, categoryLaticinios480]) },
    { id: 'massas', name: 'Massas Artesanais', blurb: 'Tradição e sabor em cada preparo.', image: card('Mãos preparando massa fresca artesanal com farinha e ovos', [categoryMassas800, categoryMassas480]) },
    { id: 'charcutaria', name: 'Charcutaria\nArtesanal', blurb: 'Cortes e sabores que fazem a diferença.', image: card('Tábua de charcutaria com embutidos, queijos e uma taça de vinho', [categoryCharcutaria800, categoryCharcutaria480]) },
    { id: 'gourmet', name: 'Especialidades\nGourmet', blurb: 'Ingredientes especiais para novas criações.', image: card('Molho de tomate Confit Haus, azeite trufado, figos e trufas', [categoryGourmet800, categoryGourmet480]) },
  ],
  pages: {
    home: {
      enabled: true,
      seo: {
        title: 'Naturee Food Hub',
        description: 'Curadoria e distribuição refrigerada de produtos especiais para restaurantes, hotéis, empórios e supermercados no litoral catarinense.',
      },
      hero: {
        title: '*Curadoria &\ndistribuição* para\n**produtos especiais**',
        text: 'Conectamos produtores, marcas e gastronomia com uma operação organizada, próxima e refrigerada.',
        image: banner('Queijos, patês e conservas Sítio Pura Vida sobre uma mesa escura', [homeHero1440, homeHero960, homeHero640]),
        primary: { label: 'Acessar catálogo', href: '#catalog' },
        secondary: { label: 'Saiba mais', href: '/sobre' },
      },
      ticker: [
        { icon: 'snowflake', label: 'Logística refrigerada' },
        { icon: 'truck', label: 'Rotas organizadas' },
        { icon: 'zap', label: 'Abastecimento prático' },
        { icon: 'shieldCheck', label: 'Entrega garantida' },
      ],
      about: {
        label: 'Sobre nós',
        title: 'Mais do que distribuir,\n*conectamos*.',
        paragraphs: [
          'A **Naturee Food Hub** conecta produtores, marcas e operações gastronômicas por meio de uma **curadoria especializada, distribuição organizada e logística refrigerada**.',
          '**Facilitamos o acesso** a produtos especiais, aproximando boas origens de quem valoriza qualidade e praticidade.',
        ],
        image: card('Fachada do galpão da Naturee Food Hub com portão verde', [homeAbout800, homeAbout480], HALF_SIZES),
        cta: { label: 'Saiba mais', href: '/sobre' },
      },
      features: {
        label: 'Diferenciais',
        cards: [
          { title: 'Curadoria', text: 'Seleção de marcas e\nprodutos especiais.', image: card('Mesa com queijos, embutidos, conservas e laticínios selecionados', [featureCuradoria800, featureCuradoria480]) },
          { title: 'Logística\nRefrigerada', text: 'Cuidado no transporte\ne no frescor.', image: card('Funcionário organizando caixas dentro de uma câmara refrigerada', [featureLogistica800, featureLogistica480]) },
          { title: 'Rede\nOrganizada', text: 'Diferentes fornecedores\nem uma operação.', image: card('Funcionária conferindo estoque com prancheta em um armazém', [featureRede800, featureRede480]) },
        ],
      },
      brands: {
        label: 'Marcas parceiras',
        title: 'Boas *conexões* começam com\nboas *parcerias*.',
      },
      categories: {
        label: 'Destaque',
        title: 'Categorias *mais vendidas*',
        ids: ['gourmet', 'antepastos', 'laticinios'],
        cta: { label: 'Saiba mais', href: '/marcas-e-produtos' },
      },
      logistics: {
        label: 'Logística & fechamento',
        title: '*Cuidado* em cada rota.',
        text: 'Atendemos o litoral catarinense, de Itajaí a Araranguá, com logística refrigerada e rotas programadas.',
        image: card('Caminhão da Naturee percorrendo uma estrada litorânea', [homeLogistics800, homeLogistics480], HALF_SIZES),
        cta: { label: 'Entenda nossa logística', href: '/logistica' },
      },
      closing: {
        label: 'Sua próxima seleção começa aqui',
        title: 'Boas origens para\ngrandes *criações*.',
        text: 'Uma curadoria de produtos especiais, com distribuição organizada e atendimento próximo para facilitar a rotina da sua operação.',
        bullets: [
          'Produtos de diferentes fornecedores',
          'Logística refrigerada e rotas programadas',
          'Atendimento comercial próximo e especializado',
        ],
        card: {
          title: 'Vamos encontrar a seleção ideal\npara sua operação?',
          text: 'Conheça nosso portfólio ou consulte produtos e condições comerciais com nossa equipe.',
          primary: { label: 'Acessar catálogo', href: '#catalog' },
          secondary: { label: 'Falar pelo WhatsApp', href: '#whatsapp', message: 'Olá, Naturee! Gostaria de consultar produtos e condições comerciais.' },
          note: REGION_LINE,
        },
      },
    },
    about: {
      enabled: true,
      seo: {
        title: 'Sobre',
        description: 'Conheça a Naturee Food Hub: uma rede de curadoria, distribuição refrigerada e relacionamento que conecta produtores, marcas e gastronomia.',
      },
      hero: {
        title: '*Conectando*\nprodutores, marcas\n& gastronomia.',
        image: banner('Galpão, vans e caixas da Naturee Food Hub', [aboutHero1440, aboutHero960, aboutHero640]),
      },
      about: {
        label: 'Sobre nós',
        title: 'Mais do que distribuir,\n*conectamos*.',
        paragraphs: [
          'A **Naturee Food Hub** é uma parceira estratégica para marcas, produtores e negócios gastronômicos que **buscam uma distribuição mais inteligente, organizada e próxima.**',
          'Unimos curadoria, relacionamento comercial e logística refrigerada para **facilitar o abastecimento, fortalecer parcerias e criar novas oportunidades** para todos que fazem parte dessa rede.',
        ],
        image: card('Entregador da Naturee descarregando caixas de um caminhão', [aboutTeam800, aboutTeam480], HALF_SIZES),
      },
      history: {
        label: 'Nossa história',
        title: 'Uma história em *movimento*.',
        paragraphs: [
          'A Naturee nasceu da necessidade de levar os cogumelos do Sítio Pura Vida a diferentes\noperações gastronômicas. Com o crescimento da distribuição, novos produtores e\nmarcas passaram a fazer parte desse caminho, ampliando a variedade de produtos e\nas possibilidades de atendimento.',
          'O que começou como uma solução logística evoluiu para uma rede de curadoria,\ndistribuição e relacionamento. Hoje, a Naturee Food Hub conecta boas origens a\nnegócios gastronômicos por meio de uma operação mais organizada, próxima e\nespecializada.',
        ],
      },
      purpose: {
        label: 'Nosso propósito',
        title: '*Boas* origens merecem\nchegar *mais longe*.',
        text: 'Nosso propósito é *criar conexões* entre quem produz\ne quem transforma ingredientes em experiências\ngastronômicas, valorizando qualidade, frescor e\nrelações de confiança.',
        image: card('Caminhão da Naturee em uma estrada à beira-mar', [aboutPurpose800, aboutPurpose480], HALF_SIZES),
      },
      features: [
        { title: 'Curadoria', text: 'Seleção de marcas e\nprodutos especiais.', image: card('Mesa com queijos, embutidos, conservas e laticínios selecionados', [featureCuradoria800, featureCuradoria480]) },
        { title: 'Logística', text: 'Distribuição refrigerada\ne rotas organizadas.', image: card('Entregador da Naturee fechando a porta do caminhão refrigerado', [featureEntrega800, featureEntrega480]) },
        { title: 'Relacionamento', text: 'Proximidade com clientes\ne parceiros.', image: card('Aperto de mãos entre parceiros comerciais', [featureRelacionamento800, featureRelacionamento480]) },
      ],
      banner: {
        label: 'Faça parte da nossa rede',
        title: '*Boas conexões* movimentam\ngrandes oportunidades.',
        primary: { label: 'Conheça nossos produtos', href: '/marcas-e-produtos' },
        secondary: { label: 'Seja um parceiro', href: '/contato' },
      },
    },
    products: {
      enabled: true,
      seo: {
        title: 'Marcas & Produtos',
        description: 'Marcas parceiras e categorias de produtos especiais — frescos, antepastos, laticínios, massas, charcutaria e gourmet — para o food service.',
      },
      hero: {
        title: 'Uma seleção de *boas*\n*origens* e *grandes*\n*sabores*.',
        text: 'Conheça as marcas e categorias que fazem parte da Naturee Food Hub, reunidas para trazer mais variedade, qualidade e praticidade à sua operação.',
        image: banner('Colher retirando patê de cogumelos de um pote Sítio Pura Vida', [productsHero1440, productsHero960, productsHero640]),
        cta: { label: 'Acessar catálogo', href: '#catalog' },
      },
      categories: {
        label: 'Categorias de produtos',
        title: 'Produtos especiais para diferentes\nnecessidades.',
        text: 'Uma curadoria que reúne ingredientes frescos, produtos artesanais e\nespecialidades gastronômicas para o food service.',
        cta: { label: 'Baixar catálogo', href: '#catalog' },
      },
      brands: {
        label: 'Marcas parceiras',
        title: '*Boas marcas* fazem parte da nossa rede.',
        text: 'Trabalhamos com produtores e fornecedores selecionados, reunindo diferentes\nespecialidades em uma curadoria pensada para o mercado gastronômico.',
        partner: {
          label: 'Faça parte da nossa rede',
          title: 'Sua marca pode estar aqui.',
          text: 'Vamos construir novas conexões?',
          cta: { label: 'Seja um parceiro', href: '/contato' },
        },
      },
      catalog: {
        label: 'Catálogo Naturee Food Hub',
        title: 'Quer conhecer a *seleção*\n*completa?*',
        text: 'Explore nosso catálogo e descubra os produtos, marcas e opções disponíveis para sua operação.',
        image: card('Catálogo impresso da Naturee Food Hub sobre tábuas de madeira', [productsCatalog800, productsCatalog480], HALF_SIZES),
        cta: { label: 'Baixar catálogo', href: '#catalog' },
      },
      banner: {
        label: 'Atendimento comercial',
        title: '*Encontrou o que procura?*',
        cta: { label: 'Falar pelo WhatsApp', href: '#whatsapp', message: 'Olá, Naturee! Gostaria de saber mais sobre marcas e produtos disponíveis.' },
      },
    },
    logistics: {
      enabled: true,
      seo: {
        title: 'Logística',
        description: 'Distribuição refrigerada com rotas programadas no litoral de Santa Catarina, de Itajaí a Araranguá, para restaurantes, hotéis, empórios e supermercados.',
      },
      hero: {
        title: 'Cuidado em cada\n**rota.**',
        text: 'Distribuição especializada e logística\nrefrigerada para conectar produtos\nespeciais à sua operação.',
        image: banner('Van refrigerada da Naturee em frente ao galpão', [logisticsHero1440, logisticsHero960, logisticsHero640]),
        cta: { label: 'Fazer pedido', href: '#whatsapp', message: 'Olá, Naturee! Gostaria de fazer um pedido.' },
      },
      how: {
        label: 'Como funciona nossa distribuição',
        title: 'Uma operação pensada para *facilitar*\n*sua rotina.*',
        text: 'A Naturee reúne produtos de diferentes fornecedores e organiza sua\ndistribuição por meio de rotas programadas, trazendo mais praticidade e\norganização ao abastecimento de operações gastronômicas.',
        steps: [
          { title: 'Curadoria', text: 'Produtos de diferentes\nmarcas e fornecedores.' },
          { title: 'Organização', text: 'Pedidos alinhados à\nprogramação das rotas.' },
          { title: 'Distribuição', text: 'Logística refrigerada e\ncuidado no transporte.' },
        ],
      },
      regions: {
        label: 'Regiões atendidas',
        title: 'Estamos *em*\n*movimento* pelo litoral\ncatarinense!',
        text: 'Atendemos o **litoral de Santa Catarina**, *de Itajaí*\n*(extremo norte) a Araranguá (extremo sul)*, com\nentregas organizadas conforme as rotas de cada\nregião.',
        image: banner('Mapa de Santa Catarina destacando o litoral de Itajaí a Araranguá', [logisticsMap1440, logisticsMap960, logisticsMap640]),
      },
      audience: {
        label: 'Para quem distribuímos?',
        title: 'Produtos especiais para *diferentes*\n*operações*.',
        text: 'Nossa distribuição atende negócios que buscam qualidade,\nvariedade e praticidade no abastecimento.',
        items: [
          { icon: 'utensils', label: 'Restaurantes' },
          { icon: 'building', label: 'Hotéis' },
          { icon: 'store', label: 'Empórios' },
          { icon: 'basket', label: 'Supermercados' },
        ],
      },
      planning: {
        label: 'Entregas e planejamento',
        title: 'Cada região, uma *rota*\n*planejada*.',
        text: 'Trabalhamos com dias fixos de entrega, definidos\nconforme a região atendida. Para facilitar a\norganização, os pedidos devem ser realizados\ncom pelo menos dois dias de antecedência,\nrespeitando a programação das rotas.',
        boxes: [
          { icon: 'calendar', title: 'Rotas programadas', text: '*Consulte os dias* de entrega disponíveis\npara a sua região.' },
          { icon: 'clock', title: 'Pedidos com antecedência', text: 'Planeje seus pedidos com **pelo menos**\n**dois dias de antecedência**.' },
        ],
      },
      banner: {
        label: 'Fale com a Naturee',
        title: 'O próximo destino\npode ser *o seu negócio.*',
        text: 'Saiba mais sobre regiões atendidas, dias de entrega e\ndisponibilidade de produtos.',
        image: card('Atendente da Naturee sorrindo com fone de ouvido', [logisticsContact800, logisticsContact480], HALF_SIZES),
        cta: { label: 'Consultar minha região', href: '#whatsapp', message: 'Olá, Naturee! Gostaria de saber se vocês atendem a minha região e os dias de entrega.' },
      },
    },
    contact: {
      enabled: true,
      seo: {
        title: 'Contato',
        description: 'Fale com a Naturee Food Hub: conheça nossos produtos, consulte entregas ou proponha uma parceria.',
      },
      hero: {
        label: 'Fale com a Naturee',
        title: 'Boas conexões começam\ncom uma conversa.',
        text: 'Quer conhecer nossos produtos, consultar entregas ou\npropor uma parceria? Nossa equipe está pronta para\nconversar com você.',
      },
      form: {
        title: 'Envie sua *mensagem*',
        fields: { name: 'Nome', email: 'E-mail', subject: 'Assunto', message: 'Mensagem' },
        placeholders: { name: 'Seu nome', email: 'seuemail@exemplo.com', subject: 'Assunto...', message: 'Como podemos ajudar?' },
        submit: 'Enviar',
        submitting: 'Enviando...',
        success: {
          title: 'Mensagem pronta!',
          text: 'Abrimos o WhatsApp com a sua mensagem. Se a janela não apareceu, use o botão abaixo.',
          cta: 'Abrir WhatsApp',
        },
        errors: {
          required: 'Preencha este campo.',
          email: 'Informe um e-mail válido.',
          tooLong: 'Texto muito longo.',
          apiFailed: 'Não conseguimos registrar sua mensagem, mas você pode falar conosco pelo WhatsApp.',
          summary: 'Revise os campos destacados para enviar sua mensagem.',
        },
      },
    },
  },
  notFound: {
    seo: { title: 'Página não encontrada', description: 'A página que você procura não existe.' },
    title: 'Página não encontrada',
    text: 'O endereço que você acessou não existe ou foi movido.',
    cta: { label: 'Voltar ao início', href: '/' },
  },
}
