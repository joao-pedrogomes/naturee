/**
 * MOCK DATA — catálogo local de produtos (24 itens, 5 marcas).
 *
 * Substituído pela API quando o backend existir. Nenhum componente deve importar
 * este arquivo diretamente; o acesso passa por `src/lib/catalog.ts`.
 * Catálogo sem preço: a negociação acontece por orçamento.
 * As imagens são placeholders SVG gerados localmente, trocados por fotografia real
 * sem mudança de código.
 */
import type { Product } from '@/types/catalog'

import antepastoDeBerinjela from '@/assets/catalog/antepasto-de-berinjela.svg'
import castanhaDoPara from '@/assets/catalog/castanha-do-para.svg'
import cogumeloParis from '@/assets/catalog/cogumelo-paris.svg'
import doceDeLeiteCremoso from '@/assets/catalog/doce-de-leite-cremoso.svg'
import enoki from '@/assets/catalog/enoki.svg'
import eryngui from '@/assets/catalog/eryngui.svg'
import hiratakeOstra from '@/assets/catalog/hiratake-ostra.svg'
import hiratakeSalmao from '@/assets/catalog/hiratake-salmao.svg'
import melDeEucalipto from '@/assets/catalog/mel-de-eucalipto.svg'
import melSilvestre from '@/assets/catalog/mel-silvestre.svg'
import nozesEmMetades from '@/assets/catalog/nozes-em-metades.svg'
import pateIndianoCalcuttaDream from '@/assets/catalog/pate-indiano-calcutta-dream.svg'
import pateMediterraneoIbizaClub from '@/assets/catalog/pate-mediterraneo-ibiza-club.svg'
import pateOrientalThayland from '@/assets/catalog/pate-oriental-thayland.svg'
import pepinoEmConserva from '@/assets/catalog/pepino-em-conserva.svg'
import pimentaBiquinhoEmConserva from '@/assets/catalog/pimenta-biquinho-em-conserva.svg'
import portobello from '@/assets/catalog/portobello.svg'
import queijoColonialCurado from '@/assets/catalog/queijo-colonial-curado.svg'
import shiitake from '@/assets/catalog/shiitake.svg'
import shiitakeFatiado from '@/assets/catalog/shiitake-fatiado.svg'
import shimejiBranco from '@/assets/catalog/shimeji-branco.svg'
import shimejiBrancoMarinado from '@/assets/catalog/shimeji-branco-marinado.svg'
import shimejiPreto from '@/assets/catalog/shimeji-preto.svg'
import shitakeBabyMarinado from '@/assets/catalog/shitake-baby-marinado.svg'

