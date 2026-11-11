import zlib from 'node:zlib'
import { expect, type Page } from '@playwright/test'

export const ADMIN_EMAIL = 'admin@teste.com'
export const FIRST_PASSWORD = 'e2e test passphrase 2026'
export const NEW_PASSWORD = 'a brand new passphrase 2027'

export async function signIn(page: Page, password: string): Promise<void> {
  await page.goto('/admin/entrar')
  await page.getByLabel('E-mail').fill(ADMIN_EMAIL)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
}

export async function signInReady(page: Page): Promise<void> {
  await signIn(page, NEW_PASSWORD)
  await expect(page).toHaveURL(/\/admin\/contatos/)
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(zlib.crc32(body))
  return Buffer.concat([length, body, crc])
}

/** Opaque gradient PNG, enough for the browser to resize and re-encode as WebP. */
export function makePng(size = 64): Buffer {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header.set([8, 2, 0, 0, 0], 8)
  const rows = Buffer.alloc(size * (size * 3 + 1))
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) rows.set([x * 4, y * 4, 128], y * (size * 3 + 1) + 1 + x * 3)
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(rows)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

export const TINY_PNG = makePng()
