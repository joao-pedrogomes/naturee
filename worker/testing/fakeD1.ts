import { DatabaseSync, type SQLInputValue } from 'node:sqlite'
import fs from 'node:fs'
import path from 'node:path'
import type { Env } from '../env'

type Row = Record<string, unknown>

class FakeStatement {
  private values: SQLInputValue[] = []

  constructor(
    private readonly db: DatabaseSync,
    readonly sql: string,
  ) {}

  bind(...values: unknown[]): FakeStatement {
    this.values = values.map((value) => (value instanceof ArrayBuffer ? new Uint8Array(value) : value)) as SQLInputValue[]
    return this
  }

  async first<T = Row>(): Promise<T | null> {
    return (this.db.prepare(this.sql).get(...this.values) as T | undefined) ?? null
  }

  async all<T = Row>(): Promise<{ results: T[] }> {
    return { results: this.db.prepare(this.sql).all(...this.values) as T[] }
  }

  async run(): Promise<{ meta: { changes: number; last_row_id: number } }> {
    const info = this.db.prepare(this.sql).run(...this.values)
    return { meta: { changes: Number(info.changes), last_row_id: Number(info.lastInsertRowid) } }
  }
}

/** In-memory SQLite shaped like the slice of the D1 API the Worker uses. */
export function createFakeDb(): D1Database {
  const db = new DatabaseSync(':memory:')
  db.exec('PRAGMA foreign_keys = ON')
  const dir = path.resolve('migrations')
  for (const file of fs.readdirSync(dir).sort()) db.exec(fs.readFileSync(path.join(dir, file), 'utf8'))

  return {
    prepare: (sql: string) => new FakeStatement(db, sql),
    batch: async (statements: FakeStatement[]) => {
      db.exec('BEGIN')
      try {
        const out = []
        for (const statement of statements) out.push(await statement.run())
        db.exec('COMMIT')
        return out
      } catch (failure) {
        db.exec('ROLLBACK')
        throw failure
      }
    },
  } as unknown as D1Database
}

export function createTestEnv(overrides: Partial<Env> = {}): Env {
  return { DB: createFakeDb(), ASSETS: {} as Fetcher, ...overrides }
}

export function testContext(): ExecutionContext & { settled: () => Promise<void> } {
  const pending: Promise<unknown>[] = []
  return {
    waitUntil: (promise: Promise<unknown>) => void pending.push(promise),
    passThroughOnException: () => undefined,
    props: {},
    settled: async () => void (await Promise.all(pending)),
  } as unknown as ExecutionContext & { settled: () => Promise<void> }
}
