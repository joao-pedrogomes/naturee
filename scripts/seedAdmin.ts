import { execFileSync } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const ITERATIONS = 100_000
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
const PASSWORD_FILE = path.join(os.homedir(), '.naturee_admin_password')
const TOKEN_FILE = path.join(os.homedir(), '.ssh', 'naturee_cloudflare_token')

function generatePassword(length = 24): string {
  return Array.from(crypto.randomBytes(length), (byte) => ALPHABET[byte % ALPHABET.length]).join('')
}

function sqlText(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

function run(): void {
  const email = process.argv[2]?.trim().toLowerCase()
  const remote = process.argv.includes('--remote')
  if (!email?.includes('@')) throw new Error('Usage: node scripts/seedAdmin.ts <email> [--remote]')

  const fixedPassword = process.env.SEED_PASSWORD
  const persistTo = process.argv.includes('--persist-to') ? process.argv[process.argv.indexOf('--persist-to') + 1] : undefined
  const password = fixedPassword ?? generatePassword()
  const salt = crypto.randomBytes(16)
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, 32, 'sha256')

  const sql = `INSERT INTO users (email, password_hash, salt, iterations, must_change)
VALUES (${sqlText(email)}, ${sqlText(hash.toString('base64'))}, ${sqlText(salt.toString('base64'))}, ${ITERATIONS}, 1)
ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash, salt = excluded.salt,
  iterations = excluded.iterations, must_change = 1;
DELETE FROM sessions WHERE user_id = (SELECT id FROM users WHERE email = ${sqlText(email)});
DELETE FROM rate_limits WHERE key LIKE 'login:%';
`
  const sqlFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'seed-')), 'seed.sql')
  fs.writeFileSync(sqlFile, sql, { mode: 0o600 })

  const env = { ...process.env }
  if (remote) env.CLOUDFLARE_API_TOKEN = fs.readFileSync(TOKEN_FILE, 'utf8').trim()

  try {
    execFileSync('npx', ['wrangler', 'd1', 'execute', 'naturee', remote ? '--remote' : '--local', ...(persistTo ? ['--persist-to', persistTo] : []), '--file', sqlFile], {
      env,
      stdio: ['ignore', 'ignore', 'inherit'],
    })
  } finally {
    fs.rmSync(path.dirname(sqlFile), { recursive: true, force: true })
  }

  if (fixedPassword) {
    console.log(`Admin ${email} ready with the password from SEED_PASSWORD`)
    return
  }
  fs.writeFileSync(PASSWORD_FILE, `${email}\n${password}\n`, { mode: 0o600 })
  console.log(`Admin ${email} ready (${remote ? 'remote' : 'local'}). Credentials saved to ${PASSWORD_FILE}`)
}

run()
