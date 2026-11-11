import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

type ImageJob = { source: string; name: string; widths: number[] }

const SOURCE_ROOT = path.resolve('plan-assets/Site')
const OUTPUT_DIR = path.resolve('src/assets/images')
const BANNER = [1440, 960, 640]
const CARD = [800, 480]
const WEBP_QUALITY = 76

const JOBS: ImageJob[] = [
  { source: '01. HOME/BANNER PRINCIPAL_home.webp', name: 'homeHero', widths: BANNER },
  { source: '01. HOME/BANNER sobre nos_home.webp', name: 'homeAbout', widths: CARD },
  { source: '01. HOME/CURADORIA_home.webp', name: 'featureCuradoria', widths: CARD },
  { source: '01. HOME/LOG REFRIGERADA_home.webp', name: 'featureLogistica', widths: CARD },
  { source: '01. HOME/REDE ORGANIZADA_home.webp', name: 'featureRede', widths: CARD },
  { source: '01. HOME/ROTA_FROTA_home.webp', name: 'homeLogistics', widths: CARD },
  { source: '02. SOBRE/Banner 01_sobre.webp', name: 'aboutHero', widths: BANNER },
  { source: '02. SOBRE/Banner 02_sobre.webp', name: 'aboutTeam', widths: CARD },
  { source: '02. SOBRE/Banner 03_sobre.webp', name: 'aboutPurpose', widths: CARD },
  { source: '02. SOBRE/LOGISTICA_imagem.webp', name: 'featureEntrega', widths: CARD },
  { source: '02. SOBRE/RELACIONAMENTO_imagem.webp', name: 'featureRelacionamento', widths: CARD },
  { source: '03. MARCAS E PRODUTOS/Banner 01_marcas e prod.webp', name: 'productsHero', widths: BANNER },
  { source: '03. MARCAS E PRODUTOS/CATALOGO_imagem.webp', name: 'productsCatalog', widths: CARD },
  { source: '03. MARCAS E PRODUTOS/CATEGORIAS_Produtos_frescos e naturais.webp', name: 'categoryFrescos', widths: CARD },
  { source: '03. MARCAS E PRODUTOS/CATEGORIAS_Produtos_antepastos e conservas.webp', name: 'categoryAntepastos', widths: CARD },
  { source: '03. MARCAS E PRODUTOS/CATEGORIAS_Produtos_laticíneos.webp', name: 'categoryLaticinios', widths: CARD },
  { source: '03. MARCAS E PRODUTOS/CATEGORIAS_Produtos_massas.webp', name: 'categoryMassas', widths: CARD },
  { source: '03. MARCAS E PRODUTOS/CATEGORIAS_Produtos_charcutaria.webp', name: 'categoryCharcutaria', widths: CARD },
  { source: '03. MARCAS E PRODUTOS/CATEGORIAS_Produtos_gourmet.webp', name: 'categoryGourmet', widths: CARD },
  { source: '04. LOGISTICA/BANNER 01_ logistica.webp', name: 'logisticsHero', widths: BANNER },
  { source: '04. LOGISTICA/mapa_ logistica.webp', name: 'logisticsMap', widths: BANNER },
  { source: '04. LOGISTICA/fale com_ logistica.webp', name: 'logisticsContact', widths: CARD },
]

function formatKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(0)} KB`
}

async function writeVariant(input: string, name: string, width: number): Promise<number> {
  const output = path.join(OUTPUT_DIR, `${name}-${width}.webp`)
  await sharp(input)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 6 })
    .toFile(output)
  const { size } = await fs.stat(output)
  return size
}

async function writeOgImage(): Promise<void> {
  const input = path.join(SOURCE_ROOT, '01. HOME/BANNER PRINCIPAL_home.webp')
  const output = path.resolve('public/ogDefault.jpg')
  await sharp(input)
    .resize({ width: 1200, height: 630, fit: 'cover', position: 'centre' })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(output)
}

async function run(): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  for (const job of JOBS) {
    const input = path.join(SOURCE_ROOT, job.source)
    const before = (await fs.stat(input)).size
    const sizes: string[] = []
    for (const width of job.widths) {
      const size = await writeVariant(input, job.name, width)
      sizes.push(`${width}w ${formatKb(size)}`)
    }
    console.log(`${job.name}: ${formatKb(before)} -> ${sizes.join(', ')}`)
  }

  await writeOgImage()
  console.log('public/ogDefault.jpg written')
}

await run()