export const products: Product[] = [
  // ── Sítio Pura Vida · cogumelos in natura ──────────────────────────────────
  {
    id: 'shiitake',
    slug: 'shiitake',
    name: 'Shiitake',
    subtitle: 'Inteiro · bandeja 200g',
    brandId: 'sitio-pura-vida',
    categoryId: 'cogumelos-in-natura',
    image: shiitake,
    description:
      'Chapéus firmes e uniformes, colhidos no ponto e resfriados em até duas horas. O corpo carnudo aguenta grelha, salteado e brasa sem perder estrutura, o que faz dele o coringa das cozinhas que servem prato vegetariano de saída. Colheita diária, com entrega no dia seguinte para a Grande Florianópolis.',
    specs: [
      { label: 'Peso', value: 'Bandeja de 200g' },
      { label: 'Embalagem', value: 'Bandeja com filme respirável, caixa com 12 unidades' },
      { label: 'Validade', value: '10 dias a partir da colheita' },
      { label: 'Conservação', value: 'Refrigerado entre 2 °C e 6 °C' },
      { label: 'Origem', value: 'Antônio Carlos, SC' },
    ],
    moq: { qty: 12, unit: 'un' },
    available: true,
    createdAt: '2025-09-08',
  },
  {
    id: 'shiitake-fatiado',
    slug: 'shiitake-fatiado',
    name: 'Shiitake fatiado',
    subtitle: 'Fatiado · bandeja 200g',
    brandId: 'sitio-pura-vida',
    categoryId: 'cogumelos-in-natura',
    image: shiitakeFatiado,
    description:
      'Mesma matéria-prima do shiitake inteiro, já fatiada em lâminas de 4 mm para uso direto na praça. Elimina o pré-preparo e padroniza a porção, reduzindo perda em operações de alto volume. Indicado para cozinhas com brigada enxuta e menu executivo.',
    specs: [
      { label: 'Peso', value: 'Bandeja de 200g' },
      { label: 'Embalagem', value: 'Bandeja selada, caixa com 12 unidades' },
      { label: 'Validade', value: '7 dias a partir do processamento' },
      { label: 'Conservação', value: 'Refrigerado entre 2 °C e 6 °C' },
      { label: 'Origem', value: 'Antônio Carlos, SC' },
    ],
    moq: { qty: 12, unit: 'un' },
    available: true,
    createdAt: '2025-10-02',
  },
  {
    id: 'shimeji-branco',
    slug: 'shimeji-branco',
    name: 'Shimeji branco',
    subtitle: 'Buquê · bandeja 200g',
    brandId: 'sitio-pura-vida',
    categoryId: 'cogumelos-in-natura',
    image: shimejiBranco,
    description:
      'Buquês fechados, de talo curto e textura crocante, ideais para saltear na manteiga em minutos. Rendimento alto e perda mínima, já que praticamente todo o buquê vai para o prato. Um dos itens de maior giro do sítio em restaurantes e rotisserias.',
    specs: [
      { label: 'Peso', value: 'Bandeja de 200g' },
      { label: 'Embalagem', value: 'Bandeja com filme respirável, caixa com 12 unidades' },
      { label: 'Validade', value: '10 dias a partir da colheita' },
      { label: 'Conservação', value: 'Refrigerado entre 2 °C e 6 °C' },
      { label: 'Origem', value: 'Antônio Carlos, SC' },
    ],
    moq: { qty: 12, unit: 'un' },
    available: true,
    createdAt: '2025-09-08',
  },
  {
    id: 'shimeji-preto',
    slug: 'shimeji-preto',
    name: 'Shimeji preto',
    subtitle: 'Buquê · bandeja 200g',
    brandId: 'sitio-pura-vida',
    categoryId: 'cogumelos-in-natura',
    image: shimejiPreto,
    description:
      'Versão de chapéu escuro, mais aromática e com sabor levemente amendoado. Sustenta bem molhos de longa redução e caldos, sem desmanchar. Boa opção de contraste visual em pratos que já usam o shimeji branco.',
    specs: [
      { label: 'Peso', value: 'Bandeja de 200g' },
      { label: 'Embalagem', value: 'Bandeja com filme respirável, caixa com 12 unidades' },
      { label: 'Validade', value: '10 dias a partir da colheita' },
      { label: 'Conservação', value: 'Refrigerado entre 2 °C e 6 °C' },
      { label: 'Origem', value: 'Antônio Carlos, SC' },
    ],
    moq: { qty: 12, unit: 'un' },
    available: true,
    createdAt: '2025-11-14',
  },
  {
    id: 'portobello',
    slug: 'portobello',
    name: 'Portobello',
    subtitle: 'Inteiro · bandeja 300g',
    brandId: 'sitio-pura-vida',
    categoryId: 'cogumelos-in-natura',
    image: portobello,
    description:
      'Chapéus abertos, de 8 a 11 cm, selecionados por calibre para servir como base de hambúrguer vegetal ou recheado ao forno. A lamela madura entrega sabor mais intenso e cor profunda depois de grelhado. Fornecemos calibre uniforme por caixa, o que facilita o custo por porção.',
    specs: [
      { label: 'Peso', value: 'Bandeja de 300g' },
      { label: 'Embalagem', value: 'Bandeja com filme respirável, caixa com 8 unidades' },
      { label: 'Validade', value: '8 dias a partir da colheita' },
      { label: 'Conservação', value: 'Refrigerado entre 2 °C e 6 °C' },
      { label: 'Origem', value: 'Antônio Carlos, SC' },
    ],
    moq: { qty: 8, unit: 'un' },
    available: true,
    createdAt: '2025-10-21',
  },
  {
    id: 'cogumelo-paris',
    slug: 'cogumelo-paris',
    name: 'Cogumelo Paris',
    subtitle: 'Inteiro · bandeja 200g',
    brandId: 'sitio-pura-vida',
    categoryId: 'cogumelos-in-natura',
    image: cogumeloParis,
    description:
      'O branco clássico, de sabor neutro e uso irrestrito: cru na salada, fatiado no risoto ou salteado como guarnição. Escolhido por calibre médio, que corta bem em lâminas regulares. Item de reposição constante para quem monta buffet ou menu rotativo.',
    specs: [
      { label: 'Peso', value: 'Bandeja de 200g' },
      { label: 'Embalagem', value: 'Bandeja com filme respirável, caixa com 12 unidades' },
      { label: 'Validade', value: '9 dias a partir da colheita' },
      { label: 'Conservação', value: 'Refrigerado entre 2 °C e 6 °C' },
      { label: 'Origem', value: 'Antônio Carlos, SC' },
    ],
    moq: { qty: 12, unit: 'un' },
    available: true,
    createdAt: '2025-09-25',
  },
  {
    id: 'hiratake-salmao',
    slug: 'hiratake-salmao',
    name: 'Hiratake salmão',
    subtitle: 'Buquê · bandeja 150g',
    brandId: 'sitio-pura-vida',
    categoryId: 'cogumelos-in-natura',
    image: hiratakeSalmao,
    description:
      'Cogumelo-ostra de cor rosada intensa, que se mantém viva depois de salteado rápido. Textura fibrosa e desfiável, muito usada como substituto de carne desfiada em receitas vegetais. Produção sazonal em lotes menores, com aviso prévio de disponibilidade.',
    specs: [
      { label: 'Peso', value: 'Bandeja de 150g' },
      { label: 'Embalagem', value: 'Bandeja com filme respirável, caixa com 10 unidades' },
      { label: 'Validade', value: '6 dias a partir da colheita' },
      { label: 'Conservação', value: 'Refrigerado entre 2 °C e 6 °C' },
      { label: 'Origem', value: 'Antônio Carlos, SC' },
    ],
    moq: { qty: 10, unit: 'un' },
    available: true,
    createdAt: '2026-01-19',
  },
  {
    id: 'hiratake-ostra',
    slug: 'hiratake-ostra',
    name: 'Hiratake ostra',
    subtitle: 'Buquê · bandeja 200g',
    brandId: 'sitio-pura-vida',
    categoryId: 'cogumelos-in-natura',
    image: hiratakeOstra,
    description:
      'Chapéus largos e acinzentados, de sabor suave e leve toque marinho. Absorve bem marinadas e dourar em fogo alto, o que rende crocância nas bordas. Alternativa de custo equilibrado para pratos de volume.',
    specs: [
      { label: 'Peso', value: 'Bandeja de 200g' },
      { label: 'Embalagem', value: 'Bandeja com filme respirável, caixa com 10 unidades' },
      { label: 'Validade', value: '6 dias a partir da colheita' },
      { label: 'Conservação', value: 'Refrigerado entre 2 °C e 6 °C' },
      { label: 'Origem', value: 'Antônio Carlos, SC' },
    ],
    moq: { qty: 10, unit: 'un' },
    available: true,
    createdAt: '2025-12-03',
  },
  {
    id: 'eryngui',
    slug: 'eryngui',
    name: 'Eryngui',
    subtitle: 'Inteiro · bandeja 200g',
    brandId: 'sitio-pura-vida',
    categoryId: 'cogumelos-in-natura',
    image: eryngui,
    description:
      'Talo grosso e denso que aceita corte em medalhões e vai bem selado na chapa. Praticamente não solta água, o que preserva o ponto e o rendimento por porção. É o item mais pedido por cozinhas que trabalham corte de "bife" vegetal.',
    specs: [
      { label: 'Peso', value: 'Bandeja de 200g' },
      { label: 'Embalagem', value: 'Bandeja com filme respirável, caixa com 10 unidades' },
      { label: 'Validade', value: '12 dias a partir da colheita' },
      { label: 'Conservação', value: 'Refrigerado entre 2 °C e 6 °C' },
      { label: 'Origem', value: 'Antônio Carlos, SC' },
    ],
    moq: { qty: 10, unit: 'un' },
    available: true,
    createdAt: '2026-02-11',
  },
  {
    id: 'enoki',
    slug: 'enoki',
    name: 'Enoki',
    subtitle: 'Buquê · bandeja 100g',
    brandId: 'sitio-pura-vida',
    categoryId: 'cogumelos-in-natura',
    image: enoki,
    description:
      'Talos finos e longos, de textura crocante, usados crus em saladas ou rapidamente escaldados em caldos. Exige cadeia de frio rigorosa e sai em lotes pequenos e programados. Trabalhamos com produção sob encomenda, com prazo combinado no orçamento.',
    specs: [
      { label: 'Peso', value: 'Bandeja de 100g' },
      { label: 'Embalagem', value: 'Bandeja selada, caixa com 20 unidades' },
      { label: 'Validade', value: '7 dias a partir da colheita' },
      { label: 'Conservação', value: 'Refrigerado entre 1 °C e 4 °C' },
      { label: 'Origem', value: 'Antônio Carlos, SC' },
    ],
    moq: { qty: 20, unit: 'un' },
    available: false,
    createdAt: '2026-03-06',
  },

  // ── Sítio Pura Vida · patês ────────────────────────────────────────────────
  {
    id: 'pate-mediterraneo-ibiza-club',
    slug: 'pate-mediterraneo-ibiza-club',
    name: 'Patê de cogumelos Mediterrâneo',
    subtitle: 'Ibiza Club · vidro 180g',
    brandId: 'sitio-pura-vida',
    categoryId: 'pates',
    image: pateMediterraneoIbizaClub,
    description:
      'Base de shiitake e hiratake com azeite, tomate seco, alcaparra e ervas do sítio. Perfil salgado e herbáceo que funciona em couvert, sanduíche frio e tábua de queijos. Envasado em lotes de até 200 vidros, sem conservantes artificiais.',
    specs: [
      { label: 'Peso', value: 'Vidro de 180g' },
      { label: 'Embalagem', value: 'Vidro com tampa twist-off, caixa com 6 unidades' },
      { label: 'Validade', value: '9 meses fechado' },
      { label: 'Conservação', value: 'Local seco; refrigerar após aberto e consumir em 7 dias' },
      { label: 'Origem', value: 'Antônio Carlos, SC' },
    ],
    moq: { qty: 6, unit: 'cx' },
    available: true,
    createdAt: '2025-11-27',
  },
  {
    id: 'pate-oriental-thayland',
    slug: 'pate-oriental-thayland',
    name: 'Patê de cogumelos Oriental',
    subtitle: 'Thayland · vidro 180g',
    brandId: 'sitio-pura-vida',
    categoryId: 'pates',
    image: pateOrientalThayland,
    description:
      'Shiitake e shimeji com gengibre, capim-limão e um fundo suave de leite de coco. Entrega acidez e picância leves, boas para entradas e para acompanhar peixes. Vem sendo adotado por casas asiáticas que querem uma opção vegetariana pronta.',
    specs: [
      { label: 'Peso', value: 'Vidro de 180g' },
      { label: 'Embalagem', value: 'Vidro com tampa twist-off, caixa com 6 unidades' },
      { label: 'Validade', value: '9 meses fechado' },
      { label: 'Conservação', value: 'Local seco; refrigerar após aberto e consumir em 7 dias' },
      { label: 'Origem', value: 'Antônio Carlos, SC' },
    ],
    moq: { qty: 6, unit: 'cx' },
    available: true,
    createdAt: '2025-11-27',
  },
  {
    id: 'pate-indiano-calcutta-dream',
    slug: 'pate-indiano-calcutta-dream',
    name: 'Patê de cogumelos Indiano',
    subtitle: 'Calcutta Dream · vidro 180g',
    brandId: 'sitio-pura-vida',
    categoryId: 'pates',
    image: pateIndianoCalcuttaDream,
    description:
      'Blend de cogumelos com curry tostado na hora, cúrcuma, coentro e um toque de castanha. O mais intenso dos três, pensado para pães fermentados e para compor bowls quentes. Lote pequeno e receita fechada com o chef parceiro do sítio.',
    specs: [
      { label: 'Peso', value: 'Vidro de 180g' },
      { label: 'Embalagem', value: 'Vidro com tampa twist-off, caixa com 6 unidades' },
      { label: 'Validade', value: '9 meses fechado' },
      { label: 'Conservação', value: 'Local seco; refrigerar após aberto e consumir em 7 dias' },
      { label: 'Origem', value: 'Antônio Carlos, SC' },
    ],
    moq: { qty: 6, unit: 'cx' },
    available: true,
    createdAt: '2026-04-15',
  },

  // ── Sítio Pura Vida · marinados ────────────────────────────────────────────
  {
    id: 'shitake-baby-marinado',
    slug: 'shitake-baby-marinado',
    name: 'Shitake baby',
    subtitle: 'Marinado · vidro 300g',
    brandId: 'sitio-pura-vida',
    categoryId: 'marinados',
    image: shitakeBabyMarinado,
    description:
      'Chapéus pequenos, colhidos antes da abertura total e marinados em azeite, alho e ervas. Chega pronto para a tábua, para antepasto ou para finalizar massas sem preparo extra. Ganho direto de tempo de praça, com validade longa fora da câmara fria.',
    specs: [
      { label: 'Peso', value: 'Vidro de 300g (peso drenado 180g)' },
      { label: 'Embalagem', value: 'Vidro com tampa twist-off, caixa com 6 unidades' },
      { label: 'Validade', value: '12 meses fechado' },
      { label: 'Conservação', value: 'Local seco e ao abrigo da luz; refrigerar após aberto' },
      { label: 'Origem', value: 'Antônio Carlos, SC' },
    ],
    moq: { qty: 6, unit: 'cx' },
    available: true,
    createdAt: '2026-01-08',
  },
  {
    id: 'shimeji-branco-marinado',
    slug: 'shimeji-branco-marinado',
    name: 'Shimeji branco',
    subtitle: 'Marinado · vidro 300g',
    brandId: 'sitio-pura-vida',
    categoryId: 'marinados',
    image: shimejiBrancoMarinado,
    description:
      'Buquês desfeitos e marinados com vinagre de maçã, louro e pimenta-do-reino em grão. Acidez calibrada para equilibrar tábuas de frios e pratos gordurosos. Alternativa de conveniência para casas que não têm giro para o produto fresco.',
    specs: [
      { label: 'Peso', value: 'Vidro de 300g (peso drenado 170g)' },
      { label: 'Embalagem', value: 'Vidro com tampa twist-off, caixa com 6 unidades' },
      { label: 'Validade', value: '12 meses fechado' },
      { label: 'Conservação', value: 'Local seco e ao abrigo da luz; refrigerar após aberto' },
      { label: 'Origem', value: 'Antônio Carlos, SC' },
    ],
    moq: { qty: 6, unit: 'cx' },
    available: true,
    createdAt: '2026-05-20',
  },

  // ── Mel do Vale ────────────────────────────────────────────────────────────
  {
    id: 'mel-silvestre',
    slug: 'mel-silvestre',
    name: 'Mel silvestre',
    subtitle: 'Puro · pote 500g',
    brandId: 'mel-do-vale',
    categoryId: 'mel-e-doces',
    image: melSilvestre,
    description:
      'Mel de floradas múltiplas de mata de altitude, extraído a frio e apenas decantado. Cor âmbar escura e sabor encorpado, que se sustenta em pães, queijos curados e drinques. Cada lote traz apiário e safra impressos no rótulo, útil para casas que comunicam origem.',
    specs: [
      { label: 'Peso', value: 'Pote de 500g' },
      { label: 'Embalagem', value: 'Pote de vidro, caixa com 12 unidades' },
      { label: 'Validade', value: '24 meses' },
      { label: 'Conservação', value: 'Temperatura ambiente, ao abrigo da luz' },
      { label: 'Origem', value: 'Bom Retiro, SC' },
    ],
    moq: { qty: 12, unit: 'un' },
    available: true,
    createdAt: '2025-09-30',
  },
  {
    id: 'mel-de-eucalipto',
    slug: 'mel-de-eucalipto',
    name: 'Mel de eucalipto',
    subtitle: 'Puro · pote 300g',
    brandId: 'mel-do-vale',
    categoryId: 'mel-e-doces',
    image: melDeEucalipto,
    description:
      'Florada única de eucalipto, mais clara e de dulçor mais direto que o silvestre. Cristaliza de forma fina e homogênea, o que agrada em porcionamento individual. O pote de 300g atende bem café da manhã de hotel e mesa posta.',
    specs: [
      { label: 'Peso', value: 'Pote de 300g' },
      { label: 'Embalagem', value: 'Pote de vidro, caixa com 12 unidades' },
      { label: 'Validade', value: '24 meses' },
      { label: 'Conservação', value: 'Temperatura ambiente, ao abrigo da luz' },
      { label: 'Origem', value: 'Bom Retiro, SC' },
    ],
    moq: { qty: 12, unit: 'un' },
    available: true,
    createdAt: '2026-02-24',
  },
  {
    id: 'doce-de-leite-cremoso',
    slug: 'doce-de-leite-cremoso',
    name: 'Doce de leite cremoso',
    subtitle: 'Tacho de cobre · vidro 400g',
    brandId: 'mel-do-vale',
    categoryId: 'mel-e-doces',
    image: doceDeLeiteCremoso,
    description:
      'Cozido lentamente em tacho de cobre, com leite integral da região e nada além de açúcar. Textura firme o suficiente para rechear e macia o bastante para servir na colher. Produção limitada ao volume de leite disponível na semana.',
    specs: [
      { label: 'Peso', value: 'Vidro de 400g' },
      { label: 'Embalagem', value: 'Vidro com tampa twist-off, caixa com 6 unidades' },
      { label: 'Validade', value: '10 meses fechado' },
      { label: 'Conservação', value: 'Local seco; refrigerar após aberto e consumir em 15 dias' },
      { label: 'Origem', value: 'Bom Retiro, SC' },
    ],
    moq: { qty: 6, unit: 'cx' },
    available: true,
    createdAt: '2026-06-09',
  },

  // ── Conservas da Serra ─────────────────────────────────────────────────────
  {
    id: 'pepino-em-conserva',
    slug: 'pepino-em-conserva',
    name: 'Pepino em conserva',
    subtitle: 'Agridoce · vidro 300g',
    brandId: 'conservas-da-serra',
    categoryId: 'conservas',
    image: pepinoEmConserva,
    description:
      'Pepinos pequenos, colhidos e envasados no mesmo dia, em salmoura agridoce com mostarda em grão. Mantêm crocância firme mesmo depois de meses no vidro, sem uso de conservantes artificiais. Calibre padronizado para fatiar em rodelas regulares no sanduíche.',
    specs: [
      { label: 'Peso', value: 'Vidro de 300g (peso drenado 180g)' },
      { label: 'Embalagem', value: 'Vidro com tampa twist-off, caixa com 12 unidades' },
      { label: 'Validade', value: '18 meses fechado' },
      { label: 'Conservação', value: 'Local seco; refrigerar após aberto' },
      { label: 'Origem', value: 'Urubici, SC' },
    ],
    moq: { qty: 12, unit: 'un' },
    available: true,
    createdAt: '2025-10-14',
  },
  {
    id: 'antepasto-de-berinjela',
    slug: 'antepasto-de-berinjela',
    name: 'Antepasto de berinjela',
    subtitle: 'Artesanal · vidro 240g',
    brandId: 'conservas-da-serra',
    categoryId: 'conservas',
    image: antepastoDeBerinjela,
    description:
      'Berinjela em cubos com pimentão assado, azeite e alho confitado, cozida em panela aberta. Serve como couvert pronto, base de bruschetta ou recheio de focaccia. A safra da berinjela define o calendário, então o item entra e sai do portfólio ao longo do ano.',
    specs: [
      { label: 'Peso', value: 'Vidro de 240g' },
      { label: 'Embalagem', value: 'Vidro com tampa twist-off, caixa com 6 unidades' },
      { label: 'Validade', value: '12 meses fechado' },
      { label: 'Conservação', value: 'Local seco; refrigerar após aberto e consumir em 10 dias' },
      { label: 'Origem', value: 'Urubici, SC' },
    ],
    moq: { qty: 6, unit: 'cx' },
    available: false,
    createdAt: '2026-03-25',
  },
  {
    id: 'pimenta-biquinho-em-conserva',
    slug: 'pimenta-biquinho-em-conserva',
    name: 'Pimenta biquinho em conserva',
    subtitle: 'Sem ardência · vidro 200g',
    brandId: 'conservas-da-serra',
    categoryId: 'conservas',
    image: pimentaBiquinhoEmConserva,
    description:
      'Pimenta biquinho inteira, sem ardência, conservada em vinagre de maçã e um toque de açúcar mascavo. Resolve finalização de saladas, tábuas e petiscos com cor viva e doçura leve. Item de custo baixo por porção e giro rápido em bar e bistrô.',
    specs: [
      { label: 'Peso', value: 'Vidro de 200g (peso drenado 120g)' },
      { label: 'Embalagem', value: 'Vidro com tampa twist-off, caixa com 12 unidades' },
      { label: 'Validade', value: '18 meses fechado' },
      { label: 'Conservação', value: 'Local seco; refrigerar após aberto' },
      { label: 'Origem', value: 'Urubici, SC' },
    ],
    moq: { qty: 12, unit: 'un' },
    available: true,
    createdAt: '2026-05-05',
  },

  // ── Castanhas Boa Terra ────────────────────────────────────────────────────
  {
    id: 'castanha-do-para',
    slug: 'castanha-do-para',
    name: 'Castanha-do-pará',
    subtitle: 'Inteira · pacote 500g',
    brandId: 'castanhas-boa-terra',
    categoryId: 'castanhas',
    image: castanhaDoPara,
    description:
      'Amêndoas inteiras de calibre médio, selecionadas à mão e embaladas a vácuo, sem sal e sem óleo. Compradas direto de cooperativas extrativistas, com rastreabilidade por lote. Atende confeitaria, granola e mise en place de cozinha sem etapa extra de limpeza.',
    specs: [
      { label: 'Peso', value: 'Pacote de 500g' },
      { label: 'Embalagem', value: 'Pacote a vácuo, caixa com 10 unidades' },
      { label: 'Validade', value: '6 meses a partir do envase' },
      { label: 'Conservação', value: 'Local fresco e seco; refrigerar após aberto' },
      { label: 'Origem', value: 'Beneficiado em Caxias do Sul, RS' },
    ],
    moq: { qty: 10, unit: 'un' },
    available: true,
    createdAt: '2025-12-16',
  },
  {
    id: 'nozes-em-metades',
    slug: 'nozes-em-metades',
    name: 'Nozes em metades',
    subtitle: 'Metades · pacote 400g',
    brandId: 'castanhas-boa-terra',
    categoryId: 'castanhas',
    image: nozesEmMetades,
    description:
      'Nozes de nogueiras familiares do Vale do Caí, descascadas e classificadas em metades limpas. O formato uniforme reduz quebra e melhora o acabamento em bolos, tortas e saladas. Volume ligado à safra de outono, com reserva antecipada recomendada.',
    specs: [
      { label: 'Peso', value: 'Pacote de 400g' },
      { label: 'Embalagem', value: 'Pacote a vácuo, caixa com 10 unidades' },
      { label: 'Validade', value: '6 meses a partir do envase' },
      { label: 'Conservação', value: 'Local fresco e seco; refrigerar após aberto' },
      { label: 'Origem', value: 'Vale do Caí, RS' },
    ],
    moq: { qty: 10, unit: 'un' },
    available: false,
    createdAt: '2026-06-30',
  },

  // ── Laticínios Vila Nova ───────────────────────────────────────────────────
  {
    id: 'queijo-colonial-curado',
    slug: 'queijo-colonial-curado',
    name: 'Queijo colonial curado',
    subtitle: 'Curado 60 dias · peça 800g',
    brandId: 'laticinios-vila-nova',
    categoryId: 'laticinios-artesanais',
    image: queijoColonialCurado,
    description:
      'Leite cru da ordenha da manhã, maturado sessenta dias em prateleira de madeira. Massa firme, casca natural e sabor que se acentua a cada semana de cura. Produção de propriedade única, com volume semanal limitado e reserva combinada no orçamento.',
    specs: [
      { label: 'Peso', value: 'Peça de 800g (variação de ±50g)' },
      { label: 'Embalagem', value: 'Peça inteira embalada a vácuo, caixa com 6 unidades' },
      { label: 'Validade', value: '90 dias a partir da embalagem' },
      { label: 'Conservação', value: 'Refrigerado entre 4 °C e 8 °C' },
      { label: 'Origem', value: 'Bento Gonçalves, RS' },
    ],
    moq: { qty: 6, unit: 'un' },
    available: true,
    createdAt: '2026-07-14',
  },
]
