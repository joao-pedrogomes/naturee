import type { Env } from './env'

type CountRow = { count: number }

/** Counts one hit in a fixed window and reports whether it is still within the limit. */
export async function registerHit(
  env: Env,
  key: string,
  limit: number,
  windowSeconds: number,
  now = Date.now(),
): Promise<boolean> {
  const windowMs = windowSeconds * 1000
  const row = await env.DB.prepare(
    `INSERT INTO rate_limits (key, count, window_start) VALUES (?1, 1, ?2)
     ON CONFLICT(key) DO UPDATE SET
       count = CASE WHEN ?2 - window_start >= ?3 THEN 1 ELSE count + 1 END,
       window_start = CASE WHEN ?2 - window_start >= ?3 THEN ?2 ELSE window_start END
     RETURNING count`,
  )
    .bind(key, now, windowMs)
    .first<CountRow>()
  return (row?.count ?? 1) <= limit
}
